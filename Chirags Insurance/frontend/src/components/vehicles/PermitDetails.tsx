import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";

interface PermitDetailsProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
}

export function PermitDetails({ register, errors }: PermitDetailsProps) {
  const inputClass = "w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  const labelClass = "block text-[15px] font-medium text-slate-700 mb-1.5";
  const sectionTitleClass = "text-[15px] font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between";

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Permit & Compliance</h2>
      </div>
      
      <div className="p-6 flex flex-col gap-8">
        
        {/* Fitness Section */}
        <div>
          <div className={sectionTitleClass}>
            <span>Fitness Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Up To Date</label>
              <div className="relative">
                <input type="date" className={inputClass} {...register("fitness.fitness_up_to_date")} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Passed By</label>
              <input type="text" className={inputClass} {...register("fitness.passed_by")} placeholder="Inspector/Authority Name" />
            </div>
            <div>
              <label className={labelClass}>Place</label>
              <input type="text" className={inputClass} {...register("fitness.place")} placeholder="Testing Location" />
            </div>
          </div>
        </div>

        {/* Standard Permit Section */}
        <div>
          <div className={sectionTitleClass}>
            <span>Standard Permit</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div>
              <label className={labelClass}>Permit No.</label>
              <input type="text" className={inputClass} {...register("permit.permit_no")} placeholder="Number" />
            </div>
            <div>
              <label className={labelClass}>Up To Date</label>
              <div className="relative">
                <input type="date" className={inputClass} {...register("permit.permit_up_to_date")} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Permit Date</label>
              <div className="relative">
                <input type="date" className={inputClass} {...register("permit.permit_date")} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Amount (Rs.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input type="number" step="0.01" className={`${inputClass} pl-8`} {...register("permit.amount")} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Receipt No.</label>
              <input type="text" className={inputClass} {...register("permit.receipt_no")} placeholder="Receipt" />
            </div>
          </div>
        </div>

        {/* National Permit Section */}
        <div>
          <div className={sectionTitleClass}>
            <span>National Permit</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Up To Date</label>
                <div className="relative">
                  <input type="date" className={inputClass} {...register("national_permit.national_permit_up_to_date")} />
                </div>
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" className={inputClass} {...register("national_permit.national_permit_state")} placeholder="e.g. NILL" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>City</label>
                <input type="text" className={inputClass} {...register("national_permit.city")} placeholder="City" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Postal Address</label>
              <textarea 
                className={`${inputClass} h-full min-h-[120px] resize-y py-3`} 
                {...register("national_permit.postal_address")} 
                placeholder="Full postal address for national permit..."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
