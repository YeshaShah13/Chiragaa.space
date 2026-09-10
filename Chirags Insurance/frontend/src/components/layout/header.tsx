"use client";

import { Bell, Menu, Search, User, LogOut, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { NotificationsPopover } from "./notifications-popover";

export function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // Ignored, we logout locally anyway
    }
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Safe fallback to parent path or dashboard
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 1) {
        router.push(`/${segments.slice(0, -1).join("/")}`);
      } else {
        router.push("/");
      }
    }
  };

  // Determine page title based on route
  const getPageTitle = () => {
    if (pathname === "/") return { title: "Dashboard", subtitle: "Fleet overview and compliance status" };
    if (pathname === "/vehicles/new") return { title: "New Vehicle Registration", subtitle: "Add a new vehicle to fleet" };
    if (pathname.match(/^\/vehicles\/\d+\/edit$/)) return { title: "Edit Vehicle", subtitle: "Update vehicle and compliance records" };
    if (pathname.match(/^\/vehicles\/\d+$/)) return { title: "Vehicle Details", subtitle: "Comprehensive vehicle overview & compliance" };
    if (pathname.startsWith("/vehicles")) return { title: "Motor Entry", subtitle: "Manage your vehicle fleet" };
    if (pathname.startsWith("/insurance/create")) return { title: "New Insurance Policy", subtitle: "Issue or register policy" };
    if (pathname.startsWith("/insurance")) return { title: "Insurance", subtitle: "Manage vehicle insurance policies" };
    if (pathname.startsWith("/tax")) return { title: "Tax Compliance", subtitle: "Vehicle tax tracking and payments" };
    if (pathname.startsWith("/fitness")) return { title: "Fitness Compliance", subtitle: "Vehicle fitness certificates & renewals" };
    if (pathname.startsWith("/permit")) return { title: "Permit Compliance", subtitle: "Vehicle state permit tracking & validity" };
    if (pathname.startsWith("/national-permit")) return { title: "National Permit", subtitle: "All India national permit tracking" };
    if (pathname.startsWith("/reports/at-form")) return { title: "AT Form Report", subtitle: "Agent / Transport report generation" };
    if (pathname.startsWith("/reports/cfra-form")) return { title: "CFRA Form Report", subtitle: "Compliance form report generation" };
    if (pathname.startsWith("/reports")) return { title: "Reports", subtitle: "View system reports and analytics" };
    if (pathname.startsWith("/admin/users")) return { title: "User Management", subtitle: "Manage system operators and permissions" };
    if (pathname.startsWith("/admin/roles")) return { title: "Roles & Permissions", subtitle: "Configure access control" };
    if (pathname.startsWith("/admin/audit")) return { title: "Audit Trail", subtitle: "System activity and security logs" };
    if (pathname.startsWith("/admin")) return { title: "Administration", subtitle: "System management and security" };
    if (pathname.startsWith("/activity")) return { title: "Activity Log", subtitle: "Track system activities" };
    if (pathname.startsWith("/settings")) return { title: "Settings", subtitle: "System configuration and preferences" };
    return { title: "Chirag Auto Adviser", subtitle: "Vehicle Management System" };
  };

  const pageInfo = getPageTitle();
  const showBackButton = pathname !== "/";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-[#E5E5E5] bg-white px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111] md:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-[#E5E7EB] bg-white text-[#333333] hover:text-[#111111] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-2xs text-[13px] font-medium shrink-0 group mr-1"
            title="Back to previous page"
          >
            <ArrowLeft className="h-4 w-4 text-[#666666] group-hover:text-[#111111] transition-colors" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="hidden md:flex flex-col">
          <h2 className="text-[20px] font-semibold text-[#111111] leading-tight">
            {pageInfo.title}
          </h2>
          <p className="text-[13px] text-[#666666] mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="hidden lg:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
          <input
            type="search"
            placeholder="Search vehicle, owner or registration number"
            className="flex h-9 w-[320px] rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-9 py-1 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111] placeholder:text-[#A0A0A0]"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <NotificationsPopover />
          
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] hover:bg-[#E5E5E5] transition-colors overflow-hidden"
            >
              <span className="sr-only">Open user menu</span>
              <User className="h-4 w-4" aria-hidden="true" />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#E5E5E5] bg-white text-[#111111] shadow-sm outline-none animate-in fade-in-80 zoom-in-95">
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-2 text-[13px] outline-none transition-colors hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-[#666666]" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
