"use client";

import { Vehicle } from "@/types/vehicle";
import { X, ExternalLink, Edit, Map, MapPin, Building, Calendar, CheckCircle2, AlertTriangle, XCircle, FileText } from "lucide-react";
import Link from "next/link";

interface NationalPermitDetailPanelProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function NationalPermitDetailPanel({ vehicle, onClose }: NationalPermitDetailPanelProps) {
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "ACTIVE",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: CheckCircle2,
          desc: "National Permit is valid and compliant for interstate transport.",
        };
      case "EXPIRING_SOON":
        return {
          label: "EXPIRING SOON",
          color: "text-amber-700 bg-amber-50 border-amber-200",
          icon: AlertTriangle,
          desc: "National Permit expires within the next 30 days. Renewal is due.",
        };
      case "EXPIRED":
        return {
          label: "EXPIRED",
          color: "text-red-700 bg-red-50 border-red-200",
          icon: XCircle,
          desc: "National Permit has expired. Vehicle is not authorized for interstate movement.",
        };
      case "NOT_AVAILABLE":
      default:
        return {
          label: "NOT AVAILABLE",
          color: "text-slate-700 bg-slate-50 border-slate-200",
          icon: FileText,
          desc: "No national permit information recorded for this vehicle.",
        };
    }
  };

  const statusInfo = getStatusInfo(vehicle.national_permit_status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining(vehicle.national_permit?.expiry_date);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#123B6D]/10 p-2.5 rounded-xl">
                <Map className="h-6 w-6 text-[#123B6D]" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#111111] leading-tight">
                  {vehicle.vehicle_number}
                </h2>
                <p className="text-[13px] text-[#666666] mt-0.5">
                  {vehicle.vehicle_class?.name || "Vehicle"} {vehicle.model ? `• ${vehicle.model}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px]">{statusInfo.label}</span>
                {daysRemaining !== null && (
                  <span className="text-[12px] font-medium">
                    {daysRemaining < 0
                      ? `Expired ${Math.abs(daysRemaining)} days ago`
                      : daysRemaining === 0
                      ? "Expires today"
                      : `${daysRemaining} days remaining`}
                  </span>
                )}
              </div>
              <p className="text-[13px] mt-1 opacity-90">{statusInfo.desc}</p>
            </div>
          </div>

          {/* National Permit Details Card */}
          <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-5">
            <div className="flex items-center mb-4">
              <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-2"></div>
              <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-wide">
                National Permit Authorization
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[12px] text-slate-500 block mb-1">Authorized States</span>
                <span className="text-[14px] font-semibold text-slate-900">
                  {vehicle.national_permit?.state_info || "—"}
                </span>
              </div>

              <div>
                <span className="text-[12px] text-slate-500 block mb-1">City</span>
                <span className="text-[14px] font-semibold text-slate-900">
                  {vehicle.national_permit?.city || "—"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[12px] text-slate-500 block mb-1">Postal Address</span>
                <span className="text-[13px] text-slate-800">
                  {vehicle.national_permit?.address || "—"}
                </span>
              </div>

              <div className="col-span-2 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[13px] font-medium text-slate-600">NP Validity Upto</span>
                <span className="text-[15px] font-bold text-[#111111]">
                  {formatDate(vehicle.national_permit?.expiry_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <div className="flex items-center mb-4">
              <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-2"></div>
              <h3 className="text-[14px] font-bold text-[#111111] uppercase tracking-wide">
                Vehicle Information
              </h3>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Owner Name</span>
                <span className="font-semibold text-slate-900">{vehicle.owner_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Make & Model</span>
                <span className="font-semibold text-slate-900">
                  {vehicle.make?.name || "—"} {vehicle.model || ""}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Class</span>
                <span className="font-semibold text-slate-900">{vehicle.vehicle_class?.name || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Chassis Number</span>
                <span className="font-mono text-slate-900">{vehicle.chassis_number || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Engine Number</span>
                <span className="font-mono text-slate-900">{vehicle.engine_number || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-[#E5E7EB] bg-slate-50 flex items-center gap-3">
          <Link
            href={`/vehicles/view?id=${vehicle.id}`}
            className="flex-1 inline-flex h-11 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[13px] font-medium text-[#111111] hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Vehicle Details
          </Link>
          <Link
            href={`/vehicles/edit?id=${vehicle.id}`}
            className="flex-1 inline-flex h-11 items-center justify-center rounded-lg bg-[#123B6D] text-[13px] font-medium text-white hover:bg-[#0c2849] transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit National Permit
          </Link>
        </div>
      </div>
    </div>
  );
}
