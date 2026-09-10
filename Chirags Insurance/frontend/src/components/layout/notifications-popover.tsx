"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, ShieldAlert, Receipt, CheckCircle, FileBadge, AlertTriangle, Check, ArrowRight, ExternalLink, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Vehicle } from "@/types/vehicle";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface NotificationItem {
  id: string;
  type: "insurance" | "tax" | "fitness" | "permit" | "system";
  title: string;
  description: string;
  vehicleNumber?: string;
  vehicleId?: number | string;
  dueDate?: string;
  daysRemaining?: number;
  severity: "critical" | "warning" | "info";
  link: string;
  isRead: boolean;
}

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "urgent" | "info">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch vehicles to construct live compliance notifications
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", "notifications-data"],
    queryFn: async () => {
      const response = await apiClient.get("/vehicles?per_page=100");
      return (response.data.data.data || []) as Vehicle[];
    },
    staleTime: 60 * 1000,
  });

  // Generate real dynamic notifications from fleet data
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDays = (dateStr?: string) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    vehicles.forEach((v) => {
      // 1. Insurance Alerts
      const latestIns = v.insurance_policies && v.insurance_policies.length > 0
        ? [...v.insurance_policies].sort((a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime())[0]
        : null;

      if (latestIns?.expiry_date) {
        const days = getDays(latestIns.expiry_date);
        if (days !== null && days <= 30) {
          list.push({
            id: `ins-${v.id}-${latestIns.id}`,
            type: "insurance",
            title: days < 0 ? "Insurance Expired" : "Insurance Expiring Soon",
            description: days < 0
              ? `${v.vehicle_number} insurance expired ${Math.abs(days)} days ago.`
              : `${v.vehicle_number} insurance expires in ${days} days.`,
            vehicleNumber: v.vehicle_number,
            vehicleId: v.id,
            dueDate: latestIns.expiry_date,
            daysRemaining: days,
            severity: days < 0 ? "critical" : "warning",
            link: `/vehicles/view?id=${v.id}`,
            isRead: false,
          });
        }
      }

      // 2. Tax Alerts
      if (v.tax?.tax_up_to_date) {
        const days = getDays(v.tax.tax_up_to_date);
        if (days !== null && days <= 30) {
          list.push({
            id: `tax-${v.id}`,
            type: "tax",
            title: days < 0 ? "Road Tax Overdue" : "Road Tax Due Soon",
            description: days < 0
              ? `${v.vehicle_number} road tax expired on ${v.tax.tax_up_to_date}.`
              : `${v.vehicle_number} road tax payment due in ${days} days.`,
            vehicleNumber: v.vehicle_number,
            vehicleId: v.id,
            dueDate: v.tax.tax_up_to_date,
            daysRemaining: days,
            severity: days < 0 ? "critical" : "warning",
            link: `/vehicles/view?id=${v.id}`,
            isRead: false,
          });
        }
      }

      // 3. Fitness Alerts
      if (v.fitness?.expiry_date) {
        const days = getDays(v.fitness.expiry_date);
        if (days !== null && days <= 30) {
          list.push({
            id: `fit-${v.id}`,
            type: "fitness",
            title: days < 0 ? "Fitness Certificate Expired" : "Fitness Renewal Due",
            description: days < 0
              ? `${v.vehicle_number} fitness expired ${Math.abs(days)} days ago.`
              : `${v.vehicle_number} fitness expires in ${days} days.`,
            vehicleNumber: v.vehicle_number,
            vehicleId: v.id,
            dueDate: v.fitness.expiry_date,
            daysRemaining: days,
            severity: days < 0 ? "critical" : "warning",
            link: `/vehicles/view?id=${v.id}`,
            isRead: false,
          });
        }
      }

      // 4. Permit Alerts
      if (v.permit?.expiry_date) {
        const days = getDays(v.permit.expiry_date);
        if (days !== null && days <= 30) {
          list.push({
            id: `per-${v.id}`,
            type: "permit",
            title: days < 0 ? "State Permit Expired" : "State Permit Renewal Due",
            description: days < 0
              ? `${v.vehicle_number} permit expired ${Math.abs(days)} days ago.`
              : `${v.vehicle_number} permit expires in ${days} days.`,
            vehicleNumber: v.vehicle_number,
            vehicleId: v.id,
            dueDate: v.permit.expiry_date,
            daysRemaining: days,
            severity: days < 0 ? "critical" : "warning",
            link: `/vehicles/view?id=${v.id}`,
            isRead: false,
          });
        }
      }
    });

    // Sort by severity (critical first) and days remaining
    return list.sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1;
      if (b.severity === "critical" && a.severity !== "critical") return 1;
      return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0);
    });
  }, [vehicles]);

  const unreadNotifications = notifications.filter((n) => !readIds.has(n.id));
  const unreadCount = unreadNotifications.length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "urgent") return n.severity === "critical";
    if (filter === "info") return n.severity === "warning" || n.severity === "info";
    return true;
  });

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
  };

  const markItemAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markItemAsRead(item.id);
    setIsOpen(false);
    router.push(item.link);
  };

  const getIcon = (type: NotificationItem["type"], severity: NotificationItem["severity"]) => {
    const isCritical = severity === "critical";
    switch (type) {
      case "insurance":
        return <ShieldAlert className={`w-4 h-4 ${isCritical ? "text-rose-600" : "text-amber-600"}`} />;
      case "tax":
        return <Receipt className={`w-4 h-4 ${isCritical ? "text-rose-600" : "text-amber-600"}`} />;
      case "fitness":
        return <CheckCircle className={`w-4 h-4 ${isCritical ? "text-rose-600" : "text-amber-600"}`} />;
      case "permit":
        return <FileBadge className={`w-4 h-4 ${isCritical ? "text-rose-600" : "text-amber-600"}`} />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111] transition-colors focus:outline-none"
        title="Notifications"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] sm:w-[420px] rounded-2xl border border-[#E5E7EB] bg-white text-[#111111] shadow-2xl z-50 overflow-hidden animate-in fade-in-80 zoom-in-95 origin-top-right">
          {/* Header */}
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <h3 className="font-bold text-[15px] text-[#111111]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[12px] font-medium text-[#123B6D] hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 bg-slate-50/80 border-b border-[#E5E7EB] flex items-center gap-2 text-[12px]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#123B6D] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("urgent")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "urgent"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Expired / Overdue
            </button>
            <button
              type="button"
              onClick={() => setFilter("info")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "info"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Expiring Soon
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F1F5F9]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Check className="w-10 h-10 mx-auto text-emerald-500/80 mb-2 p-2 bg-emerald-50 rounded-full" />
                <p className="font-semibold text-[14px] text-slate-800">All caught up!</p>
                <p className="text-[12px] text-slate-500 mt-0.5">No active alerts matching this filter.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isRead = readIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 group relative ${
                      !isRead ? "bg-blue-50/20" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        item.severity === "critical"
                          ? "bg-rose-100/80"
                          : "bg-amber-100/80"
                      }`}
                    >
                      {getIcon(item.type, item.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-[13px] font-semibold truncate ${
                          item.severity === "critical" ? "text-rose-900" : "text-slate-900"
                        }`}>
                          {item.title}
                        </p>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-[12px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {item.dueDate && (
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          <span className="font-mono">{new Date(item.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <span>&bull;</span>
                          <span className="text-[#123B6D] font-medium group-hover:underline">
                            View Vehicle &rarr;
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E5E7EB] bg-slate-50 flex items-center justify-between text-[12px]">
            <span className="text-slate-500 font-medium">Compliance Alerts</span>
            <Link
              href="/reports"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-[#123B6D] hover:underline"
            >
              <span>View Full Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
