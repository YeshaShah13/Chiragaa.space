interface PolicySummaryProps {
  vehicleNumber: string;
  companyName: string;
  policyNumber: string;
  expiryDate: string;
  totalPremium: number;
}

export function PolicySummary({ 
  vehicleNumber, 
  companyName, 
  policyNumber, 
  expiryDate, 
  totalPremium 
}: PolicySummaryProps) {
  
  // Basic frontend calculation for preview, backend is authoritative
  const getStatus = (dateStr: string) => {
    if (!dateStr) return 'Pending';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (date < today) return 'Expired';
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return 'Expiring Soon';
    return 'Active';
  };

  const status = getStatus(expiryDate);
  const statusColor = status === 'Active' ? 'text-green-600' : status === 'Expired' ? 'text-red-600' : 'text-orange-500';

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-[#FAFAFA] shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Policy Summary</h2>
      </div>

      <div className="flex flex-wrap items-center gap-6 md:gap-12">
        <div>
          <p className="text-[14px] font-medium text-[#777777] uppercase tracking-wider mb-1">Vehicle</p>
          <p className="text-[16px] font-medium text-[#111111]">{vehicleNumber || '-'}</p>
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#777777] uppercase tracking-wider mb-1">Insurance Company</p>
          <p className="text-[16px] font-medium text-[#111111]">{companyName || '-'}</p>
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#777777] uppercase tracking-wider mb-1">Policy Number</p>
          <p className="text-[16px] font-medium text-[#111111]">{policyNumber || '-'}</p>
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#777777] uppercase tracking-wider mb-1">Policy Expiry</p>
          <p className="text-[16px] font-medium text-[#111111]">
            {expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB') : '-'}
          </p>
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#777777] uppercase tracking-wider mb-1">Policy Status</p>
          <p className={`text-[16px] font-bold ${statusColor}`}>{status}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[12px] font-medium text-[#777777] uppercase tracking-wider mb-1">Total Premium</p>
          <p className="text-[20px] font-bold text-[#111111]">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalPremium)}
          </p>
        </div>
      </div>
    </div>
  );
}
