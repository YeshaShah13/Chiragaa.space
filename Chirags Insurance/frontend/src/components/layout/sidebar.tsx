"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  ShieldCheck,
  Receipt,
  CheckCircle,
  FileText,
  Map,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permission?: string;
  adminOnly?: boolean;
  children?: Array<{
    name: string;
    href: string;
    icon: any;
    permission?: string;
  }>;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" },
  { name: "Motor Management", href: "/vehicles", icon: Car, permission: "motor_management.view" },
  { name: "Insurance", href: "/insurance", icon: ShieldCheck, permission: "insurance.view" },
  { name: "Tax", href: "/tax", icon: Receipt, permission: "tax.view" },
  { name: "Fitness", href: "/fitness", icon: CheckCircle, permission: "fitness.view" },
  { name: "Permit", href: "/permit", icon: FileText, permission: "permit.view" },
  { name: "National Permit", href: "/national-permit", icon: Map, permission: "national_permit.view" },
  { name: "Reports", href: "/reports", icon: BarChart3, permission: "reports.view" },
  { 
    name: "Administration", 
    href: "/admin", 
    icon: Users,
    permission: 'administration.view',
    adminOnly: true,
    children: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard, permission: 'administration.view' },
      { name: "Users", href: "/admin/users", icon: Users, permission: 'administration.manage_users' },
      { name: "Roles & Permissions", href: "/admin/roles", icon: Key, permission: 'administration.manage_roles' },
      { name: "Audit Activity", href: "/admin/audit", icon: Activity, permission: 'administration.view_audit' },
    ]
  },
  { name: "Settings", href: "/settings", icon: Settings, permission: 'settings.view', adminOnly: true },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const { user, hasPermission, isAdmin } = useAuth();

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card transition-all duration-300 relative",
      isCollapsed ? "w-16 px-2 py-4" : "w-64 px-3 py-4"
    )}>
      {/* Collapse Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full shadow-md z-10 hidden md:flex items-center justify-center bg-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className={cn("mb-6 flex items-center h-8", isCollapsed ? "justify-center" : "px-3")}>
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight text-primary truncate">
            Chirags Insurance
          </h1>
        )}
        {isCollapsed && (
          <h1 className="text-xl font-bold text-primary">C</h1>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          // If item is admin-only, verify admin role
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          // If item has a permission requirement, check it
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && !item.children);
          const hasChildren = item.children && item.children.length > 0;
          
          if (hasChildren) {
            const visibleChildren = item.children?.filter(child => !child.permission || hasPermission(child.permission)) || [];
            if (visibleChildren.length === 0) return null;

            const isChildActive = visibleChildren.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
            
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "w-full group flex items-center justify-between rounded-md text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center py-2 px-0" : "px-3 py-2",
                    isChildActive
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        !isCollapsed && "mr-3",
                        isChildActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                      )}
                      aria-hidden="true"
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={cn("h-4 w-4 transition-transform", adminExpanded ? "rotate-180" : "")} />
                  )}
                </button>
                
                {adminExpanded && !isCollapsed && (
                  <div className="pl-10 pr-3 py-1 space-y-1">
                    {visibleChildren.map(child => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            childActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <child.icon
                            className={cn(
                              "h-4 w-4 mr-3 flex-shrink-0",
                              childActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                            )}
                            aria-hidden="true"
                          />
                          <span>{child.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group flex items-center rounded-md text-sm font-medium transition-colors",
                isCollapsed ? "justify-center py-2 px-0" : "px-3 py-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  !isCollapsed && "mr-3",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className={cn("mt-auto border-t pt-4", isCollapsed ? "flex justify-center" : "")}>
        <div className={cn("flex items-center", isCollapsed ? "" : "px-3 py-2")}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium truncate text-foreground">{user?.name || "System User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
