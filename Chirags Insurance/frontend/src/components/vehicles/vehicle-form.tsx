"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { vehicleSchema, type VehicleFormValues } from "@/lib/validations/vehicle";
import { apiClient } from "@/lib/api-client";

interface VehicleFormProps {
  vehicleId?: string;
}

export function VehicleForm({ vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: "Active",
    },
  });

  const { data: vehicleData, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles/view?id=${vehicleId}`);
      return response.data.data;
    },
    enabled: !!vehicleId,
  });

  useEffect(() => {
    if (vehicleData) {
      reset(vehicleData);
    }
  }, [vehicleData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      if (vehicleId) {
        const response = await apiClient.put(`/vehicles/view?id=${vehicleId}`, data);
        return response.data;
      } else {
        const response = await apiClient.post("/vehicles", data);
        return response.data;
      }
    },
    onSuccess: () => {
      setSuccessMsg(vehicleId ? "Vehicle updated successfully!" : "Vehicle created successfully!");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (vehicleId) queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      setTimeout(() => {
        router.push("/vehicles");
      }, 1500);
    },
    onError: (error: any) => {
      setErrorMsg(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    mutation.mutate(data);
  };

  if (vehicleId && isLoadingVehicle) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errorMsg && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20">
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="rounded-md bg-green-100 p-4 text-sm text-green-800 font-medium border border-green-200">
          {successMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vehicle_number" className="text-sm font-medium leading-none">
            Vehicle Number *
          </label>
          <input
            {...register("vehicle_number")}
            id="vehicle_number"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm uppercase placeholder:normal-case shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. MH01AB1234"
          />
          {errors.vehicle_number?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {String(errors.vehicle_number.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="owner_name" className="text-sm font-medium leading-none">
            Owner Name
          </label>
          <input
            {...register("owner_name")}
            id="owner_name"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Full Name"
          />
          {errors.owner_name?.message && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {String(errors.owner_name.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium leading-none">
            Phone Number
          </label>
          <input
            {...register("phone")}
            id="phone"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium leading-none">
            Vehicle Model
          </label>
          <input
            {...register("model")}
            id="model"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Swift Dzire"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="engine_number" className="text-sm font-medium leading-none">
            Engine Number
          </label>
          <input
            {...register("engine_number")}
            id="engine_number"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm uppercase placeholder:normal-case shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="chassis_number" className="text-sm font-medium leading-none">
            Chassis Number
          </label>
          <input
            {...register("chassis_number")}
            id="chassis_number"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm uppercase placeholder:normal-case shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium leading-none">
            Status
          </label>
          <select
            {...register("status")}
            id="status"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 border-t pt-6">
        <button
          type="button"
          onClick={() => router.push("/vehicles")}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Vehicle
        </button>
      </div>
    </form>
  );
}
