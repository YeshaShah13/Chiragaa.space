import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";
import { useEffect } from "react";

interface GeneralDetailsProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
  setValue?: UseFormSetValue<VehicleFormValues>;
  watch?: UseFormWatch<VehicleFormValues>;
  classes?: any[];
  makes?: any[];
}

export function GeneralDetails({ register, errors, setValue, watch, classes, makes }: GeneralDetailsProps) {
  const inputClass = "w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-[15px] font-medium text-slate-700 mb-1.5";
  const errorClass = "text-sm text-red-600 mt-1.5";

  const rlw = watch ? watch("rlw") : undefined;
  const uw = watch ? watch("uw") : undefined;
  const plw = watch ? watch("plw") : undefined;

  const plwNum = plw !== undefined && plw !== null && plw !== "" ? parseFloat(String(plw)) : undefined;
  const isNegativePlw = plwNum !== undefined && !isNaN(plwNum) && plwNum < 0;

  // Auto-calculate PLW when RLW or UW changes
  useEffect(() => {
    if (setValue && (rlw !== undefined || uw !== undefined)) {
      const rlwNum = parseFloat(String(rlw ?? "")) || 0;
      const uwNum = parseFloat(String(uw ?? "")) || 0;
      
      if (rlw !== undefined || uw !== undefined) {
        const calculatedPlw = rlwNum - uwNum;
        setValue("plw", calculatedPlw, { shouldDirty: true });
      }
    }
  }, [rlw, uw, setValue]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">General Vehicle Details</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
          
          {/* Row 1 */}
          <div className="md:col-span-1">
            <label className={labelClass}>Class</label>
            <input type="text" className={inputClass} {...register("class_id")} placeholder="e.g. LMV" />
          </div>
          
          <div className="md:col-span-1">
            <label className={labelClass}>Make</label>
            <select className={inputClass} {...register("make_id")}>
              <option value="">Select Make</option>
              {makes?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className={labelClass}>Model</label>
            <input type="text" className={inputClass} {...register("model")} placeholder="Vehicle Model" />
          </div>

          <div className="md:col-span-1">
            <label className={labelClass}>
              Chassis No. <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className={`${inputClass} ${errors.chassis_number ? 'border-red-500 focus:ring-red-500' : ''}`} 
              {...register("chassis_number")} 
              placeholder="Chassis Number" 
            />
            {errors.chassis_number?.message && <p className={errorClass}>{String(errors.chassis_number.message)}</p>}
          </div>

          {/* Row 2 */}
          <div className="md:col-span-1">
            <label className={labelClass}>Engine No.</label>
            <input type="text" className={inputClass} {...register("engine_number")} placeholder="Engine Number" />
          </div>

          <div className="md:col-span-1">
            <label className={labelClass}>Cylinder</label>
            <input type="number" className={inputClass} {...register("cylinder")} placeholder="No. of Cylinders" />
          </div>

          <div className="md:col-span-1">
            <label className={labelClass}>S.C. Ind</label>
            <input type="number" className={inputClass} {...register("s_c_ind")} placeholder="Seating Capacity" />
          </div>

          <div className="md:col-span-1">
            <label className={labelClass}>Horse Power (HP)</label>
            <input type="text" className={inputClass} {...register("horse_power")} placeholder="e.g. 100" />
          </div>

          {/* Row 3: Weight Values (RLW + | UW - | PLW =) */}
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[15px] font-medium text-slate-700">RLW</label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">(+) Laden Wt.</span>
            </div>
            <input 
              type="number" 
              step="any"
              className={inputClass} 
              {...register("rlw", {
                onChange: (e) => {
                  const rlwVal = parseFloat(e.target.value) || 0;
                  const uwVal = parseFloat(String(watch ? watch("uw") : 0)) || 0;
                  if (setValue) {
                    setValue("plw", rlwVal - uwVal, { shouldDirty: true });
                  }
                }
              })} 
              placeholder="Reg. Laden Wt." 
            />
          </div>

          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[15px] font-medium text-slate-700">UW</label>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">(-) Unladen Wt.</span>
            </div>
            <input 
              type="number" 
              step="any"
              className={inputClass} 
              {...register("uw", {
                onChange: (e) => {
                  const uwVal = parseFloat(e.target.value) || 0;
                  const rlwVal = parseFloat(String(watch ? watch("rlw") : 0)) || 0;
                  if (setValue) {
                    setValue("plw", rlwVal - uwVal, { shouldDirty: true });
                  }
                }
              })} 
              placeholder="Unladen Wt." 
            />
          </div>

          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[15px] font-medium text-slate-700">PLW</label>
              {isNegativePlw ? (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  (-) Negative Payload
                </span>
              ) : (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  (=) Auto: RLW - UW
                </span>
              )}
            </div>
            <input 
              type="number" 
              step="any"
              readOnly
              tabIndex={-1}
              className={`${inputClass} cursor-not-allowed select-none ${
                isNegativePlw
                  ? "bg-rose-50/70 border-rose-300 text-rose-700 font-bold focus:ring-0 focus:border-rose-300"
                  : "bg-slate-100 border-slate-300 text-slate-800 font-bold focus:ring-0 focus:border-slate-300"
              }`} 
              {...register("plw")} 
              placeholder="Auto-calculated (RLW - UW)" 
              title="Payload weight is automatically calculated as RLW minus UW"
            />
            {isNegativePlw ? (
              <p className="text-[12px] text-rose-600 mt-1 font-medium">
                (-) Negative: Unladen Wt. exceeds Laden Wt.
              </p>
            ) : (
              <p className="text-[12px] text-slate-500 mt-1 font-normal">
                Auto-calculated from (= RLW - UW)
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
