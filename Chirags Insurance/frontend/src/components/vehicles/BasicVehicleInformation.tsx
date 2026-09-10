import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";
import { CalendarIcon } from "lucide-react";

interface BasicVehicleInformationProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
  mode?: "create" | "edit";
  isSaving?: boolean;
  isDeleting?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

export function BasicVehicleInformation({ 
  register, 
  errors,
}: BasicVehicleInformationProps) {
  const inputClass = "w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-[15px] font-medium text-slate-700 mb-1.5";
  const errorClass = "text-sm text-red-600 mt-1.5";

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Vehicle Identity</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div>
            <label className={labelClass}>
              MMV. No.
            </label>
            <input
              type="text"
              placeholder="Enter MMV number"
              className={`${inputClass} ${errors.vehicle_number ? 'border-red-500 focus:ring-red-500' : ''}`}
              {...register("vehicle_number")}
            />
            {errors.vehicle_number?.message && (
              <p className={errorClass}>{String(errors.vehicle_number.message)}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Registration Date</label>
            <div className="relative">
              <input
                type="date"
                className={inputClass}
                {...register("registration_date")}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Trolly No.</label>
            <input
              type="text"
              placeholder="Enter Trolly number"
              className={inputClass}
              {...register("troli_no")}
            />
          </div>

          <div>
            <label className={labelClass}>Tractor Reg. Date</label>
            <div className="relative">
              <input
                type="date"
                className={inputClass}
                {...register("tractor_registration_date")}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Vehicle/Owner Name
            </label>
            <input
              type="text"
              placeholder="Enter full owner name"
              className={`${inputClass} ${errors.owner_name ? 'border-red-500 focus:ring-red-500' : ''}`}
              {...register("owner_name")}
            />
            {errors.owner_name?.message && (
              <p className={errorClass}>{String(errors.owner_name.message)}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Permanent Address</label>
            <textarea
              placeholder="Enter complete permanent address"
              className={`${inputClass} h-auto min-h-[80px] py-3 resize-y`}
              {...register("permanent_address")}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
