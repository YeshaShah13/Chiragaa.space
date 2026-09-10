import { AlertCircle, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface ComplianceStatus {
  expiryDate: string | null;
  status: 'VALID' | 'EXPIRED' | 'MISSING';
}

interface ComplianceProps {
  vehicleId: number;
  compliance: {
    tax: ComplianceStatus;
    fitness: ComplianceStatus;
    permit: ComplianceStatus;
    nationalPermit: ComplianceStatus;
  };
}

export function ComplianceCard({ vehicleId, compliance }: ComplianceProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALID': return <CheckCircle2 className="h-5 w-5 text-[#111111]" />;
      case 'EXPIRED': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-[#999999]" />;
    }
  };

  const getStatusText = (status: string, date: string | null) => {
    if (status === 'MISSING' || !date) return 'Not Available';
    return `Valid until ${new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const items = [
    { label: "Tax", data: compliance.tax },
    { label: "Fitness", data: compliance.fitness },
    { label: "Permit", data: compliance.permit },
    { label: "National Permit", data: compliance.nationalPermit },
  ];

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[#111111]">Vehicle Compliance</h2>
          <p className="text-[14px] text-[#777777] mt-1">
            Current compliance information for the selected vehicle.
          </p>
        </div>
        <Link 
          href={`/vehicles/${vehicleId}/compliance`}
          target="_blank"
          className="inline-flex items-center text-[15px] font-medium text-[#111111] hover:underline"
        >
          Manage Compliance
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col rounded-[12px] border border-[#E5E5E5] p-5 hover:bg-[#FAFAFA] transition-colors">
            <span className="text-[13px] font-medium text-[#777777] mb-3">
              {item.label}
            </span>
            <div className="flex items-center gap-3 mt-auto">
              {getStatusIcon(item.data.status)}
              <span className={`text-[14px] font-medium ${item.data.status === 'EXPIRED' ? 'text-red-600' : 'text-[#111111]'}`}>
                {getStatusText(item.data.status, item.data.expiryDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
