"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { MotorVehicleForm } from "@/components/vehicles/motor-vehicle-form";
import { VehicleFormValues } from "@/lib/validations/vehicle";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";

export default function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const response = await apiClient.get(`/vehicles/${id}`);
      return response.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: VehicleFormValues) => {
      const response = await apiClient.put(`/vehicles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", id] });
      alert("Vehicle updated successfully.");
      router.push(`/vehicles/${id}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update vehicle.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      alert("Vehicle deleted successfully.");
      router.push("/vehicles");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete vehicle.");
    }
  });

  const handleSave = async (data: VehicleFormValues) => {
    await mutation.mutateAsync(data);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (isError || !vehicle) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive text-center">
        Error loading vehicle details. The vehicle may not exist or has been deleted.
      </div>
    );
  }

  return (
    <PermissionGuard permission="motor_management.edit" showPageDenied>
      <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col">
        <div className="flex-none p-2 md:px-4 md:py-2 border-b bg-white flex justify-between items-center h-[50px]">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Link href="/vehicles" className="hover:text-primary">Vehicles</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/vehicles/${id}`} className="hover:text-primary">{vehicle.vehicle_number}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium text-sm text-blue-900 uppercase">Edit: {vehicle.vehicle_number}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <MotorVehicleForm 
            mode="edit" 
            initialData={vehicle} 
            vehicleId={id} 
            onSave={handleSave} 
            onDelete={handleDelete}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
