"use client";

import { Vehicle } from "@/types/vehicle";
import { ArrowUpDown, ChevronRight, Eye, Edit } from "lucide-react";
import Link from "next/link";

interface PermitTableProps {
  vehicles: Vehicle[];
  onSort: (key: string) => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onVehicleSelect: (vehicle: Vehicle) => void;
  isLoading: boolean;
}

export function PermitTable({
  vehicles,
  onSort,
  sortKey,
  sortDirection,
  onVehicleSelect,
  isLoading,
}: PermitTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ACTIVE
          </span>
        );
      case "EXPIRING_SOON":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            EXPIRING SOON
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
            EXPIRED
          </span>
        );
      case "NOT_AVAILABLE":
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            NOT AVAILABLE
          </span>
        );
    }
  };

  const formatCurrency = (amount?: number | string) => {
    if (amount === undefined || amount === null || amount === "") return "—";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const SortHeader = ({
    label,
    sortKeyName,
  }: {
    label: string;
    sortKeyName: string;
  }) => (
    <th
      className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors select-none"
      onClick={() => onSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`w-3 h-3 ${
            sortKey === sortKeyName ? "text-[#111111]" : "text-slate-300"
          }`}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-[#E5E5E5]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <SortHeader label="Vehicle" sortKeyName="vehicle_number" />
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider">
                Permit No.
              </th>
              <SortHeader label="Issue Date" sortKeyName="issue_date" />
              <SortHeader label="Expiry Date" sortKeyName="expiry_date" />
              <SortHeader label="Amount" sortKeyName="amount" />
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider">
                Receipt No.
              </th>
              <SortHeader label="Status" sortKeyName="status" />
              <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#777777] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E5E5]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-slate-100 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 bg-slate-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-8 bg-slate-200 rounded w-16 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-[15px] font-medium text-slate-500"
                >
                  No vehicles matching the selected permit criteria.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  onClick={() => onVehicleSelect(v)}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-[14px] text-[#111111] group-hover:text-blue-600 transition-colors">
                      {v.vehicle_number}
                    </div>
                    <div className="text-[12px] text-[#777777]">
                      {v.vehicle_class?.name || "Vehicle"} {v.model ? `• ${v.model}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#333333] font-medium">
                    {v.owner_name}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#333333]">
                    {v.permit?.permit_number ? (
                      <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[12px]">
                        {v.permit.permit_number}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#555555]">
                    {formatDate(v.permit?.issue_date)}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">
                    {formatDate(v.permit?.expiry_date)}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#111111]">
                    {formatCurrency(v.permit?.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#555555]">
                    {v.permit?.receipt_no || "—"}
                  </td>
                  <td className="px-4 py-3.5">{getStatusBadge(v.permit_status)}</td>
                  <td
                    className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onVehicleSelect(v)}
                      className="inline-flex items-center justify-center p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View Permit Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/vehicles/edit?id=${v.id}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Edit Vehicle & Permit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-[#E5E5E5] bg-[#F8FAFC] flex justify-between items-center text-[13px] text-[#777777]">
        <span>
          Showing <strong>{vehicles.length}</strong> vehicle permit records
        </span>
        <span className="text-[12px] text-slate-500">
          Click any vehicle row to view full details
        </span>
      </div>
    </div>
  );
}
