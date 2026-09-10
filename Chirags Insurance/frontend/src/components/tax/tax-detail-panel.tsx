import { Vehicle } from "@/types/vehicle";
import { X, ExternalLink, FileText, Printer, FileDown } from "lucide-react";
import Link from "next/link";

interface TaxDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function TaxDetailPanel({ vehicle, onClose }: TaxDetailPanelProps) {
  if (!vehicle) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number | string) => {
    if (!amount) return "₹0.00";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  const getStatusDetails = () => {
    if (!vehicle.tax?.tax_up_to_date) {
      return { 
        title: "DUE / UNKNOWN", 
        color: "bg-orange-500", 
        bg: "bg-orange-50",
        message: "No tax validity date set" 
      };
    }

    const expiryDate = new Date(vehicle.tax.tax_up_to_date);
    const now = new Date();
    const daysDiff = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    switch (vehicle.tax_status) {
      case 'ACTIVE':
        return { 
          title: "ACTIVE", 
          color: "bg-emerald-500", 
          bg: "bg-emerald-50",
          message: `Valid until\n${formatDate(vehicle.tax.tax_up_to_date)}\n\n${daysDiff} days remaining` 
        };
      case 'EXPIRING_SOON':
        return { 
          title: "EXPIRING SOON", 
          color: "bg-amber-500", 
          bg: "bg-amber-50",
          message: `Valid until\n${formatDate(vehicle.tax.tax_up_to_date)}\n\nOnly ${daysDiff} days remaining` 
        };
      case 'EXPIRED':
        return { 
          title: "EXPIRED", 
          color: "bg-red-500", 
          bg: "bg-red-50",
          message: `Expired on\n${formatDate(vehicle.tax.tax_up_to_date)}\n\n${Math.abs(daysDiff)} days ago` 
        };
      case 'DUE':
        return { 
          title: "DUE", 
          color: "bg-orange-500", 
          bg: "bg-orange-50",
          message: `Payment due for period ending\n${formatDate(vehicle.tax.tax_up_to_date)}` 
        };
      default:
        return { 
          title: "UNKNOWN", 
          color: "bg-slate-500", 
          bg: "bg-slate-50",
          message: "Status unknown" 
        };
    }
  };

  const status = getStatusDetails();
  
  const taxAmount = parseFloat(vehicle.tax?.amount?.toString() || "0");
  const penalty = parseFloat(vehicle.tax?.penalty?.toString() || "0");
  const interest = parseFloat(vehicle.tax?.interest?.toString() || "0");
  const totalAmount = taxAmount + penalty + interest;

  const getFrequency = () => {
    if (vehicle.tax?.yearly) return "Yearly";
    if (vehicle.tax?.half_yearly) return "Half Yearly";
    return "-";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-[#F8FAFC] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Tax Details</h2>
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
            <div className="text-[12px] font-bold text-slate-500 tracking-wider mb-3">TAX STATUS</div>
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
                   <div className="text-[12px] font-medium text-slate-700 w-20 text-right">{formatDate(vehicle.tax?.tax_paid_date)}</div>
                   <div className="w-24 h-1 bg-slate-300 mx-3 rounded relative">
                     {vehicle.tax_status === 'ACTIVE' && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" title="Current"></div>
                     )}
                   </div>
                   <div className="text-[12px] font-medium text-slate-700 w-20">{formatDate(vehicle.tax?.tax_up_to_date)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex justify-between items-center">
                  Vehicle Information
                  <Link href={`/vehicles/view?id=${vehicle.id}`} className="text-[12px] text-blue-600 hover:underline flex items-center gap-1 font-medium">
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </h3>
                <div className="space-y-3 text-[14px]">
                  <div className="grid grid-cols-3"><span className="text-slate-500">M.V. No</span><span className="col-span-2 font-medium text-slate-900">{vehicle.vehicle_number}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">Owner</span><span className="col-span-2 font-medium text-slate-900">{vehicle.owner_name}</span></div>
                  {/* @ts-ignore */}
                  <div className="grid grid-cols-3"><span className="text-slate-500">Make</span><span className="col-span-2 font-medium text-slate-900">{vehicle.make?.name || '-'}</span></div>
                  {/* @ts-ignore */}
                  <div className="grid grid-cols-3"><span className="text-slate-500">Type</span><span className="col-span-2 font-medium text-slate-900">{vehicle.vehicle_class?.name || '-'}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">Model</span><span className="col-span-2 font-medium text-slate-900">{vehicle.model || '-'}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">Reg Date</span><span className="col-span-2 font-medium text-slate-900">{formatDate(vehicle.registration_date)}</span></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex justify-between items-center">
                  Tax Information
                  <Link href={`/vehicles/edit?id=${vehicle.id}`} className="text-[12px] text-blue-600 hover:underline font-medium">
                    Edit Motor Entry
                  </Link>
                </h3>
                <div className="space-y-3 text-[14px]">
                  <div className="grid grid-cols-3"><span className="text-slate-500">From Date</span><span className="col-span-2 font-medium text-slate-900">{formatDate(vehicle.tax?.tax_paid_date)}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">To Date</span><span className="col-span-2 font-medium text-slate-900">{formatDate(vehicle.tax?.tax_up_to_date)}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">Frequency</span><span className="col-span-2 font-medium text-slate-900">{getFrequency()}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">Payment Date</span><span className="col-span-2 font-medium text-slate-900">{formatDate(vehicle.tax?.tax_paid_date)}</span></div>
                  <div className="grid grid-cols-3"><span className="text-slate-500">Receipt No.</span><span className="col-span-2 font-medium text-slate-900">{vehicle.tax?.receipt_no || '-'}</span></div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">Payment Summary</h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between"><span className="text-slate-500">Tax Amount</span><span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Penalty</span><span className="font-medium text-slate-900">{formatCurrency(penalty)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Interest</span><span className="font-medium text-slate-900">{formatCurrency(interest)}</span></div>
                  <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-slate-900 text-[16px]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">Related Documents</h3>
                <div className="space-y-2">
                  <Link 
                    href="/reports/at-form" 
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="bg-blue-100 p-2 rounded text-blue-600"><FileText className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-slate-900 group-hover:text-blue-700">A.T. Form</div>
                      <div className="text-[12px] text-slate-500">Generate tax declaration</div>
                    </div>
                  </Link>
                  <Link 
                    href="/reports/cfra-form" 
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="bg-emerald-100 p-2 rounded text-emerald-600"><FileText className="w-4 h-4" /></div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-slate-900 group-hover:text-emerald-700">CFRA Form</div>
                      <div className="text-[12px] text-slate-500">Generate CFRA document</div>
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="border-t border-slate-200 bg-white p-5 shrink-0 flex items-center justify-between">
           <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
             ⓘ Tax information is managed from Motor Vehicle Entry.
           </div>
           <Link 
             href={`/vehicles/edit?id=${vehicle.id}`}
             className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center gap-2"
           >
             Edit Motor Entry
           </Link>
        </div>

      </div>
    </div>
  );
}
