"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only protect routes inside MainLayout (which is everything except auth routes if we configured it correctly)
    // Wait, MainLayout is used in app/layout.tsx for EVERY page right now.
    // If we are on /login, /forgot-password, /reset-password, we shouldn't redirect to /login.
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
    
    if (!isAuthRoute) {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
      }
    }
    
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return null; // or a loading spinner
  }

  // If we are on an auth route, we shouldn't render the Sidebar and Header!
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  const isVehicleEntryRoute = pathname === '/vehicles/new' || (pathname.startsWith('/vehicles/') && pathname.endsWith('/edit'));
  
  if (isAuthRoute || isVehicleEntryRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
