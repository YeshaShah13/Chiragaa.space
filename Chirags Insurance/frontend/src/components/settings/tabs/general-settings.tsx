"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  app_name: z.string().min(1, "Application name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  default_rto_office: z.string().optional(),
  default_date_format: z.string().optional(),
  default_currency: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GeneralSettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch general settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "General"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=General");
      return response.data.data; // e.g. { company_name: '...', app_name: '...' }
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      app_name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      default_rto_office: "",
      default_date_format: "",
      default_currency: "",
      timezone: "",
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        company_name: settings.company_name || "",
        app_name: settings.app_name || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
        default_rto_office: settings.default_rto_office || "",
        default_date_format: settings.default_date_format || "",
        default_currency: settings.default_currency || "",
        timezone: settings.timezone || "",
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      // Transform flat object into array of {key, value} objects expected by API
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value
      }));

      await apiClient.put("/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "General"] });
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
          <h2 className="text-[20px] font-semibold text-[#111111]">General Settings</h2>
          <p className="text-[14px] text-[#777777] mt-1">Configure basic application information and defaults.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Organization Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Organization Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Company Name</label>
              <input 
                {...form.register("company_name")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="e.g. Chirags Insurance"
              />
              {form.formState.errors.company_name && (
                <p className="text-[12px] text-red-500">{form.formState.errors.company_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Application Name</label>
              <input 
                {...form.register("app_name")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="e.g. Chirag Auto Adviser"
              />
              {form.formState.errors.app_name && (
                <p className="text-[12px] text-red-500">{form.formState.errors.app_name.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-medium text-[#111111]">Primary Address</label>
              <input 
                {...form.register("address")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="Full official address"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Phone Number</label>
              <input 
                {...form.register("phone")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Support Email</label>
              <input 
                {...form.register("email")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="support@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Website URL</label>
              <input 
                {...form.register("website")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* Regional & Formatting */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Regional & Formatting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Default RTO Office</label>
              <input 
                {...form.register("default_rto_office")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow uppercase" 
                placeholder="e.g. GJ03"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Time Zone</label>
              <select 
                {...form.register("timezone")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Date Format</label>
              <select 
                {...form.register("default_date_format")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Currency</label>
              <select 
                {...form.register("default_currency")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
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
