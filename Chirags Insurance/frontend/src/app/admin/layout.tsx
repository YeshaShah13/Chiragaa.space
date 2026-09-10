"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { hasPermission, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasPermission('administration.view')) {
      router.push("/");
    }
  }, [isLoading, hasPermission, router]);

  if (isLoading) {
    return <div className="p-8 flex justify-center text-gray-500">Checking permissions...</div>;
  }

  if (!hasPermission('administration.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-[#111111] mb-2">Access Denied</h1>
        <p className="text-gray-500 max-w-md">
          You do not have the required permissions to view the administration area.
          If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
