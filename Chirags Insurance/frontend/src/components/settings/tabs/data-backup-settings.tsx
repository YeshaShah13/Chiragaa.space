"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  auto_backup_enabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function DataBackupSettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch Data & Backup settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "Data & Backup"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=Data%20%26%20Backup");
      return response.data.data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      auto_backup_enabled: true,
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        auto_backup_enabled: settings.auto_backup_enabled === "1" || settings.auto_backup_enabled === "true" || settings.auto_backup_enabled === true,
      });
    }
  }, [settings, form]);

  const updateSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      await apiClient.put("/settings", { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "Data & Backup"] });
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
          <h2 className="text-[20px] font-semibold text-[#111111]">Data & Backup Settings</h2>
          <p className="text-[14px] text-[#777777] mt-1">Configure data retention policies and automated backups.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Backup Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Automated Backups</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                {...form.register("auto_backup_enabled")}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-[14px] text-[#111111] font-medium">Enable Auto Backup</span>
            </label>
            <p className="text-[12px] text-[#777777] pl-7">System will automatically backup database and files daily at midnight.</p>
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
