"use client";

import { useState, useMemo } from "react";
import { Vehicle } from "@/types/vehicle";
import { Search, SlidersHorizontal, RefreshCcw } from "lucide-react";
import { TaxKpiCards } from "./tax-kpi-cards";
import { TaxTable } from "./tax-table";
import { TaxDetailPanel } from "./tax-detail-panel";

interface TaxDashboardProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  refetch: () => void;
}

export function TaxDashboard({ vehicles, isLoading, refetch }: TaxDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Filter and Sort Logic
  const processedVehicles = useMemo(() => {
    let result = [...vehicles];

    // Status Filter
    if (statusFilter === "ALL") {
      // By default show only vehicles that have tax up to date recorded
      result = result.filter(v => v.tax?.tax_up_to_date && v.tax_status !== 'DUE');
    } else if (statusFilter === "NOT_AVAILABLE" || statusFilter === "DUE") {
      // Show vehicles with no tax up to date recorded
      result = result.filter(v => !v.tax?.tax_up_to_date || v.tax_status === 'DUE');
    } else {
      result = result.filter(v => v.tax_status === statusFilter);
    }

    // Frequency Filter
    if (frequencyFilter !== "ALL") {
      if (frequencyFilter === "YEARLY") {
        result = result.filter(v => v.tax?.yearly);
      } else if (frequencyFilter === "HALF_YEARLY") {
        result = result.filter(v => v.tax?.half_yearly);
      }
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.vehicle_number.toLowerCase().includes(q) ||
        v.owner_name.toLowerCase().includes(q) ||
        (v.tax?.receipt_no && v.tax.receipt_no.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      if (sortKey === "vehicle_number") {
        aVal = a.vehicle_number;
        bVal = b.vehicle_number;
      } else if (sortKey === "tax_to") {
        aVal = a.tax?.tax_up_to_date || "0000-00-00";
        bVal = b.tax?.tax_up_to_date || "0000-00-00";
      } else if (sortKey === "amount") {
        const getT = (t?: Vehicle['tax']) => (parseFloat(t?.amount?.toString() || "0") + parseFloat(t?.penalty?.toString() || "0") + parseFloat(t?.interest?.toString() || "0"));
        aVal = getT(a.tax);
        bVal = getT(b.tax);
      } else if (sortKey === "payment_date") {
        aVal = a.tax?.tax_paid_date || "0000-00-00";
        bVal = b.tax?.tax_paid_date || "0000-00-00";
      } else if (sortKey === "status") {
        // Custom priority logic: Expired > Due > Expiring Soon > Active
        const priority = { 'EXPIRED': 1, 'DUE': 2, 'EXPIRING_SOON': 3, 'ACTIVE': 4, 'UNKNOWN': 5 };
        aVal = priority[a.tax_status || 'UNKNOWN'] || 5;
        bVal = priority[b.tax_status || 'UNKNOWN'] || 5;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, statusFilter, frequencyFilter, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setFrequencyFilter("ALL");
    setSortKey("status");
    setSortDirection("asc");
  };

  return (
    <div className="w-full">
      
      {/* KPIs */}
      <TaxKpiCards vehicles={vehicles} />

      {/* Filters & Search */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search vehicle number, owner, or receipt..."
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
            <option value="ALL">All Statuses (With Tax Date)</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="NOT_AVAILABLE">Not Available / Tax Due</option>
          </select>

          <select 
            className="border border-[#E5E5E5] rounded-[8px] px-3 py-2 text-[14px] text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
          >
            <option value="ALL">All Frequencies</option>
            <option value="YEARLY">Yearly</option>
            <option value="HALF_YEARLY">Half Yearly</option>
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
      <TaxTable 
        vehicles={processedVehicles}
        isLoading={isLoading}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onVehicleSelect={setSelectedVehicle}
      />

      {/* Detail Panel */}
      {selectedVehicle && (
        <TaxDetailPanel 
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

    </div>
  );
}
