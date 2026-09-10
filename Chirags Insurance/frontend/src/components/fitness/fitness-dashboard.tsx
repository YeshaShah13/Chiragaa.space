"use client";

import { useState, useMemo } from "react";
import { Vehicle } from "@/types/vehicle";
import { Search, SlidersHorizontal, RefreshCcw } from "lucide-react";
import { FitnessKpiCards } from "./fitness-kpi-cards";
import { FitnessTable } from "./fitness-table";
import { FitnessDetailPanel } from "./fitness-detail-panel";

interface FitnessDashboardProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  refetch: () => void;
}

export function FitnessDashboard({ vehicles, isLoading, refetch }: FitnessDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Extract unique types and classes for filters
  const { uniqueTypes, uniqueClasses } = useMemo(() => {
    const types = new Set<string>();
    const classes = new Set<string>();
    
    vehicles.forEach(v => {
      // @ts-ignore
      if (v.vehicleClass?.type) types.add(v.vehicleClass.type);
      // @ts-ignore
      if (v.vehicleClass?.name) classes.add(v.vehicleClass.name);
    });
    
    return {
      uniqueTypes: Array.from(types).sort(),
      uniqueClasses: Array.from(classes).sort()
    };
  }, [vehicles]);

  // Filter and Sort Logic
  const processedVehicles = useMemo(() => {
    let result = [...vehicles];

    // Status Filter
    if (statusFilter === "ALL") {
      // By default show only vehicles with an up to date fitness record
      result = result.filter(v => v.fitness?.expiry_date && v.fitness_status !== 'NOT_AVAILABLE');
    } else if (statusFilter === "NOT_AVAILABLE") {
      result = result.filter(v => !v.fitness?.expiry_date || v.fitness_status === 'NOT_AVAILABLE');
    } else {
      result = result.filter(v => v.fitness_status === statusFilter);
    }

    // Type Filter
    if (typeFilter !== "ALL") {
      // @ts-ignore
      result = result.filter(v => v.vehicleClass?.type === typeFilter);
    }

    // Class Filter
    if (classFilter !== "ALL") {
      // @ts-ignore
      result = result.filter(v => v.vehicleClass?.name === classFilter);
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.vehicle_number.toLowerCase().includes(q) ||
        v.owner_name.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      if (sortKey === "vehicle_number") {
        aVal = a.vehicle_number;
        bVal = b.vehicle_number;
      } else if (sortKey === "fitness_from") {
        aVal = a.fitness?.issue_date || "0000-00-00";
        bVal = b.fitness?.issue_date || "0000-00-00";
      } else if (sortKey === "fitness_to") {
        aVal = a.fitness?.expiry_date || "0000-00-00";
        bVal = b.fitness?.expiry_date || "0000-00-00";
      } else if (sortKey === "status") {
        // Custom priority logic: Expired > Expiring Soon > Active > Not Available
        const priority: Record<string, number> = { 'EXPIRED': 1, 'EXPIRING_SOON': 2, 'ACTIVE': 3, 'NOT_AVAILABLE': 4, 'UNKNOWN': 5 };
        aVal = priority[a.fitness_status || 'UNKNOWN'] || 5;
        bVal = priority[b.fitness_status || 'UNKNOWN'] || 5;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, statusFilter, typeFilter, classFilter, sortKey, sortDirection]);

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
    setTypeFilter("ALL");
    setClassFilter("ALL");
    setSortKey("status");
    setSortDirection("asc");
  };

  return (
    <div className="w-full">
      
      {/* KPIs */}
      <FitnessKpiCards vehicles={vehicles} />

      {/* Filters & Search */}
      <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search vehicle number or owner name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <option value="ALL">All Statuses (With Fitness Date)</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="NOT_AVAILABLE">Not Available</option>
          </select>

          <select 
            className="border border-[#E5E5E5] rounded-[8px] px-3 py-2 text-[14px] text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            {uniqueTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select 
            className="border border-[#E5E5E5] rounded-[8px] px-3 py-2 text-[14px] text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="ALL">All Classes</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button 
            onClick={handleReset}
            className="px-4 py-2 border border-[#E5E5E5] rounded-[8px] text-[14px] font-medium text-[#111111] hover:bg-slate-50 transition-colors shrink-0"
          >
            Reset Filters
          </button>
        </div>

      </div>

      {/* Table */}
      <FitnessTable 
        vehicles={processedVehicles}
        isLoading={isLoading}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onVehicleSelect={setSelectedVehicle}
      />

      {/* Detail Panel */}
      {selectedVehicle && (
        <FitnessDetailPanel 
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

    </div>
  );
}
