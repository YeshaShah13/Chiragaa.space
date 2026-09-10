import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";
import { CalendarIcon } from "lucide-react";

interface NationalPermitDetailsProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function NationalPermitDetails({ register, errors }: NationalPermitDetailsProps) {
  const inputClass = "h-[34px] rounded border border-blue-200 bg-[#f8faff] px-2 text-[13px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";
  const labelClass = "text-[13px] font-bold text-slate-800 flex justify-between pr-2";
  
  return (
    <div className="w-full border border-blue-200 rounded-md bg-white shadow-sm flex flex-col">
      <div className="flex items-center px-3 pt-3 pb-2">
        <div className="w-2 h-2 bg-[#003399] mr-2"></div>
        <h3 className="text-[#003399] text-[14px] font-bold">National Permit Details</h3>
      </div>
      
      <div className="px-3 pb-3 flex flex-col gap-3">
        {/* Row 1 */}
        <div className="flex items-center gap-8">
          <div className="flex items-center w-[250px]">
            <div className={`w-[90px] ${labelClass}`}><span>Np_u_date</span><span>:</span></div>
            <div className="relative flex-1">
              <input
                type="date"
                className={`${inputClass} w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full`}
                {...register("national_permit.national_permit_up_to_date")}
              />
              <CalendarIcon className="absolute right-2 top-1.5 h-4 w-4 text-blue-600 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center w-[400px]">
            <div className={`w-[80px] ${labelClass}`}><span>Np_state</span><span>:</span></div>
            <input type="text" className={`${inputClass} flex-1`} {...register("national_permit.national_permit_state")} placeholder="NILL" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-8">
          <div className="flex items-center w-[750px]">
            <div className={`w-[120px] ${labelClass}`}><span>Postal Address</span><span>:</span></div>
            <textarea
              className={`${inputClass} flex-1 resize-none py-1`}
              {...register("national_permit.postal_address")}
            />
          </div>
          
          <div className="flex items-center flex-1 max-w-[400px]">
            <div className={`w-[60px] ${labelClass}`}><span>City</span><span>:</span></div>
            <input type="text" className={`${inputClass} flex-1`} {...register("national_permit.city")} />
          </div>
        </div>
      </div>
    </div>
  );
}
