"use client";

import { UserGrid } from "@/components/admin/users/user-grid";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">
            User Management
          </h1>
          <p className="text-[18px] text-[#777777] mt-1 mb-4">
            Manage system users and their access levels.
          </p>
        </div>
      </div>

      <div className="w-full">
        <UserGrid />
      </div>
    </div>
  );
}
