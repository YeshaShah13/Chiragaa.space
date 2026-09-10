"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, ChevronDown, Check, Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Vehicle } from "@/types/vehicle";

interface VehicleSelectorProps {
  onSelect: (vehicleId: number) => void;
  selectedVehicleId?: number;
}

export function VehicleSelector({ onSelect, selectedVehicleId }: VehicleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles-search", searchQuery],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles?search=${searchQuery}&limit=10`);
      return response.data.data.data as Vehicle[]; // Assuming paginated response
    },
    // Only search if length >= 2 or empty (to show default list)
    enabled: searchQuery.length >= 2 || searchQuery.length === 0,
  });

  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Vehicle Information</h2>
        <p className="text-[16px] text-[#777777] mt-1">Select an existing vehicle to continue.</p>
      </div>

      <div className="relative max-w-xl" ref={dropdownRef}>
        <label className="block text-[15px] font-medium text-[#111111] mb-2">
          Vehicle Number *
        </label>
        
        <div 
          className={`relative flex min-h-[48px] w-full items-center justify-between rounded-[10px] border px-4 py-2 text-[16px] transition-colors cursor-pointer ${isOpen ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#E5E5E5] bg-white hover:border-[#111111]'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3 truncate">
            {selectedVehicle ? (
              <>
                <Car className="h-4 w-4 text-[#777777]" />
                <span className="font-medium text-[#111111]">{selectedVehicle.vehicle_number}</span>
                <span className="text-[#999999] truncate">({selectedVehicle.owner_name})</span>
              </>
            ) : (
              <span className="text-[#999999]">Search vehicle number...</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-[#999999] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[12px] border border-[#E5E5E5] bg-white shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center border-b border-[#E5E5E5] px-4 py-3">
              <Search className="mr-2 h-4 w-4 text-[#999999]" />
              <input 
                autoFocus
                className="flex-1 bg-transparent text-[16px] text-[#111111] outline-none placeholder:text-[#999999]"
                placeholder="Search by number, owner, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-[#999999]" />}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto py-2">
              {vehicles && vehicles.length > 0 ? (
                vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onSelect(v.id);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-[#111111]">{v.vehicle_number}</div>
                      <div className="text-[15px] text-[#777777] mt-0.5">{v.owner_name} • {v.phone || 'No phone'}</div>
                    </div>
                    {selectedVehicleId === v.id && (
                      <Check className="h-4 w-4 text-[#111111]" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[16px] text-[#999999]">
                  {isLoading ? "Searching vehicles..." : "No vehicles found."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
