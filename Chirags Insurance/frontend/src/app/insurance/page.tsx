"use client";

import { InsuranceGrid } from "@/components/insurance/insurance-grid";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function InsurancePage() {
  return (
    <PermissionGuard permission="insurance.view" showPageDenied>
      <div className="space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">
              Insurance Management
            </h1>
            <p className="text-[18px] text-[#777777] mt-1">
              Manage your vehicle insurance policies and renewals.
            </p>
          </div>
          <PermissionGuard permission="insurance.create">
            <div className="flex items-center">
              <Link
                href="/insurance/create"
                className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-[#111111] px-6 text-[17px] font-medium text-white transition-colors hover:bg-[#333333]"
              >
                <Plus className="mr-2 h-5 w-5" strokeWidth={2} />
                Add Policy
              </Link>
            </div>
          </PermissionGuard>
        </div>

        {/* Main Content Container */}
        <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-4 sm:p-8">
          <InsuranceGrid />
        </div>
      </div>
    </PermissionGuard>
  );
}
