"use client";

import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function ReportsPage() {
  return (
    <PermissionGuard permission="reports.view" showPageDenied>
      <div className="p-8 max-w-6xl mx-auto w-full h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#111111]">System Reports</h1>
          <p className="text-[#777777] mt-1">Select a report to generate and print.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* A.T. Form Card */}
          <Link 
            href="/reports/at-form"
            className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">A.T. Form</h2>
            <p className="text-sm text-slate-500">
              Generate the official A.T. Form declaration for a vehicle. Includes tax and insurance details formatted for printing.
            </p>
          </Link>

          {/* CFRA Form Card */}
          <Link 
            href="/reports/cfra-form"
            className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">CFRA Form</h2>
            <p className="text-sm text-slate-500">
              Generate the official C.F.R.A. document for a vehicle. Includes dynamic remarks and secondary contact information.
            </p>
          </Link>
        </div>
      </div>
    </PermissionGuard>
  );
}
