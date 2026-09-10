import { Vehicle } from "@/types/vehicle";
import { ArrowUpDown, ChevronRight } from "lucide-react";

interface TaxTableProps {
  vehicles: Vehicle[];
  onSort: (key: string) => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onVehicleSelect: (vehicle: Vehicle) => void;
  isLoading: boolean;
}

export function TaxTable({ vehicles, onSort, sortKey, sortDirection, onVehicleSelect, isLoading }: TaxTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">ACTIVE</span>;
      case 'EXPIRING_SOON':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">EXPIRING SOON</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-red-100 text-red-800">EXPIRED</span>;
      case 'DUE':
        return <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-orange-100 text-orange-800">DUE</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">UNKNOWN</span>;
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

  const calculateTotal = (tax?: Vehicle['tax']) => {
    if (!tax) return 0;
    const amount = parseFloat(tax.amount?.toString() || "0");
    const penalty = parseFloat(tax.penalty?.toString() || "0");
    const interest = parseFloat(tax.interest?.toString() || "0");
    return amount + penalty + interest;
  };

  const getFrequency = (tax?: Vehicle['tax']) => {
    if (tax?.yearly) return "Yearly";
    if (tax?.half_yearly) return "Half Yearly";
    return "-";
  };

  const SortHeader = ({ label, sortKeyName }: { label: string, sortKeyName: string }) => (
    <th 
      className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors select-none"
      onClick={() => onSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortKey === sortKeyName ? 'text-[#111111]' : 'text-slate-300'}`} />
      </div>
    </th>
  );

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-[#E5E5E5]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <SortHeader label="Vehicle" sortKeyName="vehicle_number" />
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider">Owner</th>
              <SortHeader label="Tax To" sortKeyName="tax_to" />
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider">Frequency</th>
              <SortHeader label="Total" sortKeyName="amount" />
              <SortHeader label="Payment Date" sortKeyName="payment_date" />
              <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#777777] uppercase tracking-wider">Receipt No.</th>
              <SortHeader label="Status" sortKeyName="status" />
              <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#777777] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E5E5]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-24 mb-1"></div><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-slate-200 rounded w-16"></div></td>
                  <td className="px-4 py-4"></td>
                </tr>
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#777777]">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[15px] font-medium text-[#111111] mb-1">No Tax Records Found</p>
                    <p className="text-sm">Tax information will appear here when vehicles contain tax details in Motor Entry.</p>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr 
                  key={vehicle.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onVehicleSelect(vehicle)}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#111111] text-[14px]">{vehicle.vehicle_number}</div>
                    {/* @ts-ignore */}
                    <div className="text-[12px] text-[#777777]">{vehicle.make?.name || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[14px] text-[#111111] truncate max-w-[180px]" title={vehicle.owner_name}>
                      {vehicle.owner_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[14px] text-[#111111]">
                      {formatDate(vehicle.tax?.tax_up_to_date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-[#777777]">{getFrequency(vehicle.tax)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[14px] font-medium text-[#111111]">
                      {formatCurrency(calculateTotal(vehicle.tax))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[14px] text-[#111111]">
                      {formatDate(vehicle.tax?.tax_paid_date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-medium text-[#111111] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E5E5E5] inline-block">
                      {vehicle.tax?.receipt_no || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(vehicle.tax_status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-slate-400 hover:text-[#111111] transition-colors p-1.5 rounded hover:bg-[#F8FAFC]">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
