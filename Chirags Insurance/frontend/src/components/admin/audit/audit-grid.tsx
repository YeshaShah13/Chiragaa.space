"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";
import { Search, ShieldAlert, Eye, Filter, Download, Trash2, AlertOctagon, CheckSquare, Square, RefreshCw, X } from "lucide-react";
import { AuditDetailDrawer } from "@/components/admin/audit/audit-detail-drawer";

export function AuditGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearDays, setClearDays] = useState<string>("all");
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-audit", page, searchTerm],
    queryFn: () => adminApi.getAuditLogs({ page: page.toString(), search: searchTerm }),
  });

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Delete single log mutation
  const deleteSingleMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAuditLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      showNotification("Audit log deleted successfully");
      setSelectedIds((prev) => prev.filter((id) => id !== selectedAuditId));
    },
    onError: (err: any) => {
      showNotification(err?.response?.data?.message || "Failed to delete audit log", "error");
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => adminApi.bulkDeleteAuditLogs(ids),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      showNotification(res?.message || `Successfully deleted ${selectedIds.length} audit logs`);
      setSelectedIds([]);
    },
    onError: (err: any) => {
      showNotification(err?.response?.data?.message || "Failed to delete selected audit logs", "error");
    },
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: (days?: number) => adminApi.clearAuditLogs(days),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      showNotification(res?.message || "Audit logs cleared successfully");
      setIsClearModalOpen(false);
      setSelectedIds([]);
    },
    onError: (err: any) => {
      showNotification(err?.response?.data?.message || "Failed to clear audit logs", "error");
    },
  });

  const handleDeleteSingle = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this audit log record?")) {
      deleteSingleMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to permanently delete the ${selectedIds.length} selected audit log records?`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleClearConfirm = () => {
    const days = clearDays === "all" ? undefined : parseInt(clearDays, 10);
    clearAllMutation.mutate(days);
  };

  const handleSelectAll = () => {
    if (!data?.data) return;
    const currentIds = data.data.map((l) => l.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllCurrentSelected =
    data?.data &&
    data.data.length > 0 &&
    data.data.every((l) => selectedIds.includes(l.id));

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm overflow-hidden relative">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`px-4 py-3 border-b flex items-center justify-between text-sm font-medium animate-in fade-in duration-200 ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-gray-500 hover:text-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#E5E7EB] gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex items-center px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-medium rounded-lg transition-colors"
            title="Purge logs from database"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 border-b border-[#E5E7EB] z-10">
            <tr>
              <th className="px-4 py-4 w-10">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-gray-400 hover:text-gray-700 focus:outline-none"
                  title="Select all on current page"
                >
                  {isAllCurrentSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              </th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#111111] uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#111111] uppercase tracking-wider">User</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#111111] uppercase tracking-wider">Action & Module</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#111111] uppercase tracking-wider">Record / Description</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#111111] uppercase tracking-wider">IP Address</th>
              <th className="px-4 py-4 text-[13px] font-semibold text-[#111111] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded w-28"></div></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded w-36"></div></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded w-44"></div></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"></td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <ShieldAlert className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-lg font-medium text-gray-900">No activity logs found</p>
                  <p className="text-sm">Database audit trail is currently empty or matches no filters.</p>
                </td>
              </tr>
            ) : (
              data?.data.map((log) => {
                const isSelected = selectedIds.includes(log.id);
                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                    onClick={() => setSelectedAuditId(log.id)}
                  >
                    <td className="px-4 py-4" onClick={(e) => handleToggleSelect(log.id, e)}>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-700 focus:outline-none"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-semibold text-[#111111]">
                        {new Date(log.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[12px] text-[#666666]">
                        {new Date(log.created_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-medium text-[#111111]">{log.user?.name || "System Action"}</div>
                      {log.user?.email && <div className="text-[12px] text-[#666666]">{log.user.email}</div>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full ${
                            log.action.includes("CREATE")
                              ? "bg-green-100 text-green-800"
                              : log.action.includes("UPDATE")
                              ? "bg-blue-100 text-blue-800"
                              : log.action.includes("DELETE")
                              ? "bg-red-100 text-red-800"
                              : log.action.includes("LOGIN_FAILED")
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>
                      <div className="text-[13px] text-[#666666] font-medium">{log.module}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[14px] font-medium text-[#111111]">
                        {log.entity_name || `Record #${log.record_id || "-"}`}
                      </div>
                      <div className="text-[13px] text-[#666666] truncate max-w-[280px]">
                        {log.description || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[13px] text-[#666666] font-mono">
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedAuditId(log.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSingle(log.id, e)}
                        disabled={deleteSingleMutation.isPending}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                        title="Delete Log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-gray-50 gap-3">
        <div className="text-sm text-gray-500">
          {data && data.total > 0 ? (
            <>
              Showing <span className="font-medium">{(data.current_page - 1) * data.per_page + 1}</span> to{" "}
              <span className="font-medium">{Math.min(data.current_page * data.per_page, data.total)}</span> of{" "}
              <span className="font-medium">{data.total}</span> audit logs
            </>
          ) : (
            "0 audit logs"
          )}
        </div>
        {data && data.last_page > 1 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.last_page}
              className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Clear Logs Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-100 rounded-full text-rose-600">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Clear Audit Logs</h3>
                <p className="text-[13px] text-gray-500">Permanently delete logs from the database.</p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Cleanup Scope:
                </label>
                <select
                  value={clearDays}
                  onChange={(e) => setClearDays(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">Delete All Audit Logs (Entire History)</option>
                  <option value="30">Delete Logs Older Than 30 Days</option>
                  <option value="60">Delete Logs Older Than 60 Days</option>
                  <option value="90">Delete Logs Older Than 90 Days</option>
                  <option value="180">Delete Logs Older Than 180 Days</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 text-xs text-rose-800 leading-relaxed">
                <strong>Warning:</strong> This operation permanently removes audit log records from the database. This action cannot be reversed.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearConfirm}
                disabled={clearAllMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
              >
                {clearAllMutation.isPending ? "Clearing..." : "Confirm & Clear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedAuditId && (
        <AuditDetailDrawer
          auditId={selectedAuditId}
          onClose={() => setSelectedAuditId(null)}
        />
      )}
    </div>
  );
}
