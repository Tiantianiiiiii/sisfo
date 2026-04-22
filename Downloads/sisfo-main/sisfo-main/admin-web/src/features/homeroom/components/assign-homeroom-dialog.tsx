import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getActiveTeachers, upsertHomeroom } from "../services/homeroom-service";

interface AssignHomeroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  currentTeacherId?: string;
  id?: number; // Referensi database
}

export function AssignHomeroomDialog({ open, onOpenChange, className, currentTeacherId, id }: AssignHomeroomDialogProps) {
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState(currentTeacherId ?? "");
  const [editableClassName, setEditableClassName] = useState(className ?? "");

  useEffect(() => {
    if (open) {
      setSelectedTeacherId(currentTeacherId ?? "");
      setEditableClassName(className ?? "");
    }
  }, [currentTeacherId, className, open]);

  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ["active-teachers"],
    queryFn: getActiveTeachers,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      // Debugging: Cek di console (F12) apakah ID muncul atau undefined
      console.log("Saving data with ID:", id, "Class:", editableClassName);
      return upsertHomeroom(editableClassName, selectedTeacherId, id);
    },
    onSuccess: () => {
      toast.success(`Berhasil memperbarui data ${editableClassName}.`);
      queryClient.invalidateQueries({ queryKey: ["homeroom-assignments"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      console.error("Save error:", err);
      toast.error(err.message ?? "Gagal menyimpan wali kelas.");
    },
  });

  const isEdit = Boolean(id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ganti Wali Kelas" : "Tugaskan Wali Kelas"}</DialogTitle>
          <DialogDescription>{isEdit ? `Ubah data wali kelas untuk ${editableClassName}.` : `Pilih guru yang akan menjadi wali kelas ${editableClassName}.`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="class-input">Kelas / Rombel</Label>
            <Input id="class-input" value={editableClassName} onChange={(e) => setEditableClassName(e.target.value)} placeholder="Contoh: XII PPL 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher-select">Guru Wali Kelas</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId} disabled={loadingTeachers}>
              <SelectTrigger id="teacher-select">
                <SelectValue placeholder={loadingTeachers ? "Memuat guru..." : "Pilih guru..."} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={() => save()} disabled={!selectedTeacherId || !editableClassName || isPending}>
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
