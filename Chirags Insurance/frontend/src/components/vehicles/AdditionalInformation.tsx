import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";

interface AdditionalInformationProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function AdditionalInformation({ register, errors }: AdditionalInformationProps) {
  const inputClass = "w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-[15px] font-medium text-slate-700 mb-1.5";

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Additional Information</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="md:col-span-2">
            <label className={labelClass}>HPA With</label>
            <input type="text" className={inputClass} {...register("hpa_with")} placeholder="Hypothecation Details" />
          </div>
          
          <div className="md:col-span-1">
            <label className={labelClass}>Remarks</label>
            <input type="text" className={inputClass} {...register("remarks")} placeholder="Any additional remarks..." />
          </div>
          
          <div className="md:col-span-1">
            <label className={labelClass}>Group</label>
            <input type="text" className={inputClass} {...register("group")} placeholder="Group" />
          </div>
          
        </div>
      </div>
    </div>
  );
}
