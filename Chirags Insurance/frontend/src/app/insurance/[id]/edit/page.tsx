"use client";

import { use, useState, useEffect } from "react";
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
import { Loader2, ArrowLeft, Shield } from "lucide-react";

import { VehicleDetailsCard } from "@/components/insurance/add/vehicle-details-card";
import { ComplianceCard } from "@/components/insurance/add/compliance-card";
import { PolicyDetailsCard } from "@/components/insurance/add/policy-details-card";
import { PremiumDetailsCard } from "@/components/insurance/add/premium-details-card";
import { PolicySummary } from "@/components/insurance/add/policy-summary";

import { PermissionGuard } from "@/components/auth/permission-guard";

export default function EditInsurancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Fetch Existing Policy
  const { data: policyData, isLoading: isLoadingPolicy, error: policyError } = useQuery({
    queryKey: ["insurance-detail", id],
    queryFn: async () => {
      const response = await apiClient.get(`/insurance/${id}`);
      return response.data.data;
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

  const calculatedTotal = (Number(odTpPremium) + Number(trolleyAmount) + Number(otherAmount) + Number(serviceTax)) - Number(ncb);

  // When policy data loads, populate form
  useEffect(() => {
    if (policyData && policyData.policy) {
      const p = policyData.policy;
      const prem = policyData.premium || {};
      
      reset({
        vehicle_id: policyData.vehicle?.id || 0,
        insurance_company_id: p.insuranceCompanyId || null,
        insurance_company_name: p.insuranceCompany || "",
        policy_number: p.policyNumber || "",
        receipt_number: p.receiptNumber || "",
        start_date: p.startDate || "",
        expiry_date: p.policyExpiryDate || "",
        confirmation_number: p.confirmationNumber || "",
        confirmation_date: p.confirmationDate || "",
        transfer_date: p.transferDate || "",
        group_name: p.groupName || "",
        hpa_with: p.hpaWith || "",
        remarks: p.remarks || "",
        sum_insured: Number(prem.sumInsured) || 0,
        trolley_amount: Number(prem.trolleyAmount) || 0,
        other_amount: Number(prem.otherAmount) || 0,
        ncb: Number(prem.ncb) || 0,
        od_tp_premium: Number(prem.odTpPremium) || 0,
        service_tax: Number(prem.serviceTax) || 0,
      });
    }
  }, [policyData, reset]);

  // Fetch vehicle & compliance details
  const vehicleId = policyData?.vehicle?.id;
  const { data: vehicleDetails } = useQuery({
    queryKey: ["vehicle-insurance-details", vehicleId],
    queryFn: async () => {
      const response = await apiClient.get(`/insurance/vehicle/${vehicleId}`);
      return response.data.data;
    },
    enabled: !!vehicleId,
  });

  const mutation = useMutation({
    mutationFn: async (data: InsuranceEntryFormValues) => {
      const response = await apiClient.put(`/insurance/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      const msg = `Insurance policy updated successfully!`;
      setSuccessMsg(msg);
      queryClient.invalidateQueries({ queryKey: ["insurance-list"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      
      setTimeout(() => {
        router.push(`/insurance/${id}`);
      }, 1200);
    },
    onError: (error: any) => {
      setErrorMsg(
        error.response?.data?.message || "Unable to update insurance policy. Please check all fields."
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const onSubmit = (data: InsuranceEntryFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    mutation.mutate(data);
  };

  if (isLoadingPolicy) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
          <p className="text-[17px] text-[#777777]">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (policyError || !policyData) {
    return (
      <div className="max-w-[1200px] mx-auto py-12 px-6">
        <div className="rounded-[16px] border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-[20px] font-bold text-red-900 mb-2">Policy Not Found</h2>
          <p className="text-[16px] text-red-700 mb-6">Unable to retrieve details for this insurance policy.</p>
          <Link
            href="/insurance"
            className="inline-flex items-center rounded-[10px] bg-[#111111] px-6 py-2.5 text-[15px] font-medium text-white hover:bg-[#333333]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insurance List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="insurance.edit" showPageDenied>
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-[#FAFAFA] pb-28">
        {/* Breadcrumb & Header */}
        <div className="bg-white border-b border-[#E5E5E5] pt-6 pb-8 px-6 lg:px-8 mb-8">
          <div className="max-w-[1200px] mx-auto">
            <nav className="flex items-center text-[15px] text-[#777777] mb-6">
              <Link href="/" className="hover:text-[#111111] transition-colors">Dashboard</Link>
              <span className="mx-2">/</span>
              <Link href="/insurance" className="hover:text-[#111111] transition-colors">Insurance</Link>
              <span className="mx-2">/</span>
              <Link href={`/insurance/${id}`} className="hover:text-[#111111] transition-colors">
                {policyData?.policy?.policyNumber || `Policy #${id}`}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#111111] font-medium">Edit Policy</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[32px] font-bold tracking-tight text-[#111111]">
                  Edit Insurance Policy
                </h1>
                <p className="text-[17px] text-[#777777] mt-1">
                  Update policy specifications, validity dates, and premium details.
                </p>
              </div>
              <div className="flex items-center gap-3">
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

          {/* 1. Vehicle Details Card */}
          {policyData.vehicle ? (
            <VehicleDetailsCard vehicle={policyData.vehicle} />
          ) : (
            <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-6">
              <p className="text-[16px] text-[#777777]">No vehicle linked directly to this policy.</p>
            </div>
          )}
          
          {/* 2. Policy Details */}
          <PolicyDetailsCard register={register} errors={errors} />
          
          {/* 3. Premium Details */}
          <PremiumDetailsCard register={register} errors={errors} calculatedTotal={calculatedTotal} />
          
          {/* 4. Compliance details if vehicle attached */}
          {vehicleDetails?.compliance && (
            <ComplianceCard vehicleId={vehicleId!} compliance={vehicleDetails.compliance} />
          )}
          
          {/* 5. Policy Summary Preview */}
          <PolicySummary 
            vehicleNumber={policyData.vehicle?.vehicleNumber || "N/A"}
            companyName={companyName}
            policyNumber={policyNumber}
            expiryDate={expiryDate}
            totalPremium={calculatedTotal > 0 ? calculatedTotal : 0}
          />
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-[#E5E5E5] bg-white/90 backdrop-blur-md px-6 py-4 lg:px-8 mt-12 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={mutation.isPending}
            className="rounded-[10px] border border-[#E5E5E5] bg-transparent px-6 py-2.5 text-[16px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] hover:border-[#111111] disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center rounded-[10px] bg-[#111111] px-8 py-2.5 text-[16px] font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Policy...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>
    </PermissionGuard>
  );
}
