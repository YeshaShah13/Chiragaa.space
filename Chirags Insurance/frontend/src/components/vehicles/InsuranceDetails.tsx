import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";

interface InsuranceDetailsProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function InsuranceDetails({ register, errors }: InsuranceDetailsProps) {
  const inputClass = "w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-[15px] font-medium text-slate-700 mb-1.5";

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">Insurance Information</h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-full border border-slate-200">
          Managed from Insurance Entry
        </span>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Insurance Company Name</label>
            <input type="text" className={inputClass} {...register("insurance.insurance_company_id")} placeholder="Company Name" />
          </div>
          
          <div>
            <label className={labelClass}>Policy No.</label>
            <input type="text" className={inputClass} {...register("insurance.policy_no")} placeholder="Policy Number" />
          </div>
          
          <div>
            <label className={labelClass}>Insurance Expiry Date</label>
            <div className="relative">
              <input type="date" className={inputClass} {...register("insurance.insurance_expiry_date")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
