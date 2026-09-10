"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  insuranceEntrySchema, 
  type InsuranceEntryFormValues 
} from "@/lib/validations/insurance-entry";

import { VehicleSelector } from "@/components/insurance/add/vehicle-selector";
import { VehicleDetailsCard } from "@/components/insurance/add/vehicle-details-card";
import { ComplianceCard } from "@/components/insurance/add/compliance-card";
import { PolicyDetailsCard } from "@/components/insurance/add/policy-details-card";
import { PremiumDetailsCard } from "@/components/insurance/add/premium-details-card";
import { DocumentUploader } from "@/components/insurance/add/document-uploader";
import { PolicySummary } from "@/components/insurance/add/policy-summary";
import { InsuranceActionBar } from "@/components/insurance/add/insurance-action-bar";

import { PermissionGuard } from "@/components/auth/permission-guard";

export default function CreateInsurancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveAction, setSaveAction] = useState<"save" | "saveAndNew">("save");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InsuranceEntryFormValues>({
    resolver: zodResolver(insuranceEntrySchema) as any,
    defaultValues: {
      sum_insured: 0,
      trolley_amount: 0,
      other_amount: 0,
      ncb: 0,
      od_tp_premium: 0,
      service_tax: 0,
    },
  });

  // Watch for premium calculation
  const odTpPremium = watch("od_tp_premium") || 0;
  const trolleyAmount = watch("trolley_amount") || 0;
  const otherAmount = watch("other_amount") || 0;
  const serviceTax = watch("service_tax") || 0;
  const ncb = watch("ncb") || 0;
  const companyName = watch("insurance_company_name") || "";
  const policyNumber = watch("policy_number") || "";
  const expiryDate = watch("expiry_date") || "";

  // Basic frontend calculation, but backend is authoritative on save
  const calculatedTotal = (Number(odTpPremium) + Number(trolleyAmount) + Number(otherAmount) + Number(serviceTax)) - Number(ncb);

  // Fetch full vehicle and compliance details when a vehicle is selected
  const { data: vehicleDetails, isLoading: isLoadingVehicle, error: vehicleError } = useQuery({
    queryKey: ["vehicle-insurance-details", selectedVehicleId],
    queryFn: async () => {
      const response = await apiClient.get(`/insurance/vehicle/${selectedVehicleId}`);
      return response.data.data;
    },
    enabled: !!selectedVehicleId,
  });

  const mutation = useMutation({
    mutationFn: async (data: InsuranceEntryFormValues) => {
      const response = await apiClient.post("/insurance", data);
      return response.data;
    },
    onSuccess: (data) => {
      const msg = `Insurance policy ${data.data.policy_number} added successfully!`;
      setSuccessMsg(msg);
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      
      if (saveAction === "saveAndNew") {
        setTimeout(() => {
          setSuccessMsg(null);
          reset();
          setSelectedVehicleId(undefined);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 3000);
      } else {
        setTimeout(() => {
          router.push(`/vehicles/view?id=${selectedVehicleId}`); // Or wherever they should go
        }, 1500);
      }
    },
    onError: (error: any) => {
      setErrorMsg(
        error.response?.data?.message || "Unable to save insurance policy. Please try again."
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const onSubmit = (data: InsuranceEntryFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    mutation.mutate(data);
  };

  const handleSelectVehicle = (id: number) => {
    setSelectedVehicleId(id);
    setValue("vehicle_id", id);
    setErrorMsg(null);
  };

  return (
    <PermissionGuard permission="insurance.create" showPageDenied>
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-[#FAFAFA] pb-24">
        {/* Breadcrumb & Header */}
        <div className="bg-white border-b border-[#E5E5E5] pt-6 pb-8 px-6 lg:px-8 mb-8">
          <div className="max-w-[1200px] mx-auto">
            <nav className="flex items-center text-[15px] text-[#777777] mb-6">
              <Link href="/" className="hover:text-[#111111] transition-colors">Dashboard</Link>
              <span className="mx-2">/</span>
              <Link href="/insurance" className="hover:text-[#111111] transition-colors">Insurance</Link>
              <span className="mx-2">/</span>
              <span className="text-[#111111] font-medium">Add Policy</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[32px] font-bold tracking-tight text-[#111111]">Add Insurance Policy</h1>
                <p className="text-[17px] text-[#777777] mt-1">Create a new insurance policy for a registered vehicle.</p>
              </div>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-[10px] border border-[#E5E5E5] bg-white px-5 py-2 text-[16px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] hover:border-[#111111]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 space-y-8">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="rounded-[12px] bg-red-50 border border-red-200 p-4 text-[16px] text-red-800 font-medium">
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="rounded-[12px] bg-green-50 border border-green-200 p-4 text-[16px] text-green-800 font-medium">
              {successMsg}
            </div>
          )}

          {/* 1. Vehicle Selector */}
          <VehicleSelector 
            onSelect={handleSelectVehicle} 
            selectedVehicleId={selectedVehicleId} 
          />

          {isLoadingVehicle && (
            <div className="flex justify-center p-8 animate-pulse text-[#777777] text-[16px]">
              Loading vehicle information...
            </div>
          )}
          
          {vehicleError && (
            <div className="rounded-[12px] bg-red-50 border border-red-200 p-4 text-[16px] text-red-800 font-medium">
              Unable to load vehicle information. Please try again or select a different vehicle.
            </div>
          )}

          {vehicleDetails && !isLoadingVehicle && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* 2. Vehicle Details */}
              <VehicleDetailsCard vehicle={vehicleDetails.vehicle} />
              
              {/* 3. Policy Details */}
              <PolicyDetailsCard register={register} errors={errors} />
              
              {/* 4. Premium Details */}
              <PremiumDetailsCard register={register} errors={errors} calculatedTotal={calculatedTotal} />
              
              {/* 5. Compliance */}
              <ComplianceCard vehicleId={selectedVehicleId!} compliance={vehicleDetails.compliance} />
              
              {/* 6. Documents */}
              <DocumentUploader />
              
              {/* 7. Policy Summary Preview */}
              <PolicySummary 
                vehicleNumber={vehicleDetails.vehicle.vehicleNumber}
                companyName={companyName}
                policyNumber={policyNumber}
                expiryDate={expiryDate}
                totalPremium={calculatedTotal > 0 ? calculatedTotal : 0}
              />
            </div>
          )}
        </div>

        {/* 7. Action Bar */}
        {selectedVehicleId && (
          <InsuranceActionBar 
            isSaving={mutation.isPending} 
            onSaveAndNew={() => {
              setSaveAction("saveAndNew");
              // The form will submit because the save button is type="submit", 
              // but the state determines what happens on success.
            }} 
          />
        )}
      </form>
    </PermissionGuard>
  );
}
