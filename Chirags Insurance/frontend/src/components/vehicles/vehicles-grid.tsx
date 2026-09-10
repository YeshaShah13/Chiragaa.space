"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Vehicle, PaginatedResponse, ApiResponse } from "@/types/vehicle";
import { Search, Download, ChevronLeft, ChevronRight, Eye, Edit2, Filter, ChevronUp, ChevronDown, Car, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function VehiclesGrid() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  
  // State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["vehicles", page, search, sortField, sortOrder, perPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        sort_by: sortField,
        sort_order: sortOrder,
      });
      if (search) params.append("search", search);
      
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Vehicle>>>(
        `/vehicles?${params.toString()}`
      );
      return response.data.data;
    },
    // @ts-ignore
    placeholderData: (previousData: any) => previousData,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortField("id");
        setSortOrder("desc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleExport = useCallback(() => {
    if (!data?.data) return;
    
    // Simple CSV export
    const headers = ["Vehicle No.", "Owner Name", "Phone", "Vehicle Type", "Status"];
    const csvData = data.data.map(v => [
      v.vehicle_number,
      v.owner_name,
      v.phone || "",
      v.vehicle_class?.name || "",
      v.status || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(str => `"${str}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  const vehicles = data?.data || [];
  const pagination = data;

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-30 transition-opacity"><ChevronUp className="w-4 h-4" /></div>;
    return sortOrder === "asc" 
      ? <ChevronUp className="w-4 h-4 ml-1 text-[#111111]" /> 
      : <ChevronDown className="w-4 h-4 ml-1 text-[#111111]" />;
  };

  if (isError) {
    return (
      <div className="rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] p-6 text-[#111111] flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-8 h-8 text-[#999999] mb-4" />
        <p className="font-medium">Error loading vehicles</p>
        <p className="text-sm text-[#777777] mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="relative w-full lg:w-[460px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#999999]" />
            <input
              type="text"
              placeholder="Search by Vehicle No, Owner, Phone..."
              className="flex h-[54px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 pl-11 text-[18px] text-[#111111] transition-colors focus:border-[#111111] focus:outline-none placeholder:text-[#999999]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex h-[54px] items-center justify-center rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-[18px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA]"
            >
              <Filter className="mr-2 h-4 w-4 text-[#777777]" />
              Filter
            </button>
            
            {isFilterOpen && (
              <div className="absolute left-0 top-[60px] z-20 w-[240px] rounded-[12px] border border-[#E5E5E5] bg-white p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="text-[14px] font-medium text-[#777777] mb-2 block uppercase tracking-wider">Status</label>
                    <select className="w-full h-[40px] rounded-md border border-[#E5E5E5] bg-white px-3 text-[16px] outline-none">
                      <option>All</option>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[14px] font-medium text-[#777777] mb-2 block uppercase tracking-wider">Vehicle Type</label>
                    <select className="w-full h-[40px] rounded-md border border-[#E5E5E5] bg-white px-3 text-[16px] outline-none">
                      <option>All</option>
                      <option>Truck</option>
                      <option>Bus</option>
                      <option>Car</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-[#E5E5E5] mt-4">
                    <button className="text-[16px] text-[#777777] hover:text-[#111111]">Clear</button>
                    <button className="rounded-md bg-[#111111] px-4 py-1.5 text-[16px] font-medium text-white">Apply Filters</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="flex h-[52px] w-full lg:w-auto items-center justify-center rounded-[10px] border border-[#E5E5E5] bg-white px-5 text-[18px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA]"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Table Area */}
      <div className="flex-1 w-full overflow-x-auto rounded-[12px] border border-[#E5E5E5]">
        <table className="w-full text-left text-[18px]">
          <thead className="bg-[#FAFAFA] text-[18px] font-semibold text-[#111111] border-b border-[#E5E5E5]">
            <tr className="h-[64px]">
              <th className="px-6 font-semibold group cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("vehicle_number")}>
                <div className="flex items-center">Vehicle No. {renderSortIcon("vehicle_number")}</div>
              </th>
              <th className="px-6 font-semibold group cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("owner_name")}>
                <div className="flex items-center">Owner Name {renderSortIcon("owner_name")}</div>
              </th>
              <th className="px-6 font-semibold group cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("phone")}>
                <div className="flex items-center">Phone {renderSortIcon("phone")}</div>
              </th>
              <th className="px-6 font-semibold whitespace-nowrap">
                Vehicle Type
              </th>
              <th className="px-6 font-semibold group cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort("status")}>
                <div className="flex items-center">Status {renderSortIcon("status")}</div>
              </th>
              <th className="px-6 font-semibold text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] bg-white">
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="h-[58px] animate-pulse">
                  <td className="px-6"><div className="h-4 bg-[#F2F2F2] rounded w-24"></div></td>
                  <td className="px-6"><div className="h-4 bg-[#F2F2F2] rounded w-32"></div></td>
                  <td className="px-6"><div className="h-4 bg-[#F2F2F2] rounded w-28"></div></td>
                  <td className="px-6"><div className="h-4 bg-[#F2F2F2] rounded w-20"></div></td>
                  <td className="px-6"><div className="h-4 bg-[#F2F2F2] rounded w-16"></div></td>
                  <td className="px-6 text-right"><div className="h-8 bg-[#F2F2F2] rounded w-20 inline-block"></div></td>
                </tr>
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((v) => (
                <tr key={v.id} className="h-[58px] group transition-colors hover:bg-[#FAFAFA]">
                  <td className="px-6 whitespace-nowrap">
                    <Link href={`/vehicles/view?id=${v.id}`} className="font-medium text-[#111111] hover:underline underline-offset-2">
                      {v.vehicle_number}
                    </Link>
                  </td>
                  <td className="px-6 text-[#111111] whitespace-nowrap">{v.owner_name}</td>
                  <td className="px-6 text-[#777777] whitespace-nowrap">{v.phone || "-"}</td>
                  <td className="px-6 text-[#777777] whitespace-nowrap">{v.vehicle_class?.name || "N/A"}</td>
                  <td className="px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {v.status === 'Active' ? (
                        <><div className="h-2 w-2 rounded-full bg-[#111111]" /><span className="text-[#111111] text-[16px] font-medium">Active</span></>
                      ) : v.status === 'Inactive' ? (
                        <><div className="h-2 w-2 rounded-full bg-[#999999]" /><span className="text-[#777777] text-[16px] font-medium">Inactive</span></>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-[#999999] px-2 py-0.5 text-[14px] font-medium text-[#777777]">
                          {v.status || "Expired"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/vehicles/view?id=${v.id}`}
                        className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-[#E5E5E5] hover:text-[#111111]"
                        title="View Vehicle"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {hasPermission('motor_management.edit') && (
                        <Link 
                          href={`/vehicles/edit?id=${v.id}`}
                          className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-[#E5E5E5] hover:text-[#111111]"
                          title="Edit Vehicle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="h-[400px]">
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAFAFA] mb-4">
                      <Car className="h-8 w-8 text-[#999999]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[22px] font-semibold text-[#111111] mb-2">
                      {search ? "No vehicles match your search" : "No vehicles found"}
                    </h3>
                    <p className="text-[18px] text-[#777777] max-w-[300px] mb-6">
                      {search 
                        ? "Try changing your search or clearing the filters."
                        : "Add a vehicle through Motor Entry to start managing your fleet."}
                    </p>
                    {search ? (
                      <button 
                        onClick={() => { setSearch(""); setSearchInput(""); }}
                        className="rounded-[10px] border border-[#E5E5E5] bg-white px-5 py-2.5 text-[18px] font-medium text-[#111111] hover:bg-[#FAFAFA]"
                      >
                        Clear Filters
                      </button>
                    ) : hasPermission('motor_management.create') ? (
                      <Link 
                        href="/vehicles/new"
                        className="rounded-[10px] bg-[#111111] px-6 py-2.5 text-[18px] font-medium text-white hover:bg-[#333333]"
                      >
                        + Add Vehicle
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && vehicles.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[18px] text-[#777777]">
            Showing <span className="font-medium text-[#111111]">{pagination.from || 0}</span>–<span className="font-medium text-[#111111]">{pagination.to || 0}</span> of <span className="font-medium text-[#111111]">{pagination.total}</span> vehicles
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[18px] text-[#777777]">
              <span>Rows per page</span>
              <select 
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="h-8 rounded-md border border-[#E5E5E5] bg-white px-2 py-1 text-[16px] text-[#111111] outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] text-[#777777] border border-[#E5E5E5] bg-white transition-colors hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center px-1">
                {/* Simplified page numbers for demo - normally you'd map the actual page range */}
                {[...Array(Math.min(5, pagination.last_page))].map((_, idx) => {
                  const pageNum = idx + 1; // Basic logic just to show 1 2 3 4 5
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`flex h-[36px] w-[36px] items-center justify-center rounded-[8px] text-[18px] transition-colors
                        ${page === pageNum 
                          ? "bg-[#111111] text-white font-medium" 
                          : "text-[#777777] hover:bg-[#FAFAFA]"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {pagination.last_page > 5 && <span className="px-2 text-[#999999]">...</span>}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                disabled={page === pagination.last_page || pagination.last_page === 0}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] text-[#777777] border border-[#E5E5E5] bg-white transition-colors hover:bg-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
