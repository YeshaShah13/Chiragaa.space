"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  rto_code: z.string().min(1, "RTO Code is required"),
  rto_name: z.string().min(1, "RTO Name is required"),
  rto_location: z.string().min(1, "Location is required"),
  regional_transport_authority: z.string().min(1, "Authority name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function RtoSettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch RTO settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "RTO / Office"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=RTO%20%2F%20Office");
      return response.data.data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rto_code: "",
      rto_name: "",
      rto_location: "",
      regional_transport_authority: "",
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        rto_code: settings.rto_code || "",
        rto_name: settings.rto_name || "",
        rto_location: settings.rto_location || "",
        regional_transport_authority: settings.regional_transport_authority || "",
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value
      }));

      await apiClient.put("/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "RTO / Office"] });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    },
  });

  const onSubmit = (values: FormValues) => {
    updateSettings.mutate(values);
  };

  if (isLoading) {
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
          <h2 className="text-[20px] font-semibold text-[#111111]">RTO / Office Settings</h2>
          <p className="text-[14px] text-[#777777] mt-1">Configure default office and RTO details used in reports and forms.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Office Details Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Default RTO Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">RTO Code</label>
              <input 
                {...form.register("rto_code")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow uppercase" 
                placeholder="e.g. GJ03"
              />
              {form.formState.errors.rto_code && (
                <p className="text-[12px] text-red-500">{form.formState.errors.rto_code.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">RTO Name</label>
              <input 
                {...form.register("rto_name")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="e.g. Rajkot RTO"
              />
              {form.formState.errors.rto_name && (
                <p className="text-[12px] text-red-500">{form.formState.errors.rto_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Location (City / State)</label>
              <input 
                {...form.register("rto_location")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="e.g. Rajkot, Gujarat"
              />
              {form.formState.errors.rto_location && (
                <p className="text-[12px] text-red-500">{form.formState.errors.rto_location.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Regional Transport Authority Name</label>
              <input 
                {...form.register("regional_transport_authority")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="e.g. Regional Transport Authority Rajkot"
              />
              {form.formState.errors.regional_transport_authority && (
                <p className="text-[12px] text-red-500">{form.formState.errors.regional_transport_authority.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-[#E5E5E5] flex items-center justify-end gap-4">
          {isSuccess && (
            <div className="flex items-center text-emerald-600 text-[14px] font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Settings saved successfully
            </div>
          )}
          
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#111111] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSettings.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
