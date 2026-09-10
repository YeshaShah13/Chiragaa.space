"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  vehicle_number_format: z.string().optional(),
  default_vehicle_type: z.string().optional(),
  default_fuel_type: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function VehicleSettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);
  const [newMake, setNewMake] = useState("");
  const [newClass, setNewClass] = useState("");

  // Queries
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["settings", "Vehicle"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=Vehicle");
      return response.data.data;
    },
  });

  const { data: makes, isLoading: isLoadingMakes } = useQuery({
    queryKey: ["vehicle-makes"],
    queryFn: async () => {
      const response = await apiClient.get("/vehicle-makes");
      return response.data.data;
    },
  });

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["vehicle-classes"],
    queryFn: async () => {
      const response = await apiClient.get("/vehicle-classes");
      return response.data.data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_number_format: "XX00XX0000",
      default_vehicle_type: "Commercial",
      default_fuel_type: "Diesel",
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        vehicle_number_format: settings.vehicle_number_format || "",
        default_vehicle_type: settings.default_vehicle_type || "",
        default_fuel_type: settings.default_fuel_type || "",
      });
    }
  }, [settings, form]);

  // Mutations
  const updateSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value
      }));
      await apiClient.put("/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "Vehicle"] });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    },
  });

  const addMake = useMutation({
    mutationFn: async (name: string) => {
      await apiClient.post("/vehicle-makes", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-makes"] });
      setNewMake("");
    },
  });

  const deleteMake = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/vehicle-makes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-makes"] });
    },
  });

  const addClass = useMutation({
    mutationFn: async (name: string) => {
      await apiClient.post("/vehicle-classes", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-classes"] });
      setNewClass("");
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/vehicle-classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-classes"] });
    },
  });

  const onSubmit = (values: FormValues) => {
    updateSettings.mutate(values);
  };

  if (isLoadingSettings || isLoadingMakes || isLoadingClasses) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#A0A0A0]" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[20px] font-semibold text-[#111111]">Vehicle Settings & Master Data</h2>
          <p className="text-[14px] text-[#777777] mt-1">Manage vehicle defaults and relational lookup tables used in Motor Entry.</p>
        </div>
      </div>

      <div className="space-y-10">
        
        {/* Settings Form */}
        <form id="vehicle-settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Defaults & Formats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Vehicle Number Format Mask</label>
              <input 
                {...form.register("vehicle_number_format")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow uppercase" 
                placeholder="XX00XX0000"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Default Vehicle Type</label>
              <select 
                {...form.register("default_vehicle_type")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="Commercial">Commercial</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Default Fuel Type</label>
              <select 
                {...form.register("default_fuel_type")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="CNG">CNG</option>
                <option value="EV">Electric (EV)</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            {isSuccess && (
              <div className="flex items-center text-emerald-600 text-[14px] font-medium animate-in fade-in mr-4">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Saved
              </div>
            )}
            <button
              type="submit"
              disabled={updateSettings.isPending}
              className="inline-flex h-[36px] items-center justify-center rounded-[8px] bg-[#111111] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-50"
            >
              {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Defaults"}
            </button>
          </div>
        </form>

        {/* Master Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Vehicle Makes */}
          <div className="bg-[#F8FAFC] border border-[#E5E5E5] rounded-[12px] p-5">
            <h3 className="text-[15px] font-semibold text-[#111111] mb-4">Vehicle Makes</h3>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text"
                value={newMake}
                onChange={(e) => setNewMake(e.target.value)}
                placeholder="Add new make..."
                className="flex-1 h-9 px-3 rounded-[6px] border border-[#E5E5E5] bg-white text-[13px] focus:outline-none focus:border-blue-500" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMake.trim()) {
                    addMake.mutate(newMake.trim());
                  }
                }}
              />
              <button
                onClick={() => newMake.trim() && addMake.mutate(newMake.trim())}
                disabled={!newMake.trim() || addMake.isPending}
                className="h-9 px-3 bg-[#111111] text-white rounded-[6px] text-[13px] font-medium disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <ul className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {makes?.map((make: any) => (
                <li key={make.id} className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-[6px] px-3 py-2">
                  <span className="text-[13px] text-[#111111]">{make.name}</span>
                  <button 
                    onClick={() => deleteMake.mutate(make.id)}
                    disabled={deleteMake.isPending}
                    className="text-[#A0A0A0] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {makes?.length === 0 && (
                <p className="text-[13px] text-[#777777] text-center py-4">No makes defined</p>
              )}
            </ul>
          </div>

          {/* Vehicle Classes */}
          <div className="bg-[#F8FAFC] border border-[#E5E5E5] rounded-[12px] p-5">
            <h3 className="text-[15px] font-semibold text-[#111111] mb-4">Vehicle Classes</h3>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="Add new class..."
                className="flex-1 h-9 px-3 rounded-[6px] border border-[#E5E5E5] bg-white text-[13px] focus:outline-none focus:border-blue-500" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newClass.trim()) {
                    addClass.mutate(newClass.trim());
                  }
                }}
              />
              <button
                onClick={() => newClass.trim() && addClass.mutate(newClass.trim())}
                disabled={!newClass.trim() || addClass.isPending}
                className="h-9 px-3 bg-[#111111] text-white rounded-[6px] text-[13px] font-medium disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <ul className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {classes?.map((cls: any) => (
                <li key={cls.id} className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-[6px] px-3 py-2">
                  <span className="text-[13px] text-[#111111]">{cls.name}</span>
                  <button 
                    onClick={() => deleteClass.mutate(cls.id)}
                    disabled={deleteClass.isPending}
                    className="text-[#A0A0A0] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
              {classes?.length === 0 && (
                <p className="text-[13px] text-[#777777] text-center py-4">No classes defined</p>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
