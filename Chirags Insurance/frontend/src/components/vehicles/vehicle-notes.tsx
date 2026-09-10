"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { FileText, Save, Loader2, CheckCircle2, AlertCircle, Calendar, Shield, CreditCard, Building, Info } from "lucide-react";

interface VehicleNotesProps {
  vehicle: Vehicle;
}

export function VehicleNotes({ vehicle }: VehicleNotesProps) {
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState(vehicle.remarks || "");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateRemarksMutation = useMutation({
    mutationFn: async (newRemarks: string) => {
      const response = await apiClient.put(`/vehicles/view?id=${vehicle.id}`, {
        ...vehicle,
        remarks: newRemarks,
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg("Notes & Remarks updated successfully!");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["vehicle", String(vehicle.id)] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || "Failed to update remarks.");
      setSuccessMsg(null);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRemarksMutation.mutate(remarks);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 mt-[20px]">
      {/* Primary Notes & Remarks Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[24px]">
        <div className="flex items-center justify-between mb-[18px]">
          <div className="flex items-center">
            <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
            <h3 className="text-[15px] font-semibold text-[#111111]">Vehicle Remarks & Notes</h3>
          </div>
          <span className="text-[12px] text-[#666666]">
            Last Updated: {formatDate(vehicle.updated_at)}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#333333] uppercase tracking-wide mb-2">
              General Remarks / Special Instructions
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter special remarks, driver instructions, service records, or compliance notes for this vehicle..."
              className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#111111] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123B6D] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateRemarksMutation.isPending || remarks === (vehicle.remarks || "")}
              className="bg-[#123B6D] hover:bg-[#0c2849] text-white font-medium text-[13px] h-10 px-5 rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              {updateRemarksMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Notes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Two Column Supplementary Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financing & Hypothecation Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[24px]">
          <div className="flex items-center mb-[18px]">
            <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
            <h3 className="text-[15px] font-semibold text-[#111111]">Financing & HPA Details</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center text-[13px] text-[#666666]">
                <Building className="w-4 h-4 mr-2 text-[#123B6D]" />
                <span>HPA With (Hypothecation)</span>
              </div>
              <span className="text-[13px] font-semibold text-[#111111] text-right">
                {vehicle.hpa_with || "None / Free"}
              </span>
            </div>

            <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center text-[13px] text-[#666666]">
                <CreditCard className="w-4 h-4 mr-2 text-[#123B6D]" />
                <span>Vehicle Group</span>
              </div>
              <span className="text-[13px] font-semibold text-[#111111] text-right">
                {vehicle.group || "Standard"}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center text-[13px] text-[#666666]">
                <Calendar className="w-4 h-4 mr-2 text-[#123B6D]" />
                <span>Registration Date</span>
              </div>
              <span className="text-[13px] font-semibold text-[#111111] text-right">
                {formatDate(vehicle.registration_date)}
              </span>
            </div>
          </div>
        </div>

        {/* System & Compliance Summary Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[24px]">
          <div className="flex items-center mb-[18px]">
            <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
            <h3 className="text-[15px] font-semibold text-[#111111]">Vehicle Summary Notes</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center text-[13px] text-[#666666]">
                <Info className="w-4 h-4 mr-2 text-[#123B6D]" />
                <span>System Status</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {vehicle.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center text-[13px] text-[#666666]">
                <Shield className="w-4 h-4 mr-2 text-[#123B6D]" />
                <span>Active Documents Attached</span>
              </div>
              <span className="text-[13px] font-semibold text-[#111111] text-right">
                {vehicle.documents?.length || 0} files
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center text-[13px] text-[#666666]">
                <Calendar className="w-4 h-4 mr-2 text-[#123B6D]" />
                <span>Record Created</span>
              </div>
              <span className="text-[13px] font-semibold text-[#111111] text-right">
                {formatDate(vehicle.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
