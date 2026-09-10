"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";
import { Search, Plus, MoreVertical, Edit, Shield, ShieldAlert, Key } from "lucide-react";
import { UserFormModal } from "@/components/admin/users/user-form-modal";

export function UserGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", page, searchTerm],
    queryFn: () => adminApi.getUsers({ page: page.toString(), search: searchTerm }),
  });

  const handleEdit = (id: number) => {
    setEditingUserId(id);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-[#111111] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 border-b border-[#E5E7EB] z-10">
            <tr>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Name & Email</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-4 text-[14px] font-semibold text-[#111111] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-48"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <ShieldAlert className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-lg font-medium text-gray-900">No users found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </td>
              </tr>
            ) : (
              data?.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[16px] font-medium text-[#111111]">{user.name}</div>
                        <div className="text-[14px] text-[#555555]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-[15px] text-[#333333]">
                      <Shield className="h-4 w-4 mr-2 text-primary" />
                      {user.role?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' :
                      user.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[15px] text-[#555555]">
                    {user.last_login_at ? `${new Date(user.last_login_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date(user.last_login_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleEdit(user.id)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {/* Optionally add reset password button here */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-gray-50">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(data.current_page - 1) * data.per_page + 1}</span> to <span className="font-medium">{Math.min(data.current_page * data.per_page, data.total)}</span> of <span className="font-medium">{data.total}</span> users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === data.last_page}
              className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <UserFormModal 
          userId={editingUserId} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
