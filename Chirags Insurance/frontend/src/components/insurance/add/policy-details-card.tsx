import { UseFormRegister, FieldErrors } from "react-hook-form";
import { InsuranceEntryFormValues } from "@/lib/validations/insurance-entry";

interface PolicyDetailsProps {
  register: UseFormRegister<InsuranceEntryFormValues>;
  errors: FieldErrors<InsuranceEntryFormValues>;
}

export function PolicyDetailsCard({ register, errors }: PolicyDetailsProps) {
  // Static list for now, as specified in the plan
  const companies = [
    "GO DIGIT",
    "ICICI Lombard",
    "HDFC ERGO",
    "Bajaj Allianz",
    "Tata AIG",
    "New India Assurance",
    "Reliance General",
    "SBI General",
    "Other"
  ];

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Policy Details</h2>
        <p className="text-[16px] text-[#777777] mt-1">Enter the insurance policy information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1 */}
        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Insurance Company *</label>
          <select 
            {...register("insurance_company_name")}
            className="flex h-[48px] w-full items-center justify-between rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          >
            <option value="">Select company...</option>
            {companies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.insurance_company_name && <p className="text-[14px] text-red-600">{errors.insurance_company_name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Policy Number *</label>
          <input 
            {...register("policy_number")}
            placeholder="Enter policy number"
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
          {errors.policy_number && <p className="text-[14px] text-red-600">{errors.policy_number.message}</p>}
        </div>

        {/* Row 2 */}
        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Policy Expiry Date *</label>
          <input 
            type="date"
            {...register("expiry_date")}
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
          {errors.expiry_date && <p className="text-[14px] text-red-600">{errors.expiry_date.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Receipt Number</label>
          <input 
            {...register("receipt_number")}
            placeholder="Enter receipt number"
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Row 3 */}
        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Confirmation Number</label>
          <input 
            {...register("confirmation_number")}
            placeholder="Enter confirmation number"
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Confirmation Date</label>
          <input 
            type="date"
            {...register("confirmation_date")}
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Row 4 */}
        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Transfer Date</label>
          <input 
            type="date"
            {...register("transfer_date")}
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">Group</label>
          <input 
            {...register("group_name")}
            placeholder="Enter group"
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Row 5 */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[15px] font-medium text-[#111111]">HPA / Finance</label>
          <input 
            {...register("hpa_with")}
            placeholder="Enter HPA / finance information"
            className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Row 6 */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[15px] font-medium text-[#111111]">Remarks</label>
          <textarea 
            {...register("remarks")}
            placeholder="Add any additional remarks..."
            rows={3}
            className="flex w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-3 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
