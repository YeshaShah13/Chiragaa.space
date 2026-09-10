"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  default_paper_size: z.string().min(1, "Paper size is required"),
  pdf_filename_format: z.string().min(1, "Filename format is required"),
  show_logo_on_reports: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentSettings() {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch Document settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "Documents & Reports"],
    queryFn: async () => {
      const response = await apiClient.get("/settings?category=Documents%20%26%20Reports");
      return response.data.data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      default_paper_size: "A4",
      pdf_filename_format: "{vehicle_number}_{document_type}_{date}.pdf",
      show_logo_on_reports: true,
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        default_paper_size: settings.default_paper_size || "A4",
        pdf_filename_format: settings.pdf_filename_format || "{vehicle_number}_{document_type}_{date}.pdf",
        show_logo_on_reports: settings.show_logo_on_reports === "1" || settings.show_logo_on_reports === "true" || settings.show_logo_on_reports === true,
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
      queryClient.invalidateQueries({ queryKey: ["settings", "Documents & Reports"] });
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
          <h2 className="text-[20px] font-semibold text-[#111111]">Documents & Reports Settings</h2>
          <p className="text-[14px] text-[#777777] mt-1">Configure document formats, PDF generation rules, and print preferences.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Document Formatting Section */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">Format Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">Default Paper Size</label>
              <select 
                {...form.register("default_paper_size")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="Letter">Letter (8.5 x 11 inches)</option>
                <option value="Legal">Legal (8.5 x 14 inches)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111111]">PDF Filename Format</label>
              <input 
                type="text"
                {...form.register("pdf_filename_format")}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] bg-white text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="{vehicle_number}_{document_type}.pdf"
              />
              <p className="text-[12px] text-[#777777]">Tags available: {'{vehicle_number}'}, {'{document_type}'}, {'{date}'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              {...form.register("show_logo_on_reports")}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-[14px] text-[#111111] font-medium">Show company logo on reports</span>
          </label>
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
