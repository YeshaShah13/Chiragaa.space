import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";

interface PermanentAddressProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function PermanentAddress({ register, errors }: PermanentAddressProps) {
  return (
    <div className="border border-blue-200 rounded-md p-3 bg-white shadow-sm flex items-start">
      <div className="w-[120px] pt-1">
        <div className="text-[13px] font-bold text-blue-700 leading-tight">
          Permanent<br />Address
        </div>
      </div>
      <div className="flex-1 flex px-2">
        <span className="text-[13px] font-bold text-slate-800 pr-4 pt-1">:</span>
        <textarea
          className="flex-1 h-[60px] rounded border border-blue-200 bg-[#f8faff] px-2 py-1 text-[13px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
          {...register("permanent_address")}
        />
      </div>
    </div>
  );
}
