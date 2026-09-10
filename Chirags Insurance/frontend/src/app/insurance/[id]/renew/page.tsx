"use client";

import { InsuranceForm } from "@/components/insurance/insurance-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function RenewInsurancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <PermissionGuard permission="insurance.edit" showPageDenied>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/insurance"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Renew Insurance Policy</h2>
            <p className="text-muted-foreground">
              Create a new policy to renew the selected one.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <InsuranceForm renewPolicyId={id} />
        </div>
      </div>
    </PermissionGuard>
  );
}
