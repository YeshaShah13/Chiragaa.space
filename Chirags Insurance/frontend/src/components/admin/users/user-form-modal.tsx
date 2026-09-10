"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";
import { X, Save, AlertCircle } from "lucide-react";

interface UserFormModalProps {
  userId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserFormModal({ userId, onClose, onSuccess }: UserFormModalProps) {
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 1,
    status: "Active",
    phone: "",
    department: "",
  });

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles and permissions for the dropdown and grid
  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: adminApi.getRoles,
  });

  // Fetch user if editing
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminApi.getUser(userId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        password: "", // Don't populate password
        role_id: userData.role_id || 1,
        status: userData.status || "Active",
        phone: userData.phone || "",
        department: userData.department || "",
      });
      if (userData.permissions) {
        setSelectedPermissions(userData.permissions.map(p => p.id));
      }
    }
  }, [userData, isEditing]);

  useEffect(() => {
    if (!isEditing && rolesData?.roles?.length && !formData.role_id) {
      setFormData(prev => ({ ...prev, role_id: rolesData.roles[0].id }));
    }
  }, [rolesData, isEditing, formData.role_id]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEditing ? adminApi.updateUser(userId, data) : adminApi.createUser(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        const errorMessages = Object.entries(serverErrors)
          .map(([_, msgs]) => Array.isArray(msgs) ? msgs.join(" ") : String(msgs))
          .join(" | ");
        setError(errorMessages || err.response?.data?.message || "Validation failed.");
      } else {
        setError(err.response?.data?.message || err.message || "An error occurred");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const submitData: any = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role_id: Number(formData.role_id),
      status: formData.status,
      phone: formData.phone.trim() || null,
      department: formData.department.trim() || null,
      permissions: formData.role_id === 1 ? [] : selectedPermissions,
    };

    if (!isEditing) {
      submitData.password = formData.password;
    } else if (formData.password) {
      submitData.password = formData.password;
    }

    mutation.mutate(submitData);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: (newPassword: string) => adminApi.resetPassword(userId!, newPassword),
    onSuccess: () => {
      alert("Password reset successfully");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  });

  const handleResetPassword = () => {
    const newPassword = prompt("Enter new password (min 8 characters):");
    if (newPassword && newPassword.length >= 8) {
      resetPasswordMutation.mutate(newPassword);
    } else if (newPassword) {
      alert("Password must be at least 8 characters");
    }
  };

  if (isEditing && isLoadingUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-[16px] p-8">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-[16px] shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-xl font-serif font-medium text-[#111111]">
            {isEditing ? "Edit User" : "Add New User"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-100">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111111]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111111]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#111111]">Initial Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111111]">Base Role *</label>
                  <select
                    required
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {rolesData?.roles?.map((role: any) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111111]">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111111]">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111111]">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Custom Permissions */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Custom User Permissions</h3>
              <p className="text-xs text-gray-500 mb-4">
                These permissions will be assigned directly to this user, supplementing their Base Role.
                If they are an Administrator, they already have full access.
              </p>
              
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#111111] uppercase tracking-wider">Module</th>
                      <th className="px-4 py-3 text-[13px] font-bold text-[#111111] uppercase tracking-wider text-center">Specific Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {rolesData?.permissions && Object.entries(rolesData.permissions).map(([module, perms]: [string, any]) => (
                      <tr key={module} className="hover:bg-gray-50/30">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 w-1/3 border-r border-[#E5E7EB]">
                          {module.replace(/_/g, ' ').toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-4">
                            {perms.map((permission: any) => (
                              <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={formData.role_id === 1}
                                  checked={formData.role_id === 1 || selectedPermissions.includes(permission.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPermissions([...selectedPermissions, permission.id]);
                                    } else {
                                      setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-[#111111] focus:ring-[#111111] disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                  {permission.name.split('.')[1].replace(/_/g, ' ')}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Need to reset this user's access?</span>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="px-4 py-2 bg-gray-100 text-[#111111] text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-gray-50 flex justify-end space-x-3 rounded-b-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E7EB] text-[#555555] font-medium rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={mutation.isPending}
            className="flex items-center px-5 py-2.5 bg-[#111111] text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Save Changes" : "Create User"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
