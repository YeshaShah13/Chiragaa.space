import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";
import { CalendarIcon } from "lucide-react";

interface FitnessDetailsProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function FitnessDetails({ register, errors }: FitnessDetailsProps) {
  const inputClass = "h-[34px] rounded border border-blue-200 bg-[#f8faff] px-2 text-[13px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";
  const labelClass = "text-[13px] font-bold text-slate-800 flex justify-between pr-2";
  
  return (
    <div className="flex-[4.2] border border-blue-200 rounded-md bg-white shadow-sm flex flex-col">
      <div className="flex items-center px-3 pt-3 pb-2">
        <div className="w-2 h-2 bg-[#003399] mr-2"></div>
        <h3 className="text-[#003399] text-[14px] font-bold">Fitness Details</h3>
      </div>
      
      <div className="px-3 pb-3 flex flex-col gap-2">
        <div className="flex items-center">
          <div className={`w-[85px] ${labelClass}`}><span>Up To Date</span><span>:</span></div>
          <div className="relative w-[150px]">
            <input
              type="date"
              className={`${inputClass} w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full`}
              {...register("fitness.fitness_up_to_date")}
            />
            <CalendarIcon className="absolute right-2 top-1.5 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>
        </div>
        
        <div className="flex items-center">
          <div className={`w-[85px] ${labelClass}`}><span>Passed By</span><span>:</span></div>
          <input type="text" className={`${inputClass} w-[150px]`} {...register("fitness.passed_by")} />
        </div>
        
        <div className="flex items-center">
          <div className={`w-[85px] ${labelClass}`}><span>Place</span><span>:</span></div>
          <input type="text" className={`${inputClass} w-[150px]`} {...register("fitness.place")} />
        </div>
      </div>
    </div>
  );
}
