"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  tax_expiry_warning_period: z.coerce.number().min(1, "Warning period must be at least 1 day").max(365, "Warning period cannot exceed a year"),
  default_tax_frequency: z.enum(["Yearly", "Half Yearly", "Quarterly", "Monthly"]),
  default_payment_mode: z.string().min(1, "Payment mode is required"),
  penalty_calculation: z.enum(["fixed", "percentage", "none"]),
});

type FormValues = z.infer<typeof formSchema>;

export function TaxSettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch Tax settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "Tax & Compliance"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=Tax%20%26%20Compliance");
      return response.data.data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tax_expiry_warning_period: 30,
      default_tax_frequency: "Yearly",
      default_payment_mode: "Online",
      penalty_calculation: "fixed",
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        tax_expiry_warning_period: settings.tax_expiry_warning_period ? parseInt(settings.tax_expiry_warning_period) : 30,
        default_tax_frequency: settings.default_tax_frequency || "Yearly",
        default_payment_mode: settings.default_payment_mode || "Online",
        penalty_calculation: settings.penalty_calculation || "fixed",
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value: value.toString() // API stores as string
      }));

      await apiClient.put("/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "Tax & Compliance"] });
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
          <h2 className="text-[20px] font-semibold text-[#111111]">Tax & Compliance Settings</h2>
          <p className="text-[14px] text-[#777777] mt-1">Configure expiry thresholds, penalty calculations, and default rules.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Compliance Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Compliance Warnings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Tax Expiry Warning Period (Days)</label>
              <div className="relative">
                <input 
                  type="number"
                  {...form.register("tax_expiry_warning_period")}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#777777]">days</span>
              </div>
              <p className="text-[12px] text-[#777777]">The threshold for changing tax status to "Expiring Soon".</p>
              {form.formState.errors.tax_expiry_warning_period && (
                <p className="text-[12px] text-red-500">{form.formState.errors.tax_expiry_warning_period.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Penalty Calculation Mode</label>
              <select 
                {...form.register("penalty_calculation")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="fixed">Fixed Flat Penalty</option>
                <option value="percentage">Percentage based on Tax</option>
                <option value="none">No Automatic Penalty</option>
              </select>
            </div>
          </div>
        </div>

        {/* Defaults Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Tax Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Default Tax Frequency</label>
              <select 
                {...form.register("default_tax_frequency")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="Yearly">Yearly</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Default Payment Mode</label>
              <select 
                {...form.register("default_payment_mode")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="Online">Online / Portal</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Demand Draft">Demand Draft (DD)</option>
              </select>
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
