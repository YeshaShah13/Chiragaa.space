"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CFRAFormTemplate } from "@/components/reports/cfra-form-template";
import { Printer, RotateCcw, ZoomIn, ZoomOut, FileText, Search, ChevronDown, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Vehicle } from "@/types/vehicle";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function CFRAFormReportPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
  const [zoomLevel, setZoomLevel] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Search autocomplete state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["vehicles-search", searchQuery],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles?search=${searchQuery}&limit=10`);
      return response.data.data.data as Vehicle[];
    },
    enabled: searchQuery.length >= 2 || searchQuery.length === 0,
  });

  // Fetch full vehicle data for the report
  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ["vehicle-full", selectedVehicleId],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles/view?id=${selectedVehicleId}`);
      return response.data.data;
    },
    enabled: !!selectedVehicleId,
    retry: false,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setSelectedVehicleId(undefined);
    setSearchQuery("");
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.2, 0.5));
  const handleZoom100 = () => setZoomLevel(1);
  const handleFitWidth = () => {
    if (previewContainerRef.current) {
      // Container width minus padding
      const containerWidth = previewContainerRef.current.clientWidth - 48; 
      // Base document width is 1000px for 100% zoom
      setZoomLevel(Math.min(containerWidth / 1000, 1));
    }
  };

  // Run fit width when the vehicle loads for the first time
  useEffect(() => {
    if (vehicle) {
      // small delay to ensure DOM is painted
      setTimeout(handleFitWidth, 50);
    }
  }, [vehicle]);

  const selectedVehicleSummary = vehicle || searchResults?.find(v => v.id === selectedVehicleId);

  return (
    <PermissionGuard permission="reports.view" showPageDenied>
      <div className="min-h-screen w-full overflow-x-hidden print:overflow-visible bg-[#F8FAFC] font-sans flex flex-col items-center pb-12 print:bg-white print:pb-0">
        
        {/* Global Header & Page Header */}
        <div className="w-full bg-white border-b border-slate-200 px-6 py-6 lg:px-8 shrink-0 print:hidden">
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Reports</h1>
            <p className="text-sm text-slate-500 mb-4">View system reports and generated documents</p>
            
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <Link href="/reports" className="hover:text-[#1D4ED8] transition-colors font-medium">Reports</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">CFRA Form</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl w-full px-6 lg:px-8 mt-8 print:m-0 print:p-0">
          
          {/* Report Control Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8 print:hidden">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              
              {/* Left side: Selector & Summary */}
              <div className="flex-1 max-w-xl">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">CFRA Form Report</h2>
                <p className="text-sm text-slate-500 mb-4">Select a vehicle to generate and preview the CFRA Form.</p>
                
                {/* Compact Vehicle Selector */}
                <div className="relative w-full max-w-md" ref={dropdownRef}>
                  <div 
                    className={`relative flex min-h-[44px] w-full items-center justify-between rounded-lg border px-4 py-2 text-[15px] transition-colors cursor-pointer ${isOpen ? 'border-[#1D4ED8] ring-1 ring-[#1D4ED8]' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {selectedVehicleSummary ? (
                        <>
                          <span className="font-semibold text-slate-900">{selectedVehicleSummary.vehicle_number}</span>
                          <span className="text-slate-500 truncate">({selectedVehicleSummary.owner_name})</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Search vehicle number or owner name...</span>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center border-b border-slate-100 px-4 py-3">
                        <Search className="mr-2 h-4 w-4 text-slate-400" />
                        <input 
                          autoFocus
                          className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Type to search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearchLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                      </div>
                      
                      <div className="max-h-[250px] overflow-y-auto py-1 custom-scrollbar">
                        {searchResults && searchResults.length > 0 ? (
                          searchResults.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => {
                                setSelectedVehicleId(v.id);
                                setIsOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-slate-900">{v.vehicle_number}</div>
                                <div className="text-[13px] text-slate-500">{v.owner_name}</div>
                              </div>
                              {selectedVehicleId === v.id && (
                                <Check className="h-4 w-4 text-[#1D4ED8]" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-[14px] text-slate-500">
                            {isSearchLoading ? "Searching..." : "No vehicles found."}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Vehicle Summary */}
                {vehicle && (
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
                    <div><span className="text-slate-500 mr-1">Vehicle:</span><span className="font-semibold text-slate-900">{vehicle.vehicle_number}</span></div>
                    <div><span className="text-slate-500 mr-1">Owner:</span><span className="font-semibold text-slate-900">{vehicle.owner_name}</span></div>
                    {/* @ts-ignore */}
                    {vehicle.vehicle_class?.name && <div><span className="text-slate-500 mr-1">Type:</span><span className="font-semibold text-slate-900">{vehicle.vehicle_class.name}</span></div>}
                  </div>
                )}
              </div>
              
              {/* Right side: Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button 
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <PermissionGuard permission="reports.export">
                  <button 
                    onClick={handlePrint}
                    disabled={!vehicle || isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1D4ED8] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Print / Download PDF
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!selectedVehicleId && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4 border border-slate-100">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Vehicle</h3>
              <p className="text-slate-500 text-[15px] max-w-sm">Choose a vehicle above to generate the CFRA Form preview.</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && selectedVehicleId && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin h-8 w-8 text-[#1D4ED8] mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Loading CFRA Form...</h3>
            </div>
          )}
          
          {isError && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to generate CFRA Form</h3>
              <p className="text-slate-500 text-[15px] max-w-sm mb-6">We couldn't retrieve the required vehicle information. Please try again.</p>
              <button onClick={() => setSelectedVehicleId(undefined)} className="text-[#1D4ED8] font-medium hover:underline">Change Vehicle</button>
            </div>
          )}

          {/* Document Preview Canvas */}
          {vehicle && !isLoading && !isError && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              
              {/* Preview Toolbar */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-[14px] font-semibold text-slate-700 tracking-wide">CFRA Form Preview</h3>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-1 shadow-sm">
                  <button onClick={handleFitWidth} className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">Fit to Width</button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button onClick={handleZoom100} className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">100%</button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button onClick={handleZoomOut} className="p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors"><ZoomOut className="w-4 h-4" /></button>
                  <span className="text-[13px] font-medium text-slate-500 w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={handleZoomIn} className="p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors"><ZoomIn className="w-4 h-4" /></button>
                </div>
              </div>
              
              {/* Preview Area with isolated scrolling */}
              <div 
                ref={previewContainerRef}
                className="bg-[#E2E8F0] w-full overflow-auto relative flex justify-center p-6 lg:p-8 custom-scrollbar"
                style={{ height: '70vh', minHeight: '600px' }}
              >
                <div 
                  className="transition-all duration-200 ease-out"
                  style={{ 
                    width: `${Math.round(zoomLevel * 1000)}px`,
                    flexShrink: 0
                  }}
                >
                  <CFRAFormTemplate vehicle={vehicle} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
