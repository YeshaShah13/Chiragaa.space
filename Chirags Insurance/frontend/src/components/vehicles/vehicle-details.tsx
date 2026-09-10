"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Trash2, ArrowLeft, Edit, Upload, Printer, MoreVertical, LayoutGrid, FileText, History, File, Car, User, CarFront, Target, Calendar, Factory, Shield, Receipt, CheckCircle2, FileBadge, AlertTriangle, Map, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VehicleDocuments } from "@/components/vehicles/vehicle-documents";
import { VehicleTimeline } from "@/components/vehicles/vehicle-timeline";
import { InsuranceHistory } from "@/components/vehicles/insurance-history";
import { VehicleNotes } from "@/components/vehicles/vehicle-notes";
import { useAuth } from "@/hooks/use-auth";

export function VehicleDetails({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "history" | "notes">("overview");

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles/view?id=${vehicleId}`);
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/vehicles/view?id=${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/vehicles");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this vehicle? This action will move it to the archive (Soft Delete).")) {
      setIsDeleting(true);
      deleteMutation.mutate(undefined, {
        onError: () => setIsDeleting(false),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="border-b border-[#E5E7EB] pb-[20px] mb-6 mt-[18px]">
          <div className="h-3 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 w-64 bg-gray-300 rounded mb-2"></div>
              <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
              <div className="h-10 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Tabs Skeleton */}
        <div className="flex space-x-6 border-b border-[#E5E7EB] pb-2">
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
        </div>

        {/* Summary Card Skeleton */}
        <div className="h-[120px] bg-gray-100 rounded-[10px] border border-[#E5E7EB]"></div>

        {/* Compliance Cards Skeleton */}
        <div className="h-[150px] bg-gray-100 rounded-[10px] border border-[#E5E7EB]"></div>

        {/* Part 4 Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-[16px]">
          <div className="h-[250px] bg-gray-100 rounded-[10px] border border-[#E5E7EB]"></div>
          <div className="h-[250px] bg-gray-100 rounded-[10px] border border-[#E5E7EB]"></div>
        </div>

        {/* Part 5 Skeleton */}
        <div className="h-[200px] bg-gray-100 rounded-[10px] border border-[#E5E7EB]"></div>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive text-center mt-6">
        <h3 className="text-lg font-semibold mb-2">Vehicle Not Found</h3>
        <p className="mb-4">The vehicle may have been removed or you may not have permission to access it.</p>
        <Link href="/vehicles">
          <Button variant="outline" className="bg-white">Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount?: number | string | null) => {
    if (amount === undefined || amount === null || amount === "") return "—";
    return Number(amount).toFixed(2);
  };

  const formatText = (text?: string | number | null) => {
    if (text === undefined || text === null || text === "") return "—";
    return text.toString();
  };

  const getComplianceStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { status: "—", color: "#666666", bg: "transparent", border: "transparent", iconClass: "text-[#666666]", AlertIcon: AlertTriangle };
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "EXPIRED", color: "#B42318", bg: "#FFF5F5", border: "rgba(180,35,24,0.25)", iconClass: "text-[#B42318]", AlertIcon: AlertTriangle };
    } else if (diffDays <= 30) {
      return { status: "DUE", color: "#B7791F", bg: "#FFFBF5", border: "rgba(183,121,31,0.25)", iconClass: "text-[#B7791F]", AlertIcon: AlertTriangle };
    } else {
      return { status: "VALID", color: "#26734D", bg: "#F7FAF8", border: "rgba(38,115,77,0.25)", iconClass: "text-[#26734D]", AlertIcon: CheckCircle2 };
    }
  };

  const latestTax = vehicle.tax_records && vehicle.tax_records.length > 0 
    ? [...vehicle.tax_records].sort((a, b) => new Date(b.valid_upto).getTime() - new Date(a.valid_upto).getTime())[0] 
    : null;

  const latestFitness = vehicle.fitness_records && vehicle.fitness_records.length > 0
    ? [...vehicle.fitness_records].sort((a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime())[0]
    : null;

  const latestPermit = vehicle.permits && vehicle.permits.length > 0
    ? [...vehicle.permits].sort((a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime())[0]
    : null;

  const latestNationalPermit = vehicle.national_permits && vehicle.national_permits.length > 0
    ? [...vehicle.national_permits].sort((a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime())[0]
    : null;

  const latestInsurance = vehicle.insurance_policies && vehicle.insurance_policies.length > 0
    ? [...vehicle.insurance_policies].sort((a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime())[0]
    : null;

  const taxStatus = getComplianceStatus(latestTax?.valid_upto);
  const fitnessStatus = getComplianceStatus(latestFitness?.expiry_date);
  const permitStatus = getComplianceStatus(latestPermit?.expiry_date);
  const insuranceStatus = getComplianceStatus(latestInsurance?.expiry_date);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5E7EB] pb-[20px] mb-6 mt-[18px]">
        {/* Top Breadcrumb */}
        <div className="text-[12px] font-medium text-[#666666] mb-[16px]">
          Motor Management <span className="mx-[8px] text-[#E5E7EB]">/</span> Vehicles <span className="mx-[8px] text-[#E5E7EB]">/</span> <span className="text-[#333333]">Vehicle Details</span>
        </div>

        {/* Main Header Flex Container */}
        <div className="flex items-center justify-between">
          
          {/* Left Side: Vehicle Info */}
          <div>
            <div className="text-[11px] font-bold text-[#333333] uppercase tracking-[0.05em] mb-[6px]">
              VEHICLE DETAILS
            </div>
            <h1 className="text-[44px] leading-none font-bold text-[#111111] mb-[8px]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
              {formatText(vehicle.vehicle_number)}
            </h1>
            <div className="text-[17px] font-bold text-[#111111] mb-[6px] uppercase">
              {formatText(vehicle.vehicle_class?.name)} {formatText(vehicle.model)}
            </div>
            <div className="text-[14px] font-medium text-[#666666] uppercase">
              {formatText(vehicle.owner_name)}
            </div>
          </div>

          {/* Right Side: Status and Actions */}
          <div className="flex items-center space-x-10">
            
            {/* Status Section */}
            <div className="flex flex-col items-end space-y-[6px]">
              <div className="flex items-center text-[14px] font-semibold" style={{ color: vehicle.status === 'Active' || !vehicle.status ? '#26734D' : '#666666' }}>
                <span className="w-[8px] h-[8px] rounded-full mr-2" style={{ backgroundColor: vehicle.status === 'Active' || !vehicle.status ? '#26734D' : '#666666' }}></span>
                {vehicle.status ? vehicle.status.toUpperCase() : "ACTIVE"}
              </div>
              <div className="text-[12px] text-[#666666]">
                <span className="text-[#333333] font-medium">Last Updated:</span> {new Date(vehicle.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center space-x-[12px]">
              {hasPermission('motor_management.edit') && (
                <Link href={`/vehicles/edit?id=${vehicle.id}`}>
                  <Button className="h-[42px] w-[85px] bg-[#123B6D] hover:bg-[#0c2849] text-white rounded-[6px] text-[13px] font-medium flex items-center justify-center">
                    <Edit className="mr-2 h-[14px] w-[14px]" strokeWidth={2.5} />
                    Edit
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="h-[42px] w-[80px] bg-white border-[#CBD5E1] text-[#111111] rounded-[6px] text-[13px] font-medium flex items-center justify-center hover:bg-gray-50 shadow-sm">
                <Printer className="mr-[6px] h-[16px] w-[16px] text-[#333333]" strokeWidth={2} />
                Print
              </Button>
              <Button variant="outline" className="h-[42px] w-[75px] bg-white border-[#CBD5E1] text-[#111111] rounded-[6px] text-[13px] font-medium flex items-center justify-center hover:bg-gray-50 shadow-sm px-0">
                <MoreVertical className="mr-[2px] h-[18px] w-[18px] text-[#333333]" strokeWidth={2} />
                More
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="relative mt-8">
        <div className="flex items-center h-[54px] gap-8">
          {/* Overview Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center h-full px-1 cursor-pointer transition-colors relative ${
              activeTab === "overview" ? "text-[#123B6D]" : "text-[#475569] hover:text-[#111111]"
            }`}
          >
            <LayoutGrid className="w-[18px] h-[18px] mr-[8px]" strokeWidth={2} />
            <span className={`text-[15px] ${activeTab === "overview" ? "font-bold text-[#123B6D]" : "font-medium text-[#333333]"}`}>
              Overview
            </span>
            {activeTab === "overview" && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#123B6D] rounded-t-sm"></div>
            )}
          </button>
          
          {/* Documents Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`flex items-center h-full px-1 cursor-pointer transition-colors relative ${
              activeTab === "documents" ? "text-[#123B6D]" : "text-[#475569] hover:text-[#111111]"
            }`}
          >
            <FileText className="w-[18px] h-[18px] mr-[8px]" strokeWidth={2} />
            <span className={`text-[15px] ${activeTab === "documents" ? "font-bold text-[#123B6D]" : "font-medium text-[#333333]"}`}>
              Documents
            </span>
            {vehicle.documents && vehicle.documents.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {vehicle.documents.length}
              </span>
            )}
            {activeTab === "documents" && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#123B6D] rounded-t-sm"></div>
            )}
          </button>

          {/* History Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center h-full px-1 cursor-pointer transition-colors relative ${
              activeTab === "history" ? "text-[#123B6D]" : "text-[#475569] hover:text-[#111111]"
            }`}
          >
            <History className="w-[18px] h-[18px] mr-[8px]" strokeWidth={2} />
            <span className={`text-[15px] ${activeTab === "history" ? "font-bold text-[#123B6D]" : "font-medium text-[#333333]"}`}>
              History
            </span>
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#123B6D] rounded-t-sm"></div>
            )}
          </button>

          {/* Notes Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`flex items-center h-full px-1 cursor-pointer transition-colors relative ${
              activeTab === "notes" ? "text-[#123B6D]" : "text-[#475569] hover:text-[#111111]"
            }`}
          >
            <File className="w-[18px] h-[18px] mr-[8px]" strokeWidth={2} />
            <span className={`text-[15px] ${activeTab === "notes" ? "font-bold text-[#123B6D]" : "font-medium text-[#333333]"}`}>
              Notes
            </span>
            {activeTab === "notes" && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#123B6D] rounded-t-sm"></div>
            )}
          </button>
        </div>
        {/* Tab Divider */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#E5E7EB]"></div>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* VEHICLE SUMMARY CARD */}
          <div className="mt-[20px] bg-white border border-[#E5E7EB] rounded-[10px] p-[24px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 divide-x-0 lg:divide-x divide-[#E5E7EB]">
              
              {/* Column 1: Vehicle Number */}
              <div className="px-4 lg:pl-0 lg:pr-6">
                <div className="flex items-center text-[#666666] mb-[8px]">
                  <Car className="w-[18px] h-[18px] mr-[8px] text-[#333333]" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">VEHICLE NUMBER</span>
                </div>
                <div className="text-[15px] font-bold text-[#111111]">
                  {formatText(vehicle.vehicle_number)}
                </div>
              </div>

              {/* Column 2: Owner */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center text-[#666666] mb-[8px]">
                  <User className="w-[18px] h-[18px] mr-[8px] text-[#333333]" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">OWNER</span>
                </div>
                <div className="text-[15px] font-bold text-[#111111] leading-[1.4]">
                  {formatText(vehicle.owner_name)}
                </div>
              </div>

              {/* Column 3: Vehicle Type */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center text-[#666666] mb-[8px]">
                  <CarFront className="w-[18px] h-[18px] mr-[8px] text-[#333333]" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">VEHICLE TYPE</span>
                </div>
                <div className="text-[15px] font-bold text-[#111111] leading-[1.4]">
                  {formatText(vehicle.vehicle_class?.name)}
                </div>
              </div>

              {/* Column 4: Model */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center text-[#666666] mb-[8px]">
                  <Target className="w-[18px] h-[18px] mr-[8px] text-[#333333]" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">MODEL</span>
                </div>
                <div className="text-[15px] font-bold text-[#111111]">
                  {formatText(vehicle.model)}
                </div>
              </div>

              {/* Column 5: Registration Date */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center text-[#666666] mb-[8px]">
                  <Calendar className="w-[18px] h-[18px] mr-[8px] text-[#333333]" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">REGISTRATION DATE</span>
                </div>
                <div className="text-[15px] font-bold text-[#111111]">
                  {formatDate(vehicle.registration_date)}
                </div>
              </div>

              {/* Column 6: Make */}
              <div className="px-4 lg:px-6 border-r-0">
                <div className="flex items-center text-[#666666] mb-[8px]">
                  <Factory className="w-[18px] h-[18px] mr-[8px] text-[#333333]" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">MAKE</span>
                </div>
                <div className="text-[15px] font-bold text-[#111111]">
                  {formatText(vehicle.make?.name)}
                </div>
              </div>

            </div>
          </div>

          {/* COMPLIANCE STATUS SECTION */}
          <div className="mt-[20px] bg-white border border-[#E5E7EB] rounded-[10px] p-[20px]">
            <div className="flex items-center mb-[18px]">
              <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
              <h3 className="text-[14px] font-semibold text-[#111111]">Compliance Status</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
              
              {/* Card 1: Insurance */}
              <div className="border rounded-[10px] h-[90px] p-[16px] flex flex-col justify-between" style={{ backgroundColor: insuranceStatus.bg, borderColor: insuranceStatus.border }}>
                <div className="flex items-center">
                  <Shield className="w-[20px] h-[20px] text-[#333333] mr-[10px]" strokeWidth={1.8} />
                  <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wide">INSURANCE</span>
                </div>
                <div>
                  <div className="flex items-center font-semibold text-[13px] mb-[2px]" style={{ color: insuranceStatus.color }}>
                    <insuranceStatus.AlertIcon className="w-[14px] h-[14px] mr-[6px]" strokeWidth={2.5} />
                    {insuranceStatus.status}
                  </div>
                  <div className="text-[13px] text-[#333333] pl-[20px]">
                    {formatDate(latestInsurance?.expiry_date)}
                  </div>
                </div>
              </div>

              {/* Card 2: Tax */}
              <div className="border rounded-[10px] h-[90px] p-[16px] flex flex-col justify-between" style={{ backgroundColor: taxStatus.bg, borderColor: taxStatus.border }}>
                <div className="flex items-center">
                  <Receipt className="w-[20px] h-[20px] text-[#333333] mr-[10px]" strokeWidth={1.8} />
                  <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wide">TAX</span>
                </div>
                <div>
                  <div className="flex items-center font-semibold text-[13px] mb-[2px]" style={{ color: taxStatus.color }}>
                    <taxStatus.AlertIcon className="w-[14px] h-[14px] mr-[6px]" strokeWidth={2.5} />
                    {taxStatus.status}
                  </div>
                  <div className="text-[13px] text-[#333333] pl-[20px]">
                    {formatDate(latestTax?.valid_upto)}
                  </div>
                </div>
              </div>

              {/* Card 3: Fitness */}
              <div className="border rounded-[10px] h-[90px] p-[16px] flex flex-col justify-between" style={{ backgroundColor: fitnessStatus.bg, borderColor: fitnessStatus.border }}>
                <div className="flex items-center">
                  <CheckCircle2 className="w-[20px] h-[20px] text-[#333333] mr-[10px]" strokeWidth={1.8} />
                  <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wide">FITNESS</span>
                </div>
                <div>
                  <div className="flex items-center font-semibold text-[13px] mb-[2px]" style={{ color: fitnessStatus.color }}>
                    <fitnessStatus.AlertIcon className="w-[14px] h-[14px] mr-[6px]" strokeWidth={2.5} />
                    {fitnessStatus.status}
                  </div>
                  <div className="text-[13px] text-[#333333] pl-[20px]">
                    {formatDate(latestFitness?.expiry_date)}
                  </div>
                </div>
              </div>

              {/* Card 4: Permit */}
              <div className="border rounded-[10px] h-[90px] p-[16px] flex flex-col justify-between" style={{ backgroundColor: permitStatus.bg, borderColor: permitStatus.border }}>
                <div className="flex items-center">
                  <FileBadge className="w-[20px] h-[20px] text-[#333333] mr-[10px]" strokeWidth={1.8} />
                  <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wide">PERMIT</span>
                </div>
                <div>
                  <div className="flex items-center font-semibold text-[13px] mb-[2px]" style={{ color: permitStatus.color }}>
                    <permitStatus.AlertIcon className="w-[14px] h-[14px] mr-[6px]" strokeWidth={2.5} />
                    {permitStatus.status}
                  </div>
                  <div className="text-[13px] text-[#333333] pl-[20px]">
                    {formatDate(latestPermit?.expiry_date)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* PART 4: VEHICLE INFO & TAX DETAILS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[16px] mt-[16px]">
            
            {/* Vehicle Information Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[20px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">Vehicle Information</h3>
              </div>
              
              <div className="flex">
                {/* Left Column */}
                <div className="flex-1 pr-[16px]">
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Class</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.vehicle_class?.name)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Model</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.model)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Horse Power</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{vehicle.horse_power ? `${vehicle.horse_power}CC` : "—"}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">RLW</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.rlw)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#666666]">Cylinder</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.cylinder)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] bg-[#E5E7EB] mx-[4px]"></div>

                {/* Right Column */}
                <div className="flex-1 pl-[20px]">
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">S_C_Ind</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.s_c_ind)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">UW</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.uw)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">PLW</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.plw)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Chassis No.</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.chassis_number)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#666666]">Engine No.</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(vehicle.engine_number)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Details Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[20px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">Tax Details</h3>
              </div>
              
              <div className="flex">
                {/* Left Column */}
                <div className="flex-1 pr-[16px]">
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Tax Up To Date</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatDate(latestTax?.valid_upto)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Tax Paid Date</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatDate(latestTax?.paid_date)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Tax Penalty</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(latestTax?.penalty)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Tax Interest</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(latestTax?.interest)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#666666]">Tax Amount</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(latestTax?.amount)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] bg-[#E5E7EB] mx-[4px]"></div>

                {/* Right Column */}
                <div className="flex-1 pl-[20px]">
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Tax Receipt No.</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatText(latestTax?.receipt_number)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Yearly</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{latestTax?.yearly ? 'Y' : (latestTax?.yearly === false ? 'N' : '—')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Yearly Amount</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(latestTax?.yearly_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-[12px]">
                    <span className="text-[13px] text-[#666666]">Half Yearly</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{latestTax?.half_yearly ? 'Y' : (latestTax?.half_yearly === false ? 'N' : '—')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#666666]">Half Yearly Amount</span>
                    <span className="text-[13px] font-semibold text-[#111111]">{formatCurrency(latestTax?.half_yearly_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* PART 5: ADDITIONAL COMPLIANCE DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[12px] mt-[16px]">
            
            {/* Card 1: Fitness Details */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[16px] min-h-[150px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">Fitness Details</h3>
              </div>
              <div className="space-y-[10px]">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Fitness Up To Date</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatDate(latestFitness?.expiry_date)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Passed By</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestFitness?.passed_by)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Place</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestFitness?.place)}</span>
                </div>
                <div className="flex justify-between items-center pt-[2px]">
                  <span className="text-[12px] text-[#666666]">Status</span>
                  <span className="px-[6px] py-[2px] rounded-[4px] border text-[11px] font-semibold" style={{ backgroundColor: fitnessStatus.bg, borderColor: fitnessStatus.border, color: fitnessStatus.color }}>
                    {fitnessStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Permit Details */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[16px] min-h-[150px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">Permit Details</h3>
              </div>
              <div className="space-y-[10px]">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Permit Up To Date</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatDate(latestPermit?.expiry_date)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Permit No.</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestPermit?.permit_number)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Permit Amount</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatCurrency(latestPermit?.amount)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Receipt No.</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestPermit?.receipt_no)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Permit Date</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatDate(latestPermit?.issue_date)}</span>
                </div>
                <div className="flex justify-between items-center pt-[2px]">
                  <span className="text-[12px] text-[#666666]">Status</span>
                  <span className="px-[6px] py-[2px] rounded-[4px] border text-[11px] font-semibold" style={{ backgroundColor: permitStatus.bg, borderColor: permitStatus.border, color: permitStatus.color }}>
                    {permitStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: National Permit Details */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[16px] min-h-[150px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">National Permit Details</h3>
              </div>
              <div className="space-y-[10px]">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">National Permit Up To Date</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatDate(latestNationalPermit?.expiry_date)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">National Permit State</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestNationalPermit?.state_info)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Postal Address</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestNationalPermit?.address)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">City</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestNationalPermit?.city)}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Insurance Details */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[16px] min-h-[150px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">Insurance Details</h3>
              </div>
              <div className="space-y-[10px]">
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Insurance Company</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestInsurance?.insurance_company?.name)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Policy No.</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatText(latestInsurance?.policy_number)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[12px] text-[#666666]">Expiry Date</span>
                  <span className="text-[12px] font-semibold text-[#111111] text-right">{formatDate(latestInsurance?.expiry_date)}</span>
                </div>
                <div className="flex justify-between items-center pt-[2px]">
                  <span className="text-[12px] text-[#666666]">Status</span>
                  <span className="px-[6px] py-[2px] rounded-[4px] border text-[11px] font-semibold" style={{ backgroundColor: insuranceStatus.bg, borderColor: insuranceStatus.border, color: insuranceStatus.color }}>
                    {insuranceStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 5: Additional Information */}
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[16px] min-h-[150px]">
              <div className="flex items-center mb-[18px]">
                <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
                <h3 className="text-[14px] font-semibold text-[#111111]">Additional Information</h3>
              </div>
              <div className="space-y-[12px]">
                <div>
                  <div className="text-[12px] text-[#666666] mb-[2px]">HPA With</div>
                  <div className="text-[12px] font-semibold text-[#111111] leading-[1.3] break-words">{formatText(vehicle.hpa_with)}</div>
                </div>
                <div>
                  <div className="text-[12px] text-[#666666] mb-[2px]">Remarks</div>
                  <div className="text-[12px] font-semibold text-[#111111]">{formatText(vehicle.remarks)}</div>
                </div>
                <div>
                  <div className="text-[12px] text-[#666666] mb-[2px]">Group</div>
                  <div className="text-[12px] font-semibold text-[#111111]">{formatText(vehicle.group)}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. DOCUMENTS */}
      {activeTab === "documents" && (
        <VehicleDocuments vehicleId={vehicle.id} documents={vehicle.documents || []} />
      )}

      {/* TAB CONTENT: 3. HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-6 mt-[20px]">
          <VehicleTimeline vehicle={vehicle} />
          <InsuranceHistory policies={vehicle.insurance_policies || []} vehicleId={String(vehicle.id)} />
        </div>
      )}

      {/* TAB CONTENT: 4. NOTES */}
      {activeTab === "notes" && (
        <VehicleNotes vehicle={vehicle} />
      )}
    </div>
  );
}
