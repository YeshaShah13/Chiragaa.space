"use client";

import { useState, useMemo } from "react";
import { Vehicle } from "@/types/vehicle";
import { Search, SlidersHorizontal } from "lucide-react";
import { PermitKpiCards } from "./permit-kpi-cards";
import { PermitTable } from "./permit-table";
import { PermitDetailPanel } from "./permit-detail-panel";

interface PermitDashboardProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  refetch: () => void;
}

export function PermitDashboard({ vehicles, isLoading, refetch }: PermitDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Filter and Sort Logic
  const processedVehicles = useMemo(() => {
    let result = [...vehicles];

    // Status Filter
    if (statusFilter === "ALL") {
      // By default show only vehicles with an up to date permit record
      result = result.filter((v) => v.permit?.expiry_date && v.permit_status !== "NOT_AVAILABLE");
    } else if (statusFilter === "NOT_AVAILABLE") {
      result = result.filter((v) => !v.permit?.expiry_date || v.permit_status === "NOT_AVAILABLE");
    } else {
      result = result.filter((v) => v.permit_status === statusFilter);
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.vehicle_number.toLowerCase().includes(q) ||
          v.owner_name.toLowerCase().includes(q) ||
          (v.permit?.permit_number && v.permit.permit_number.toLowerCase().includes(q)) ||
          (v.permit?.receipt_no && v.permit.receipt_no.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      if (sortKey === "vehicle_number") {
        aVal = a.vehicle_number;
        bVal = b.vehicle_number;
      } else if (sortKey === "issue_date") {
        aVal = a.permit?.issue_date || "0000-00-00";
        bVal = b.permit?.issue_date || "0000-00-00";
      } else if (sortKey === "expiry_date") {
        aVal = a.permit?.expiry_date || "0000-00-00";
        bVal = b.permit?.expiry_date || "0000-00-00";
      } else if (sortKey === "amount") {
        aVal = parseFloat(a.permit?.amount?.toString() || "0");
        bVal = parseFloat(b.permit?.amount?.toString() || "0");
      } else if (sortKey === "status") {
        // Priority: EXPIRED > EXPIRING_SOON > NOT_AVAILABLE > ACTIVE
        const priority = { EXPIRED: 1, EXPIRING_SOON: 2, NOT_AVAILABLE: 3, ACTIVE: 4 };
        aVal = priority[a.permit_status || "NOT_AVAILABLE"] || 5;
        bVal = priority[b.permit_status || "NOT_AVAILABLE"] || 5;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, statusFilter, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSortKey("status");
    setSortDirection("asc");
  };

  return (
    <div className="w-full">
      {/* KPIs */}
      <PermitKpiCards vehicles={vehicles} />

      {/* Filters & Search */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search vehicle number, owner, permit number or receipt..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 border-r border-[#E5E5E5] pr-3 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#777777]" />
            <span className="text-[14px] font-medium text-[#111111]">Filters</span>
          </div>

          <select
            className="border border-[#E5E5E5] rounded-[8px] px-3 py-2 text-[14px] text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses (With Permit Date)</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="NOT_AVAILABLE">Not Available</option>
          </select>

          <button
            onClick={handleReset}
            className="px-4 py-2 border border-[#E5E5E5] rounded-[8px] text-[14px] font-medium text-[#111111] hover:bg-slate-50 transition-colors shrink-0"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <PermitTable
        vehicles={processedVehicles}
        isLoading={isLoading}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onVehicleSelect={setSelectedVehicle}
      />

      {/* Detail Panel */}
      {selectedVehicle && (
        <PermitDetailPanel
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
  );
}
