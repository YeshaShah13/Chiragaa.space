"use client";

import { RoleMatrix } from "@/components/admin/roles/role-matrix";

export default function AdminRolesPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-[18px] text-[#777777] mt-1 mb-4">
            Manage system roles and their associated permissions.
          </p>
        </div>
      </div>

      <div className="w-full">
        <RoleMatrix />
      </div>
    </div>
  );
}
