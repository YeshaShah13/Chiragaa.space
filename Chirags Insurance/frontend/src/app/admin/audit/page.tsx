"use client";

import { AuditGrid } from "@/components/admin/audit/audit-grid";

export default function AdminAuditPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">
            Audit Activity
          </h1>
          <p className="text-[18px] text-[#777777] mt-1 mb-4">
            Review historical logs of system actions performed by users.
          </p>
        </div>
      </div>

      <div className="w-full">
        <AuditGrid />
      </div>
    </div>
  );
}
