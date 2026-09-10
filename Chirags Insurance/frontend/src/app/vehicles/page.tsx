"use client";

import { VehiclesGrid } from "@/components/vehicles/vehicles-grid";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function VehiclesPage() {
  return (
    <PermissionGuard permission="motor_management.view" showPageDenied>
      <div className="space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">
              Motor Management
            </h1>
            <p className="text-[18px] text-[#777777] mt-1">
              Manage your vehicles and view their compliance status.
            </p>
          </div>
          <PermissionGuard permission="motor_management.create">
            <div className="flex items-center">
              <Link
                href="/vehicles/new"
                className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#111111] px-6 text-[17px] font-medium text-white transition-colors hover:bg-[#333333]"
              >
                <Plus className="mr-2 h-5 w-5" strokeWidth={2} />
                Add Vehicle
              </Link>
            </div>
          </PermissionGuard>
        </div>

        {/* Main Content Container */}
        <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-4 sm:p-8">
          <VehiclesGrid />
        </div>
      </div>
    </PermissionGuard>
  );
}
