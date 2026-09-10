"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { MotorVehicleForm } from "@/components/vehicles/motor-vehicle-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { PermissionGuard } from "@/components/auth/permission-guard";

export default function AddVehiclePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      const response = await apiClient.post("/vehicles", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      alert("Vehicle created successfully.");
      router.push(`/vehicles/view?id=${data.data.id}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to create vehicle.");
    }
  });

  const handleSave = async (data: VehicleFormValues) => {
    await mutation.mutateAsync(data);
  };

  return (
    <PermissionGuard permission="motor_management.create" showPageDenied>
      <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <MotorVehicleForm mode="create" onSave={handleSave} />
        </div>
      </div>
    </PermissionGuard>
  );
}
