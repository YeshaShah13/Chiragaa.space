import { UseFormRegister, FieldErrors } from "react-hook-form";
import { InsuranceEntryFormValues } from "@/lib/validations/insurance-entry";

interface PremiumDetailsProps {
  register: UseFormRegister<InsuranceEntryFormValues>;
  errors: FieldErrors<InsuranceEntryFormValues>;
  calculatedTotal: number;
}

export function PremiumDetailsCard({ register, errors, calculatedTotal }: PremiumDetailsProps) {
  
  const InputWithPrefix = ({ id, label, registerConfig }: { id: keyof InsuranceEntryFormValues, label: string, registerConfig: any }) => (
    <div className="space-y-2">
      <label className="text-[15px] font-medium text-[#111111]">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-medium text-[#999999]">₹</span>
        <input 
          type="number"
          step="0.01"
          {...registerConfig}
          className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 pl-8 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
        />
      </div>
      {errors[id] && <p className="text-[14px] text-red-600">{errors[id]?.message}</p>}
    </div>
  );

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Premium Details</h2>
        <p className="text-[16px] text-[#777777] mt-1">Enter the premium and insured value information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InputWithPrefix id="sum_insured" label="Sum Insured" registerConfig={register("sum_insured")} />
        <InputWithPrefix id="trolley_amount" label="Trolley Amount" registerConfig={register("trolley_amount")} />
        <InputWithPrefix id="other_amount" label="Other Amount" registerConfig={register("other_amount")} />
        
        <div className="space-y-2">
          <label className="text-[15px] font-medium text-[#111111]">NCB (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-medium text-[#999999]">₹</span>
            <input 
              type="number"
              step="0.01"
              {...register("ncb")}
              className="flex h-[48px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 pl-8 text-[16px] text-[#111111] transition-colors placeholder:text-[#999999] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
            />
          </div>
          {errors.ncb && <p className="text-[14px] text-red-600">{errors.ncb.message}</p>}
        </div>
        
        <InputWithPrefix id="od_tp_premium" label="OD & TP Premium" registerConfig={register("od_tp_premium")} />
        <InputWithPrefix id="service_tax" label="Service Tax" registerConfig={register("service_tax")} />
      </div>

      <div className="rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5] p-6 text-center">
        <h3 className="text-[15px] font-semibold text-[#777777] uppercase tracking-wider mb-2">Total Premium</h3>
        <p className="text-[40px] font-bold text-[#111111] tracking-tight">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(calculatedTotal)}
        </p>
      </div>
    </div>
  );
}
