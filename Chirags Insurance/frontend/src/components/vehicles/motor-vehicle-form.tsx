"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { vehicleSchema, VehicleFormValues } from "@/lib/validations/vehicle";
import { Vehicle } from "@/types/vehicle";
import { BasicVehicleInformation } from "./BasicVehicleInformation";
import { PermanentAddress } from "./PermanentAddress";
import { GeneralDetails } from "./GeneralDetails";
import { TaxDetails } from "./TaxDetails";
import { FitnessDetails } from "./FitnessDetails";
import { PermitDetails } from "./PermitDetails";
import { NationalPermitDetails } from "./NationalPermitDetails";
import { InsuranceDetails } from "./InsuranceDetails";
import { AdditionalInformation } from "./AdditionalInformation";
import { MotorVehicleActionBar } from "./MotorVehicleActionBar";

interface MotorVehicleFormProps {
  mode: "create" | "edit";
  initialData?: Vehicle;
  vehicleId?: string;
  onSave?: (data: VehicleFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function MotorVehicleForm({ mode, initialData, vehicleId, onSave, onDelete }: MotorVehicleFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: makes } = useQuery({ queryKey: ["vehicle-makes"], queryFn: async () => (await apiClient.get("/vehicle-makes")).data.data });
  const { data: classes } = useQuery({ queryKey: ["vehicle-classes"], queryFn: async () => (await apiClient.get("/vehicle-classes")).data.data });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      status: "Active",
      tax: { yearly: false, half_yearly: false },
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        ...initialData,
      } as any);
    }
  }, [initialData, mode, reset]);

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      setIsSaving(true);
      const payload = { ...data };

      // Clean up compliance objects to prevent validation errors if they are empty or only have defaults
      const isTaxEmpty = !payload.tax?.tax_up_to_date && !payload.tax?.tax_paid_date && !payload.tax?.amount && !payload.tax?.receipt_no;
      if (payload.tax && isTaxEmpty) delete payload.tax;
      
      const isFitnessEmpty = !payload.fitness?.fitness_up_to_date && !payload.fitness?.passed_by && !payload.fitness?.place;
      if (payload.fitness && isFitnessEmpty) delete payload.fitness;
      
      const isPermitEmpty = !payload.permit?.permit_up_to_date && !payload.permit?.permit_no && !payload.permit?.amount;
      if (payload.permit && isPermitEmpty) delete payload.permit;
      
      const isNationalPermitEmpty = !payload.national_permit?.national_permit_up_to_date && !payload.national_permit?.national_permit_state;
      if (payload.national_permit && isNationalPermitEmpty) delete payload.national_permit;
      
      const isInsuranceEmpty = !payload.insurance?.insurance_company_id && !payload.insurance?.insurance_expiry_date && !payload.insurance?.policy_no;
      if (payload.insurance && isInsuranceEmpty) delete payload.insurance;

      if (onSave) {
        await onSave(payload);
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      alert("Error during save process: " + (error?.response?.data?.message || error?.message || String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setIsDeleting(true);
      try {
        if (onDelete) await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleReset = () => {
    reset();
  };

  const handleInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    try {
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const firstErrorKey = errorKeys[0];
        
        // Try exact match first
        let element = document.querySelector(`[name="${firstErrorKey}"]`);
        
        // If not found, try nested path (e.g. tax.amount)
        if (!element && errors[firstErrorKey] && typeof errors[firstErrorKey] === 'object') {
           const nestedKey = Object.keys(errors[firstErrorKey])[0];
           element = document.querySelector(`[name="${firstErrorKey}.${nestedKey}"]`);
        }

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          (element as HTMLElement).focus();
        }
      }
    } catch (err) {
      console.error("Failed to scroll to error", err);
    }
  };

  const handleExit = () => {
    router.push("/vehicles");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="w-full h-full bg-slate-50 flex flex-col font-sans relative">
      
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="cursor-pointer hover:text-blue-700" onClick={handleExit}>Vehicles</span>
            <span>/</span>
            <span>Motor Vehicle Entry</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-semibold text-slate-900 leading-tight tracking-tight">
            {mode === "create" ? "Add Vehicle" : "Edit Vehicle"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage vehicle registration, technical, tax and compliance information.
          </p>
        </div>
        
        {/* Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            type="button" 
            onClick={handleExit}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            Back to Vehicles
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit(onSubmit as any, handleInvalid)()}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-28">
          
          <div className="bg-blue-50 text-blue-800 text-sm px-4 py-3 rounded-md border border-blue-100 flex items-center gap-2">
            Fields marked with <span className="text-red-600 font-bold">*</span> are required.
          </div>

          <BasicVehicleInformation 
            register={register} 
            errors={errors} 
            mode={mode}
            isSaving={isSaving}
            isDeleting={isDeleting}
            onDeleteClick={handleDelete}
          />
          
          <GeneralDetails 
            register={register} 
            errors={errors} 
            setValue={setValue} 
            watch={watch} 
            classes={classes} 
            makes={makes} 
          />
          <TaxDetails register={register} errors={errors} />
          
          <PermitDetails register={register} errors={errors} />
          
          <InsuranceDetails register={register} errors={errors} />
          <AdditionalInformation register={register} errors={errors} />
        </div>
      </div>

      <MotorVehicleActionBar 
        mode={mode} 
        isSaving={isSaving} 
        isDeleting={isDeleting} 
        onReset={handleReset}
        onExit={handleExit}
        onSave={() => {
          handleSubmit(onSubmit as any, handleInvalid)();
        }}
        onSaveAndNew={() => {
          handleSubmit(async (data) => {
            await onSubmit(data);
            reset();
          }, handleInvalid)();
        }}
        onDelete={handleDelete}
        onPrint={handlePrint}
      />
    </form>
  );
}
