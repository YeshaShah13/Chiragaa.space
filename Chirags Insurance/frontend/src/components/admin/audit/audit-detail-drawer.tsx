"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";
import { 
  X, User, Clock, FileText, Monitor, CheckCircle, XCircle, 
  ArrowRight, Sparkles, Code2, AlertCircle, PlusCircle, Trash2, Edit3 
} from "lucide-react";

interface AuditDetailDrawerProps {
  auditId: number;
  onClose: () => void;
}

interface FieldDiff {
  key: string;
  label: string;
  oldVal: any;
  newVal: any;
  type: "changed" | "added" | "removed";
}

export function AuditDetailDrawer({ auditId, onClose }: AuditDetailDrawerProps) {
  const [viewMode, setViewMode] = useState<"diff" | "json">("diff");

  const { data: log, isLoading } = useQuery({
    queryKey: ["admin-audit", auditId],
    queryFn: () => adminApi.getAuditLog(auditId),
  });

  const safeJsonParse = (data: any) => {
    if (!data) return {};
    if (typeof data === "object") return data;
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  };

  const formatJson = (data: any) => {
    try {
      const obj = typeof data === "string" ? JSON.parse(data) : data;
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(data);
    }
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined || val === "") return "— (Empty)";
    if (typeof val === "boolean") return val ? "Yes / True" : "No / False";
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const getFieldLabel = (key: string): string => {
    const customLabels: Record<string, string> = {
      vehicle_number: "Vehicle / MMV No.",
      owner_name: "Owner / Vehicle Name",
      permanent_address: "Permanent Address",
      phone: "Phone Number",
      tractor_registration_date: "Tractor Reg. Date",
      registration_date: "Registration Date",
      horse_power: "Horse Power",
      chassis_number: "Chassis Number",
      engine_number: "Engine Number",
      hpa_with: "Financier (HPA)",
      troli_no: "Trolley Number",
      s_c_ind: "S/C Ind",
      uw: "Unladen Weight (UW)",
      rlw: "Registered Laden Weight (RLW)",
      plw: "Pay Load Weight (PLW)",
      cylinder: "Cylinders",
      make_id: "Vehicle Make",
      class_id: "Vehicle Class",
      model: "Model / Year",
      status: "Status",
      policy_number: "Policy Number",
      receipt_number: "Receipt Number",
      insurance_company_id: "Insurance Company",
      insurance_company_name: "Insurance Company",
      start_date: "Start Date",
      expiry_date: "Expiry Date",
      confirmation_number: "Confirmation Number",
      confirmation_date: "Confirmation Date",
      transfer_date: "Transfer Date",
      sum_insured: "Sum Insured (IDV)",
      od_tp_premium: "OD/TP Premium",
      trolley_amount: "Trolley Premium",
      other_amount: "Other Premium",
      service_tax: "Service Tax / GST",
      ncb: "No Claim Bonus (NCB)",
      total_premium: "Total Premium",
      is_active: "Active Status",
      remarks: "Remarks",
      group_name: "Group Name",
      group: "Group",
    };

    if (customLabels[key]) return customLabels[key];
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Flatten nested objects into dotted keys (e.g. tax.amount -> 'Tax > Amount')
  const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
    if (!obj || typeof obj !== "object") return {};
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        Object.assign(result, flattenObject(val, fullKey));
      } else {
        result[fullKey] = val;
      }
    }
    return result;
  };

  // Compute clean diffs
  const { diffs, actionType } = useMemo(() => {
    if (!log) return { diffs: [], actionType: "UNKNOWN" };

    const rawOld = safeJsonParse(log.old_values);
    const rawNew = safeJsonParse(log.new_values);

    const oldFlat = flattenObject(rawOld);
    const newFlat = flattenObject(rawNew);

    const hasOld = log.old_values && Object.keys(oldFlat).length > 0;
    const hasNew = log.new_values && Object.keys(newFlat).length > 0;

    const ignoredKeys = new Set(["id", "created_at", "updated_at", "deleted_at", "created_by", "updated_by", "remember_token"]);

    // Case 1: Created (No Old, only New)
    if (!hasOld && hasNew) {
      const createdList: FieldDiff[] = Object.entries(newFlat)
        .filter(([k, v]) => !ignoredKeys.has(k) && !k.endsWith(".id") && v !== null && v !== "" && v !== undefined)
        .map(([k, v]) => ({
          key: k,
          label: getFieldLabel(k.split(".").pop() || k),
          oldVal: null,
          newVal: v,
          type: "added",
        }));
      return { diffs: createdList, actionType: "CREATE" };
    }

    // Case 2: Deleted (Old exists, No New)
    if (hasOld && !hasNew) {
      const deletedList: FieldDiff[] = Object.entries(oldFlat)
        .filter(([k, v]) => !ignoredKeys.has(k) && !k.endsWith(".id") && v !== null && v !== "" && v !== undefined)
        .map(([k, v]) => ({
          key: k,
          label: getFieldLabel(k.split(".").pop() || k),
          oldVal: v,
          newVal: null,
          type: "removed",
        }));
      return { diffs: deletedList, actionType: "DELETE" };
    }

    // Case 3: Updated (Compare Old vs New)
    const allKeys = Array.from(new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)]));
    const resultDiffs: FieldDiff[] = [];

    for (const key of allKeys) {
      if (ignoredKeys.has(key) || key.endsWith(".id")) continue;

      const oldV = oldFlat[key];
      const newV = newFlat[key];

      const normOld = oldV === null || oldV === undefined ? "" : String(oldV).trim();
      const normNew = newV === null || newV === undefined ? "" : String(newV).trim();

      if (normOld !== normNew) {
        let type: "changed" | "added" | "removed" = "changed";
        if (!normOld && normNew) type = "added";
        else if (normOld && !normNew) type = "removed";

        resultDiffs.push({
          key,
          label: getFieldLabel(key.split(".").pop() || key),
          oldVal: oldV,
          newVal: newV,
          type,
        });
      }
    }

    return { diffs: resultDiffs, actionType: "UPDATE" };
  }, [log]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm transition-all">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-medium text-[#111111]">Audit Activity Details</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">#{auditId}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Recorded user activity and Before vs. After history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              <span className="text-sm">Loading activity logs...</span>
            </div>
          ) : log ? (
            <>
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center text-slate-500 mb-1">
                    <User className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Performed By</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm truncate">{log.user?.name || "System Action"}</div>
                  <div className="text-xs text-slate-500 truncate">{log.user?.email || "Automated Process"}</div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Timestamp</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {new Date(log.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center text-slate-500 mb-1">
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Action & Module</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    {log.action?.includes("CREATE") && <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    {log.action?.includes("UPDATE") && <Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                    {log.action?.includes("DELETE") && <Trash2 className="w-3.5 h-3.5 text-red-600" />}
                    <span>{log.action}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{log.module}</div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Monitor className="h-3.5 w-3.5 mr-1.5 text-slate-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">IP & Status</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="truncate">{log.ip_address || "127.0.0.1"}</span>
                    {log.status === "Success" ? (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                        <XCircle className="h-2.5 w-2.5 mr-0.5" /> Failed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate" title={log.user_agent}>
                    {log.user_agent || "System Client"}
                  </div>
                </div>
              </div>

              {/* Target Record Banner */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 bg-blue-100/80 rounded-lg text-blue-700 shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">Target Record</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {log.entity_name || `Record #${log.record_id || "N/A"}`}
                  </div>
                  {log.description && <div className="text-xs text-slate-600 mt-0.5">{log.description}</div>}
                </div>
              </div>

              {/* View Mode Toggle Header */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">Before & After Changes</h3>
                    {diffs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {diffs.length} field{diffs.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Toggle tabs */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setViewMode("diff")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        viewMode === "diff"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Clean Diff
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("json")}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        viewMode === "json"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 text-slate-600" />
                      Raw JSON
                    </button>
                  </div>
                </div>

                {/* Diff View */}
                {viewMode === "diff" ? (
                  <div className="space-y-3">
                    {diffs.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 bg-white">
                        {/* Table Column Titles */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <div className="sm:col-span-4">Field Name</div>
                          <div className="sm:col-span-4 text-rose-700">Before Change (Old)</div>
                          <div className="sm:col-span-4 text-emerald-700">After Change (New)</div>
                        </div>

                        {/* Diff Rows */}
                        {diffs.map((diff, index) => (
                          <div key={index} className="p-3.5 sm:px-4 sm:py-3.5 hover:bg-slate-50/70 transition-colors">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              {/* Field Column */}
                              <div className="sm:col-span-4">
                                <div className="text-xs font-semibold text-slate-900">{diff.label}</div>
                                <div className="text-[11px] font-mono text-slate-400 truncate">{diff.key}</div>
                              </div>

                              {/* Before Value Column */}
                              <div className="sm:col-span-4">
                                <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-900">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 sm:hidden mb-0.5">
                                    Before:
                                  </div>
                                  <div className="text-xs font-mono line-through text-rose-800 break-words">
                                    {formatValue(diff.oldVal)}
                                  </div>
                                </div>
                              </div>

                              {/* After Value Column */}
                              <div className="sm:col-span-4">
                                <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:hidden mb-0.5">
                                    After:
                                  </div>
                                  <div className="text-xs font-mono font-semibold text-emerald-900 break-words">
                                    {formatValue(diff.newVal)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* No field diffs */
                      <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                        <div className="text-sm font-semibold text-slate-800">No Field Modifications Detected</div>
                        <div className="text-xs text-slate-500 mt-1 max-w-sm">
                          The record was saved, but all data fields remained identical to prior values.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Raw JSON View */
                  <div className="space-y-4">
                    {log.old_values && (
                      <div className="border border-rose-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">Before Change (Old Values)</h4>
                        </div>
                        <div className="p-4 bg-slate-900 max-h-64 overflow-auto">
                          <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">{formatJson(log.old_values)}</pre>
                        </div>
                      </div>
                    )}

                    {log.new_values && (
                      <div className="border border-emerald-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">After Change (New Values)</h4>
                        </div>
                        <div className="p-4 bg-slate-900 max-h-64 overflow-auto">
                          <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">{formatJson(log.new_values)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
              Failed to load audit log details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
