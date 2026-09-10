"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Vehicle } from "@/types/vehicle";
// @ts-ignore - Temporary ignore if TS server is lagging on new file
import { FitnessDashboard } from "@/components/fitness/fitness-dashboard";
import { Info, AlertCircle, RefreshCcw } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function FitnessManagementPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["vehicles", "fitness-management"],
    queryFn: async () => {
      // Fetch all vehicles (or use pagination if dataset is extremely large)
      // For now, we request a large per_page to load everything into the frontend dashboard
      const response = await apiClient.get("/vehicles?per_page=1000");
      return response.data.data.data as Vehicle[];
    },
  });

  return (
    <PermissionGuard permission="fitness.view" showPageDenied>
      <div className="space-y-8 pb-12">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">Fitness Management</h1>
            <p className="text-[18px] text-[#777777] mt-1 mb-4">Monitor vehicle fitness validity and compliance status.</p>
            
            {/* Source Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md text-[13px] font-medium text-blue-700">
              <Info className="w-4 h-4" />
              Fitness information is managed from Motor Vehicle Entry.
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={() => refetch()}
              className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#111111] px-6 text-[17px] font-medium text-white transition-colors hover:bg-[#333333]"
            >
              <RefreshCcw className="mr-2 h-5 w-5" strokeWidth={2} /> 
              Refresh Data
            </button>
          </div>
        </div>

        <div className="w-full">
          
          {isError ? (
            <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-12 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#111111] mb-2">Unable to Load Fitness Information</h3>
              <p className="text-[15px] text-[#777777] max-w-md mb-6">We couldn't retrieve fitness information from Motor Vehicle records. Please check your connection and try again.</p>
              <button 
                onClick={() => refetch()}
                className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#111111] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#333333]"
              >
                Retry
              </button>
            </div>
          ) : (
            <FitnessDashboard 
              vehicles={data || []} 
              isLoading={isLoading} 
              refetch={refetch}
            />
          )}

        </div>
      </div>
    </PermissionGuard>
  );
}
