"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  Loader2, 
  Trash2, 
  ArrowLeft, 
  Edit, 
  RefreshCcw, 
  Shield, 
  Car, 
  Calendar, 
  Receipt, 
  Building2, 
  CreditCard, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  FileText 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function InsuranceDetails({ policyId }: { policyId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["insurance-detail", policyId],
    queryFn: async () => {
      const response = await apiClient.get(`/insurance/${policyId}`);
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/insurance/${policyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-list"] });
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      router.push("/insurance");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this insurance policy?")) {
      setIsDeleting(true);
      deleteMutation.mutate(undefined, {
        onError: () => setIsDeleting(false),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
          <p className="text-[17px] text-[#777777]">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[16px] border border-red-200 bg-red-50 p-8 text-center my-8">
        <div className="flex justify-center mb-3">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-[20px] font-bold text-red-900 mb-2">Error Loading Policy</h2>
        <p className="text-[16px] text-red-700 mb-6">
          The insurance policy may not exist, has been deleted, or you do not have permission to view it.
        </p>
        <Link
          href="/insurance"
          className="inline-flex items-center rounded-[10px] bg-[#111111] px-6 py-2.5 text-[15px] font-medium text-white hover:bg-[#333333]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Insurance Management
        </Link>
      </div>
    );
  }

  const policy = data.policy || data;
  const vehicle = data.vehicle || data.vehicle;
  const premium = data.premium || {};
  const audit = data.audit || {};

  const policyNumber = policy.policyNumber || policy.policy_number || "N/A";
  const companyName = policy.insuranceCompany || policy.insurance_company?.name || "N/A";
  const receiptNo = policy.receiptNumber || policy.receipt_number || "N/A";
  const startDate = policy.startDate || policy.start_date;
  const expiryDate = policy.policyExpiryDate || policy.expiry_date;
  const confirmationNo = policy.confirmationNumber || policy.confirmation_number || "N/A";
  const confirmationDate = policy.confirmationDate || policy.confirmation_date;
  const transferDate = policy.transferDate || policy.transfer_date;
  const hpaWith = policy.hpaWith || policy.hpa_with || "N/A";
  const groupName = policy.groupName || policy.group_name || "N/A";
  const remarks = policy.remarks || "No remarks";

  const totalPremium = Number(premium.totalPremium ?? policy.total_premium ?? policy.premium_amount ?? 0);
  const sumInsured = Number(premium.sumInsured ?? policy.sum_insured ?? 0);
  const odTpPremium = Number(premium.odTpPremium ?? policy.od_tp_premium ?? 0);
  const trolleyAmount = Number(premium.trolleyAmount ?? policy.trolley_amount ?? 0);
  const otherAmount = Number(premium.otherAmount ?? policy.other_amount ?? 0);
  const serviceTax = Number(premium.serviceTax ?? policy.service_tax ?? 0);
  const ncb = premium.ncb ?? policy.ncb ?? 0;

  const isActive = policy.isActive ?? policy.is_active ?? true;
  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/insurance"
            className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white text-[#111111] transition-colors hover:bg-[#F5F5F5]"
            title="Back to Insurance"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-serif font-medium text-[#111111] tracking-tight">
                {policyNumber}
              </h1>
              {isExpired ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  Expired
                </span>
              ) : isActive ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-[16px] text-[#777777] mt-0.5">
              Insurance Policy Details & Premium Summary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasPermission("insurance.edit") && (
            <>
              <Link
                href={`/insurance/renew?id=${data.id || policyId}`}
                className="inline-flex items-center rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-2.5 text-[15px] font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Renew Policy
              </Link>
              <Link
                href={`/insurance/edit?id=${data.id || policyId}`}
                className="inline-flex items-center rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2.5 text-[15px] font-medium text-[#111111] hover:bg-[#F5F5F5] hover:border-[#111111] transition-colors"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Policy
              </Link>
            </>
          )}
          {hasPermission("insurance.delete") && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center rounded-[10px] bg-red-600 px-4 py-2.5 text-[15px] font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Policy Details & Premium Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Policy Information */}
          <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <Shield className="h-5 w-5 text-[#111111]" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#111111]">Policy Information</h2>
                <p className="text-[14px] text-[#777777]">Coverage dates and registration references</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Policy Number</span>
                <p className="text-[16px] font-semibold text-[#111111] mt-1">{policyNumber}</p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Insurance Company</span>
                <p className="text-[16px] font-semibold text-[#111111] mt-1">{companyName}</p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Receipt Number</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">{receiptNo}</p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Start Date</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">
                  {startDate ? new Date(startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Expiry Date</span>
                <p className={`text-[16px] font-semibold mt-1 ${isExpired ? 'text-red-600' : 'text-[#111111]'}`}>
                  {expiryDate ? new Date(expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Confirmation No</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">{confirmationNo}</p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Confirmation Date</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">
                  {confirmationDate ? new Date(confirmationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Transfer Date</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">
                  {transferDate ? new Date(transferDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">HPA (Financier)</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">{hpaWith}</p>
              </div>
              <div>
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Group Classification</span>
                <p className="text-[16px] font-medium text-[#111111] mt-1">{groupName}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Remarks / Notes</span>
                <p className="text-[15px] text-[#333333] mt-1 bg-[#FAFAFA] p-3 rounded-[8px] border border-[#F0F0F0]">
                  {remarks}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Breakdown */}
          <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <CreditCard className="h-5 w-5 text-[#111111]" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#111111]">Financial & Premium Breakdown</h2>
                <p className="text-[14px] text-[#777777]">Detailed financial computation for this policy</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[13px] font-medium text-[#777777]">Sum Insured (IDV)</span>
                <p className="text-[22px] font-bold text-[#111111] mt-1">₹{sumInsured.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[13px] font-medium text-[#777777]">OD / TP Premium</span>
                <p className="text-[22px] font-bold text-[#111111] mt-1">₹{odTpPremium.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[13px] font-medium text-[#777777]">Trolley Amount</span>
                <p className="text-[22px] font-bold text-[#111111] mt-1">₹{trolleyAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[13px] font-medium text-[#777777]">Other Amount</span>
                <p className="text-[22px] font-bold text-[#111111] mt-1">₹{otherAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[13px] font-medium text-[#777777]">Service Tax / GST</span>
                <p className="text-[22px] font-bold text-[#111111] mt-1">₹{serviceTax.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[13px] font-medium text-[#777777]">No Claim Bonus (NCB)</span>
                <p className="text-[22px] font-bold text-[#111111] mt-1">{typeof ncb === 'number' ? `₹${ncb.toLocaleString("en-IN")}` : ncb}</p>
              </div>
            </div>

            {/* Total Premium Bar */}
            <div className="mt-8 rounded-[12px] bg-[#111111] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Premium Paid</span>
                <h3 className="text-[32px] font-bold tracking-tight text-white mt-1">
                  ₹{totalPremium.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Authorized & Processed</span>
                <p className="text-sm font-medium text-gray-200 mt-0.5">{companyName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Linked Vehicle Details */}
        <div className="space-y-8">
          <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FAFAFA] border border-[#E5E5E5]">
                <Car className="h-5 w-5 text-[#111111]" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#111111]">Linked Vehicle</h2>
                <p className="text-[14px] text-[#777777]">Motor fleet assignment</p>
              </div>
            </div>

            {vehicle ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Registration Number</span>
                  <div className="mt-1">
                    <Link
                      href={`/vehicles/view?id=${vehicle.id}`}
                      className="text-[18px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1.5"
                    >
                      {vehicle.vehicleNumber || vehicle.vehicle_number || "N/A"}
                    </Link>
                  </div>
                </div>

                <div>
                  <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Owner Name</span>
                  <p className="text-[16px] font-semibold text-[#111111] mt-1">{vehicle.ownerName || vehicle.owner_name || "N/A"}</p>
                </div>

                <div>
                  <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Contact Phone</span>
                  <p className="text-[15px] text-[#111111] mt-1">{vehicle.phone || "N/A"}</p>
                </div>

                <div>
                  <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Make & Model</span>
                  <p className="text-[15px] text-[#111111] mt-1">
                    {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-[13px] font-medium text-[#777777] uppercase tracking-wider">Address / City</span>
                  <p className="text-[14px] text-[#555555] mt-1">{vehicle.city || vehicle.permanent_address || "N/A"}</p>
                </div>

                <div className="pt-4 border-t border-[#F0F0F0]">
                  <Link
                    href={`/vehicles/view?id=${vehicle.id}`}
                    className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#E5E5E5] bg-[#FAFAFA] py-2.5 text-[15px] font-medium text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                  >
                    View Vehicle Full Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-[#777777]">
                <p className="text-[15px]">No vehicle linked directly to this insurance record.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
