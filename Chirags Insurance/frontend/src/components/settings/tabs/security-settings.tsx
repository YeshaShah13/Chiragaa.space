"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  session_timeout: z.coerce.number().min(5, "Session timeout must be at least 5 minutes").max(1440, "Session timeout cannot exceed 24 hours"),
  password_policy: z.enum(["strict", "moderate", "basic"]),
});

type FormValues = z.infer<typeof formSchema>;

export function SecuritySettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch Security settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "Security"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=Security");
      return response.data.data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session_timeout: 120,
      password_policy: "strict",
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        session_timeout: settings.session_timeout ? parseInt(settings.session_timeout) : 120,
        password_policy: settings.password_policy || "strict",
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value: value.toString()
      }));

      await apiClient.put("/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "Security"] });
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
          <h2 className="text-[20px] font-semibold text-[#111111]">Security Settings</h2>
          <p className="text-[14px] text-[#777777] mt-1">Manage password policies, sessions, and authentication rules.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Access Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Access Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Session Timeout (Minutes)</label>
              <div className="relative">
                <input 
                  type="number"
                  {...form.register("session_timeout")}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#777777]">mins</span>
              </div>
              {form.formState.errors.session_timeout && (
                <p className="text-[12px] text-red-500">{form.formState.errors.session_timeout.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Password Policy</label>
              <select 
                {...form.register("password_policy")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="strict">Strict (Alphanumeric, Special Chars, Min 8 length)</option>
                <option value="moderate">Moderate (Alphanumeric, Min 6 length)</option>
                <option value="basic">Basic (Any chars, Min 4 length)</option>
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
