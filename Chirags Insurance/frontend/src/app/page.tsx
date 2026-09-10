"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  Car, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Plus, 
  FileBarChart,
  ArrowRight, 
  CheckCircle2,
  RefreshCcw,
  Loader2,
  ExternalLink
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const response = await apiClient.get("/dashboard/overview");
      return response.data.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const kpis = data?.kpis;
  const vehicleOverview = data?.vehicle_overview;
  const complianceData = data?.compliance_overview || [];
  const recentActivity = data?.recent_activity || [];
  const upcomingExpiries = data?.upcoming_expiries || [];

  const kpiCards = [
    { 
      title: "Total Vehicles", 
      value: kpis ? kpis.total_vehicles.toLocaleString("en-IN") : "...", 
      subtitle: "Total registered in fleet", 
      icon: Car 
    },
    { 
      title: "Active Vehicles", 
      value: kpis ? kpis.active_vehicles.toLocaleString("en-IN") : "...", 
      subtitle: "Active fleet status", 
      icon: CheckCircle2 
    },
    { 
      title: "Expiring Soon", 
      value: kpis ? kpis.expiring_soon.toLocaleString("en-IN") : "...", 
      subtitle: "Documents within 30 days", 
      icon: Clock 
    },
    { 
      title: "Expired", 
      value: kpis ? kpis.expired.toLocaleString("en-IN") : "...", 
      subtitle: "Requires immediate attention", 
      icon: AlertCircle 
    },
    { 
      title: "Insurance Due", 
      value: kpis ? kpis.insurance_due.toLocaleString("en-IN") : "...", 
      subtitle: "Policies requiring renewal", 
      icon: ShieldAlert 
    },
  ];

  const vehicleOverviewItems = vehicleOverview?.items || [];
  const totalVehiclesCount = vehicleOverview?.total || 1;

  // Format short total (e.g. 76.7k)
  const formatShortTotal = (num: number) => {
    if (num >= 100000) return (num / 100000).toFixed(1) + "L";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return String(num);
  };

  return (
    <PermissionGuard permission="dashboard.view" showPageDenied>
      <div className="space-y-6 pb-12">
        
        {/* Top Header Row with Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[28px] font-serif font-medium text-[#111111] tracking-tight">Overview</h1>
            <p className="text-[14px] text-[#666666] mt-0.5">Real-time fleet overview and compliance monitor</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#F7F7F7] hover:border-[#A0A0A0]"
            >
              <RefreshCcw className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              Refresh
            </button>
            <PermissionGuard permission="reports.view">
              <Link href="/reports" className="inline-flex items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#F7F7F7] hover:border-[#A0A0A0]">
                <FileBarChart className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </PermissionGuard>
            <PermissionGuard permission="motor_management.create">
              <Link href="/vehicles/new" className="inline-flex items-center justify-center rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#333333]">
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Link>
            </PermissionGuard>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-800 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading real-time fleet analytics across {kpis ? kpis.total_vehicles : 'the database'}...</span>
          </div>
        )}

        {/* Error Notification */}
        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
            <span>Failed to load live dashboard statistics. Please refresh.</span>
            <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {kpiCards.map((kpi, i) => (
            <div key={i} className="group relative overflow-hidden rounded-[14px] border border-[#E5E5E5] bg-white p-4 transition-all hover:border-[#A0A0A0] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-semibold text-[#444444] truncate">{kpi.title}</p>
                <kpi.icon className="h-4 w-4 text-[#888888] transition-colors group-hover:text-[#111111]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] sm:text-[24px] font-bold text-[#111111] leading-tight tracking-tight truncate">{kpi.value}</span>
                <span className="mt-1 text-[11px] text-[#777777] truncate">{kpi.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Vehicle Overview (Chart) */}
          <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111111]">Vehicle Overview</h3>
                <p className="text-[13px] text-[#666666] mt-0.5">Fleet distribution by vehicle category</p>
              </div>
              <Link href="/vehicles" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Fleet Directory <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 min-h-[220px]">
              <div className="h-[190px] w-[190px] flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleOverviewItems.length > 0 ? vehicleOverviewItems : [{ name: "Fleet", value: 1, color: "#111111" }]}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {vehicleOverviewItems.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '12px' }}
                      itemStyle={{ color: '#111111', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[20px] font-bold text-[#111111]">{formatShortTotal(totalVehiclesCount)}</span>
                  <span className="text-[10px] uppercase font-bold text-[#888888] tracking-wider">Total</span>
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-3">
                {vehicleOverviewItems.map((item: any, i: number) => {
                  const pct = totalVehiclesCount > 0 ? ((item.value / totalVehiclesCount) * 100).toFixed(1) : "0";
                  return (
                    <div key={i} className="flex items-center justify-between text-[13px] p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-[#111111] truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[#666666] font-mono font-medium text-right">{item.value.toLocaleString("en-IN")}</span>
                        <span className="text-[#888888] font-mono text-xs w-11 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Compliance Overview */}
          <div className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111111]">Compliance Overview</h3>
                <p className="text-[13px] text-[#666666] mt-0.5">Status of key vehicle documents</p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">Fleet Total: {totalVehiclesCount.toLocaleString("en-IN")}</span>
            </div>
            
            <div className="space-y-4">
              {/* Header row */}
              <div className="grid grid-cols-5 text-[11px] font-bold text-[#888888] uppercase tracking-wider pb-2 border-b border-[#F7F7F7]">
                <div className="col-span-2">Type</div>
                <div className="text-right text-emerald-700">Valid</div>
                <div className="text-right text-amber-700">Expiring</div>
                <div className="text-right text-rose-700">Expired</div>
              </div>
              
              {/* Data rows */}
              {complianceData.map((item: any, i: number) => {
                const hrefMap: Record<string, string> = {
                  Tax: "/tax",
                  Fitness: "/fitness",
                  Permit: "/permit",
                  Insurance: "/insurance",
                  "National Permit": "/national-permit"
                };
                const href = hrefMap[item.name] || "/vehicles";
                const totalVal = item.total || totalVehiclesCount || 1;
                const validPct = Math.min(100, ((item.valid / totalVal) * 100));
                const expiringPct = Math.min(100, ((item.expiring / totalVal) * 100));
                const expiredPct = Math.min(100, ((item.expired / totalVal) * 100));

                return (
                  <Link key={i} href={href} className="block group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="grid grid-cols-5 items-center">
                      <div className="col-span-2 flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-[#111111] group-hover:text-blue-600 transition-colors">{item.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-mono font-semibold text-emerald-700">{item.valid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-mono font-medium text-amber-600">{item.expiring.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-mono font-medium text-rose-600">{item.expired.toLocaleString("en-IN")}</span>
                      </div>
                      
                      {/* Visual progress bar below row */}
                      <div className="col-span-5 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 mt-2">
                        <div style={{ width: `${validPct}%` }} className="bg-emerald-600" title={`Valid: ${item.valid}`} />
                        <div style={{ width: `${expiringPct}%` }} className="bg-amber-500" title={`Expiring: ${item.expiring}`} />
                        <div style={{ width: `${expiredPct}%` }} className="bg-rose-500" title={`Expired: ${item.expired}`} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Vehicle Activity (Span 2) */}
          <div className="lg:col-span-2 rounded-[16px] border border-[#E5E5E5] bg-white flex flex-col shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F7F7F7]">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111111]">Recent Vehicle Activity</h3>
                <p className="text-[13px] text-[#666666] mt-0.5">Live audit trail across fleet records</p>
              </div>
              <Link href="/admin/audit" className="text-[13px] font-medium text-[#111111] hover:text-blue-600 flex items-center transition-colors">
                View All Activity <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F7F7F7]/60 text-[11px] font-bold uppercase tracking-wider text-[#888888]">
                  <tr>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Activity</th>
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F7F7]">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-[#F7F7F7]/50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-[#111111]">{row.vehicle}</div>
                          <div className="text-[#666666] text-[11px] mt-0.5">{row.owner}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-[#111111]">{row.activity}</div>
                          <div className="text-[#A0A0A0] text-[11px] mt-0.5">By {row.by}</div>
                        </td>
                        <td className="px-5 py-3.5 text-[#666666] font-mono text-xs">{row.date}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider
                            ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                              row.status === 'Updated' ? 'bg-blue-100 text-blue-800' : 
                              row.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                              'bg-rose-100 text-rose-800'}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs">
                        No recent activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Expiries (Span 1) */}
          <div className="rounded-[16px] border border-[#E5E5E5] bg-white flex flex-col shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F7F7F7]">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111111]">Upcoming Expiries</h3>
                <p className="text-[13px] text-[#666666] mt-0.5">Expiring within 30 days</p>
              </div>
              <Link href="/reports" className="p-1.5 text-[#888888] hover:text-[#111111] transition-colors rounded-md hover:bg-[#F7F7F7]">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="flex-1 p-2 divide-y divide-slate-100">
              {upcomingExpiries.length > 0 ? (
                upcomingExpiries.map((item: any, i: number) => (
                  <div key={i} className="flex items-start justify-between p-3.5 hover:bg-[#F7F7F7]/60 rounded-xl transition-colors group">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/vehicles/${item.vehicle_id}`} 
                          className="font-semibold text-[13px] text-[#111111] hover:text-blue-600 truncate transition-colors"
                        >
                          {item.vehicle}
                        </Link>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 bg-slate-50 font-bold uppercase tracking-wider">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.owner}
                      </div>
                      <div className="text-[11px] text-[#888888] mt-0.5">
                        Expires on <span className="font-semibold text-slate-700">{item.date}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.urgent 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.days === 0 ? "Today" : `${item.days}d left`}
                      </span>
                      <Link 
                        href={`/vehicles/${item.vehicle_id}`}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Vehicle →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No upcoming expiries in the next 30 days.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#F7F7F7] mt-auto bg-slate-50/50">
              <Link 
                href="/reports" 
                className="w-full inline-flex items-center justify-center rounded-lg border border-[#E5E5E5] bg-white py-2 text-[13px] font-medium text-[#111111] hover:bg-[#F7F7F7] transition-colors shadow-xs"
              >
                View Expiry Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
