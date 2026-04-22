import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Plus, LayoutGrid, Users, UserMinus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { cn } from "@/lib/utils";

import { getAllClasses, getHomeroomAssignments, type HomeroomAssignment } from "../services/homeroom-service";
import { AssignHomeroomDialog } from "../components/assign-homeroom-dialog";
import { RemoveHomeroomDialog } from "../components/remove-homeroom-dialog";

type GradeFilter = "all" | "X" | "XI" | "XII";
type StatusFilter = "all" | "assigned" | "unassigned";

export function HomeroomPage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ name: string; teacherId?: string; teacherName?: string } | null>(null);

  const { data: allClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ["all-classes"],
    queryFn: getAllClasses,
    staleTime: 1000 * 60 * 10,
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ["homeroom-assignments"],
    queryFn: getHomeroomAssignments,
    staleTime: 1000 * 60 * 2,
  });

  const isLoading = loadingClasses || loadingAssignments;

  const assignmentMap = useMemo(() => {
    const m = new Map<string, HomeroomAssignment>();
    assignments.forEach((a) => m.set(a.class_name, a));
    return m;
  }, [assignments]);

  const rows = useMemo(() => {
    return allClasses.map((cls) => ({
      class_name: cls,
      assignment: assignmentMap.get(cls) ?? null,
    }));
  }, [allClasses, assignmentMap]);

  const filteredRows = useMemo(() => {
    return rows.filter(({ class_name, assignment }) => {
      const matchSearch = class_name.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      let matchGrade = true;
      if (gradeFilter === "XII") matchGrade = class_name.startsWith("XII");
      else if (gradeFilter === "XI") matchGrade = class_name.startsWith("XI") && !class_name.startsWith("XII");
      else if (gradeFilter === "X") matchGrade = class_name.startsWith("X") && !class_name.startsWith("XI") && !class_name.startsWith("XII");
      if (!matchGrade) return false;

      if (statusFilter === "assigned") return !!assignment;
      if (statusFilter === "unassigned") return !assignment;

      return true;
    });
  }, [rows, search, gradeFilter, statusFilter]);

  const assignedCount = useMemo(() => rows.filter((r) => r.assignment).length, [rows]);
  const unassignedCount = rows.length - assignedCount;

  const openAssign = (className: string, currentTeacherId?: string) => {
    setSelectedClass({ name: className, teacherId: currentTeacherId });
    setAssignOpen(true);
  };

  const openRemove = (className: string, teacherName: string) => {
    setSelectedClass({ name: className, teacherName });
    setRemoveOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Wali Kelas</h1>
        <p className="text-muted-foreground mt-1 text-sm">Kelola penugasan wali kelas untuk setiap rombongan belajar.</p>
      </motion.div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="TOTAL KELAS" count={rows.length} icon={LayoutGrid} color="blue" isActive={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
        <StatCard label="SUDAH DITUGASKAN" count={assignedCount} icon={Users} color="emerald" isActive={statusFilter === "assigned"} onClick={() => setStatusFilter("assigned")} />
        <StatCard label="BELUM DITUGASKAN" count={unassignedCount} icon={UserMinus} color="orange" isActive={statusFilter === "unassigned"} onClick={() => setStatusFilter("unassigned")} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <CardTitle className="text-2xl font-bold dark:text-white">Daftar Kelas</CardTitle>

              {/* Bagian Filter & Search Baru */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <ToggleGroup type="single" value={gradeFilter} onValueChange={(v) => v && setGradeFilter(v as GradeFilter)} className="bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
                  {["all", "X", "XI", "XII"].map((g) => (
                    <ToggleGroupItem
                      key={g}
                      value={g}
                      className={cn(
                        "rounded-xl px-5 py-2 text-[10px] font-black transition-all duration-300",
                        gradeFilter === g ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
                      )}
                    >
                      {g === "all" ? "SEMUA" : `KELAS ${g}`}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    placeholder="Cari kelas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-full bg-slate-50 dark:bg-slate-800 border-none h-11 pl-11 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white dark:placeholder:text-slate-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="p-8 text-center">
                  <TableSkeleton columnCount={4} rowCount={5} />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="border-none">
                      <TableHead className="pl-10 py-5 font-bold uppercase text-[10px] tracking-widest text-slate-500">Kelas / Rombel</TableHead>
                      <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest text-slate-500">Tingkat</TableHead>
                      <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest text-slate-500">Wali Kelas</TableHead>
                      <TableHead className="text-right pr-10 py-5 font-bold uppercase text-[10px] tracking-widest text-slate-500">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map(({ class_name, assignment }) => (
                      <TableRow key={class_name} className="transition-colors border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="pl-10 py-6 font-bold text-slate-700 dark:text-slate-200">{class_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold border-slate-200 dark:border-slate-700 dark:text-slate-300">
                            {class_name.split(" ")[0]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">
                                {assignment.teacher_name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{assignment.teacher_name}</span>
                            </div>
                          ) : (
                            <span className="text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-xl text-[10px] font-black uppercase">Belum Ditugaskan</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <div className="flex justify-end gap-2">
                            {assignment ? (
                              <>
                                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => openAssign(class_name, assignment.teacher_id)}>
                                  <Pencil className="h-4 w-4 mr-2" /> Ganti
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => openRemove(class_name, assignment.teacher_name)}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl font-black shadow-lg shadow-blue-100 dark:shadow-none text-white transition-all active:scale-95" onClick={() => openAssign(class_name)}>
                                <Plus className="h-4 w-4 mr-2" /> Tugaskan
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {selectedClass && (
        <>
          <AssignHomeroomDialog open={assignOpen} onOpenChange={setAssignOpen} className={selectedClass.name} currentTeacherId={selectedClass.teacherId} />
          <RemoveHomeroomDialog open={removeOpen} onOpenChange={setRemoveOpen} className={selectedClass.name} teacherName={selectedClass.teacherName ?? ""} />
        </>
      )}
    </div>
  );
}

function StatCard({ label, count, icon: Icon, color, isActive, onClick }: any) {
  const iconBgColors: any = {
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
    orange: "bg-orange-600 text-white",
  };

  const activeCardStyles: any = {
    blue: "border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20 shadow-[0_20px_50px_rgba(59,130,246,0.15)]",
    emerald: "border-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20 shadow-[0_20px_50px_rgba(16,185,129,0.15)]",
    orange: "border-orange-500 ring-4 ring-orange-50 dark:ring-orange-900/20 shadow-[0_20px_50px_rgba(249,115,22,0.15)]",
  };

  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} onClick={onClick}>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 border-2 rounded-[2.5rem] bg-white dark:bg-slate-900",
          isActive ? activeCardStyles[color] : "border-transparent shadow-sm hover:border-slate-200 dark:hover:border-slate-700",
        )}
      >
        <CardContent className="p-8 flex items-center gap-6">
          <div className={cn("p-5 rounded-2xl relative shadow-lg", iconBgColors[color])}>
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
            <Icon className="h-7 w-7 relative z-10" />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{count}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
