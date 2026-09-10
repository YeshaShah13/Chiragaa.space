import { Vehicle } from "@/types/vehicle";
import { X, ExternalLink, FileText, Download } from "lucide-react";
import Link from "next/link";

interface FitnessDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function FitnessDetailPanel({ vehicle, onClose }: FitnessDetailPanelProps) {
  if (!vehicle) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusDetails = () => {
    if (!vehicle.fitness?.expiry_date) {
      return { 
        title: "NOT AVAILABLE", 
        color: "bg-slate-500", 
        bg: "bg-slate-50",
        message: "No fitness validity date set" 
      };
    }

    const expiryDate = new Date(vehicle.fitness.expiry_date);
    const now = new Date();
    // Normalize to start of day
    expiryDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    switch (vehicle.fitness_status) {
      case 'ACTIVE':
        return { 
          title: "ACTIVE", 
          color: "bg-emerald-500", 
          bg: "bg-emerald-50",
          message: `Valid until\n${formatDate(vehicle.fitness.expiry_date)}\n\n${daysDiff} days remaining` 
        };
      case 'EXPIRING_SOON':
        return { 
          title: "EXPIRING SOON", 
          color: "bg-amber-500", 
          bg: "bg-amber-50",
          message: `Valid until\n${formatDate(vehicle.fitness.expiry_date)}\n\nOnly ${daysDiff} days remaining` 
        };
      case 'EXPIRED':
        return { 
          title: "EXPIRED", 
          color: "bg-red-500", 
          bg: "bg-red-50",
          message: `Expired on\n${formatDate(vehicle.fitness.expiry_date)}\n\n${Math.abs(daysDiff)} days ago` 
        };
      case 'NOT_AVAILABLE':
        return { 
          title: "NOT AVAILABLE", 
          color: "bg-slate-500", 
          bg: "bg-slate-50",
          message: "Fitness details missing" 
        };
      default:
        return { 
          title: "NOT AVAILABLE", 
          color: "bg-slate-500", 
          bg: "bg-slate-50",
          message: "Fitness details missing" 
        };
    }
  };

  const status = getStatusDetails();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-[#F8FAFC] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Fitness Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[15px] font-bold text-blue-700">{vehicle.vehicle_number}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[14px] text-slate-600 truncate max-w-[250px]">{vehicle.owner_name}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Status Card */}
          <div className={`${status.bg} border border-slate-200 rounded-xl p-5 shadow-sm`}>
            <div className="text-[12px] font-bold text-slate-500 tracking-wider mb-3">FITNESS STATUS</div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className={`text-xl font-bold tracking-tight text-slate-900`}>{status.title}</span>
                </div>
                <div className="text-[15px] text-slate-700 whitespace-pre-line leading-relaxed">
                  {status.message}
                </div>
              </div>
              
              {/* Timeline Graphic */}
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-[11px] text-slate-500 mb-1">Validity Period</div>
                <div className="flex items-center">
                   <div className="text-[12px] font-medium text-slate-700 w-20 text-right">
                     {vehicle.fitness?.issue_date ? formatDate(vehicle.fitness.issue_date) : "Start"}
                   </div>
                   <div className="w-24 h-1 bg-slate-300 mx-3 rounded relative">
                     {(vehicle.fitness_status === 'ACTIVE' || vehicle.fitness_status === 'EXPIRING_SOON') && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" title="Current"></div>
                     )}
                   </div>
                   <div className="text-[12px] font-medium text-slate-700 w-20">
                     {vehicle.fitness?.expiry_date ? formatDate(vehicle.fitness.expiry_date) : "Expiry"}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Vehicle Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2 w-full">Vehicle Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Vehicle Number</div>
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.vehicle_number}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Owner Name</div>
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.owner_name}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Vehicle Type</div>
                  {/* @ts-ignore */}
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.vehicleClass?.type || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Class</div>
                  {/* @ts-ignore */}
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.vehicleClass?.name || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Make</div>
                  {/* @ts-ignore */}
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.make?.name || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Model</div>
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.model || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Registration Date</div>
                  <div className="text-[14px] font-medium text-slate-900">{formatDate(vehicle.registration_date)}</div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link href={`/vehicles/view?id=${vehicle.id}`} className="inline-flex items-center text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  View Vehicle Profile
                </Link>
              </div>
            </div>

            {/* Fitness Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Fitness Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Fitness From Date</div>
                  <div className="text-[14px] font-medium text-slate-900">{formatDate(vehicle.fitness?.issue_date)}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Fitness Up To Date</div>
                  <div className="text-[14px] font-medium text-slate-900">{formatDate(vehicle.fitness?.expiry_date)}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Fitness Certificate No.</div>
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.fitness?.certificate_number || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Passed By</div>
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.fitness?.passed_by || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Place</div>
                  <div className="text-[14px] font-medium text-slate-900">{vehicle.fitness?.place || "—"}</div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-blue-50/50 -mx-5 -mb-5 p-5 rounded-b-xl border-t-blue-100">
                <div className="text-[13px] text-blue-700 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  Fitness information is managed from Motor Vehicle Entry.
                </div>
                <Link href={`/vehicles/view?id=${vehicle.id}`} className="inline-flex h-[32px] items-center justify-center rounded-[6px] bg-white border border-blue-200 px-3 text-[13px] font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm">
                  View Motor Entry
                </Link>
              </div>
            </div>

            {/* Related Compliance */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Related Compliance</h3>
              
              <div className="space-y-3">
                {/* Tax */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-slate-900">Tax</div>
                      <div className="text-[12px] text-slate-500">Motor Vehicle Tax</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {vehicle.tax_status === 'ACTIVE' && <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">ACTIVE</span>}
                    {vehicle.tax_status === 'EXPIRING_SOON' && <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">EXPIRING</span>}
                    {vehicle.tax_status === 'EXPIRED' && <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">EXPIRED</span>}
                    {vehicle.tax_status === 'DUE' && <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">N/A</span>}
                    <Link href={`/tax`} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Other Compliances could be added here in similar fashion, but for now we keep it minimal */}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2 w-full">Related Documents</h3>
              </div>
              
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-[14px] font-medium text-slate-900">No fitness documents available</p>
                <p className="text-[13px] text-slate-500 mt-1 max-w-[250px] mx-auto">Documents uploaded in Motor Entry will appear here.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
