"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";
import { Users, UserCheck, UserX, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return <div className="p-8 h-full flex items-center justify-center">Loading dashboard...</div>;
  }

  const stats = data;

  const statCards = [
    { title: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Active Users", value: stats?.active_users || 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-100" },
    { title: "Inactive/Suspended", value: stats?.inactive_users || 0, icon: UserX, color: "text-red-600", bg: "bg-red-100" },
    { title: "Recent Activity (7d)", value: stats?.recent_activity_count || 0, icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight">
            Administration Overview
          </h1>
          <p className="text-[18px] text-[#777777] mt-1 mb-4">
            Overview of system users, roles, and recent activity.
          </p>
        </div>
      </div>

      <div className="w-full space-y-8">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm flex items-center space-x-4">
              <div className={`p-4 rounded-full ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-medium text-[#111111]">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-gray-50/50">
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {stats?.recent_activity?.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[15px] text-[#555555]">
                      {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[15px] text-[#111111] font-medium">
                      {log.user?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                        log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                        log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[15px] text-[#555555]">
                      {log.module}
                    </td>
                    <td className="px-6 py-4 text-[15px] text-[#555555]">
                      {log.description || '-'}
                    </td>
                  </tr>
                ))}
                {!stats?.recent_activity?.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
