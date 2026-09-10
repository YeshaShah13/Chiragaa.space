"use client";

import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  showPageDenied?: boolean;
}

export function PermissionGuard({
  permission,
  requireAll = false,
  children,
  fallback = null,
  showPageDenied = false,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    if (showPageDenied) {
      return (
        <div className="flex items-center justify-center p-12 text-sm text-[#777777]">
          Checking permissions...
        </div>
      );
    }
    return null;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const isAllowed = requireAll
    ? permissions.every((p) => hasPermission(p))
    : permissions.some((p) => hasPermission(p));

  if (isAllowed) {
    return <>{children}</>;
  }

  if (showPageDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 border border-red-100">
          <ShieldAlert className="w-8 h-8 text-red-600" strokeWidth={1.75} />
        </div>
        <h2 className="text-[24px] font-bold text-[#111111] mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-[15px] text-[#666666] leading-relaxed mb-6">
          You do not have permission to view or perform actions in this section.
          Please contact your administrator if you need access.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-[44px] px-5 bg-[#111111] text-white text-[14px] font-medium rounded-[10px] hover:bg-[#333333] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <>{fallback}</>;
}
