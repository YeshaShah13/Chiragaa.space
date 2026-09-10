import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";

interface TaxDetailsProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function TaxDetails({ register, errors }: TaxDetailsProps) {
  const inputClass = "w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-[15px] font-medium text-slate-700 mb-1.5";
  const sectionTitleClass = "text-[15px] font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100";

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Tax Details</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          
          {/* Tax Validity */}
          <div>
            <h3 className={sectionTitleClass}>Tax Validity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Up To Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className={inputClass}
                    {...register("tax.tax_up_to_date")}
                  />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Paid Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className={inputClass}
                    {...register("tax.tax_paid_date")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className={sectionTitleClass}>Payment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Amount (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input type="number" step="0.01" className={`${inputClass} pl-8`} {...register("tax.amount")} placeholder="0.00" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Receipt No.</label>
                <input type="text" className={inputClass} {...register("tax.receipt_no")} placeholder="Receipt Number" />
              </div>

              <div>
                <label className={labelClass}>Penalty (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input type="number" step="0.01" className={`${inputClass} pl-8`} {...register("tax.penalty")} placeholder="0.00" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Interest (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input type="number" step="0.01" className={`${inputClass} pl-8`} {...register("tax.interest")} placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Yearly?</label>
                <div className="flex gap-2">
                  <select className={`${inputClass} w-24`} {...register("tax.yearly" as any)}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  <input type="number" step="0.01" className={inputClass} {...register("tax.yearly_amount")} placeholder="Rs." />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Half Yearly?</label>
                <div className="flex gap-2">
                  <select className={`${inputClass} w-24`} {...register("tax.half_yearly" as any)}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  <input type="number" step="0.01" className={inputClass} {...register("tax.half_yearly_amount")} placeholder="Rs." />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
