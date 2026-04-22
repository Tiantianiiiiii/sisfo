import { useAuditLogs } from "./hooks/use-audit-logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, History, Search } from "lucide-react";
import { TableRowsSkeleton } from "@/components/ui/table-skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 1. FUNGSI WARNA BADGE (Varian Biru)
  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (act.includes("UPDATE")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (act.includes("DELETE") || act.includes("SUSPEND")) return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const filteredLogs = logs?.filter(
    (log) => log.actor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || log.action.toLowerCase().includes(searchQuery.toLowerCase()) || log.table_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil((filteredLogs?.length || 0) / pageSize);
  const paginatedLogs = filteredLogs?.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-blue-900">
            <History className="h-8 w-8 text-blue-600" />
            Audit Logs
          </h1>
          <p className="text-slate-500 text-sm font-medium">Monitoring aktivitas sistem e-PKL secara real-time.</p>
        </div>
      </div>

      <Card className="border-none shadow-md shadow-blue-900/5 ring-1 ring-blue-100">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-blue-50">
          <CardTitle className="text-lg font-bold text-blue-900">Aktivitas Sistem</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
            <input
              type="text"
              placeholder="Cari aktor atau aksi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="pl-10 pr-4 py-2 text-sm border border-blue-100 rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner bg-blue-50/30"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="rounded-xl border border-blue-50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-blue-50/50">
                <TableRow className="hover:bg-transparent border-b border-blue-50">
                  <TableHead className="font-bold text-blue-800">Waktu</TableHead>
                  <TableHead className="font-bold text-blue-800">Actor</TableHead>
                  <TableHead className="font-bold text-blue-800">Action</TableHead>
                  <TableHead className="font-bold text-blue-800">Target</TableHead>
                  <TableHead className="font-bold text-blue-800 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRowsSkeleton columnCount={5} rowCount={10} />
                ) : (
                  paginatedLogs?.map((log) => (
                    <TableRow key={log.id} className="hover:bg-blue-50/30 transition-colors group border-b border-blue-50/50">
                      <TableCell className="py-4">
                        <div className="font-bold text-blue-900">{format(new Date(log.created_at), "dd MMM yyyy", { locale: id })}</div>
                        <div className="text-[10px] text-blue-400 font-mono">{format(new Date(log.created_at), "HH:mm:ss")} WIB</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] text-white font-black shadow-sm ring-2 ring-blue-100">{(log.actor?.full_name || "A").substring(0, 2).toUpperCase()}</div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-700">{log.actor?.full_name || "System"}</span>
                            <span className="text-[10px] text-blue-500 font-medium tracking-tight">Staff Administrator</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} font-black px-3 py-1 rounded-md text-[10px] border shadow-sm`} variant="outline">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-[10px] text-blue-600 tracking-tighter uppercase">{log.table_name}</span>
                          <span className="text-[11px] font-mono text-slate-400 group-hover:text-blue-400 transition-colors">#{log.record_id.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-block max-w-[150px] truncate text-[10px] font-mono bg-blue-50/50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                          {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 4. PAGINATION (Nuansa Biru) */}
          {!isLoading && (filteredLogs?.length || 0) > 0 && (
            <div className="flex items-center justify-between py-6">
              <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Total {filteredLogs?.length} Log Terdeteksi</p>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-9 w-9 rounded-full border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-md shadow-blue-200">
                  {page + 1} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-9 w-9 rounded-full border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
