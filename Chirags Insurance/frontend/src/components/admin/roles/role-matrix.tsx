"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-admin";
import { Save, AlertCircle } from "lucide-react";
import { Role, Permission } from "@/types/admin";

export function RoleMatrix() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-roles-permissions"],
    queryFn: adminApi.getRoles,
  });

  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (data?.roles) {
      setLocalRoles(JSON.parse(JSON.stringify(data.roles)));
      setHasChanges(false);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number, permissionIds: number[] }) => 
      adminApi.updateRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      setSavingRoleId(null);
      refetch();
    }
  });

  if (isLoading) {
    return <div className="p-8">Loading roles and permissions...</div>;
  }

  const roles = localRoles;
  const permissionsByModule = data?.permissions || {};

  const handleToggle = (roleId: number, permissionId: number) => {
    setLocalRoles(current => 
      current.map(role => {
        if (role.id === roleId) {
          const perms = role.permissions || [];
          const hasPerm = perms.some(p => p.id === permissionId);
          let newPerms;
          
          if (hasPerm) {
            newPerms = perms.filter(p => p.id !== permissionId);
          } else {
            // Find the permission object from data
            let permObj = null;
            for (const module in permissionsByModule) {
              const found = permissionsByModule[module].find((p: Permission) => p.id === permissionId);
              if (found) permObj = found;
            }
            newPerms = [...perms, permObj];
          }
          
          return { ...role, permissions: newPerms };
        }
        return role;
      })
    );
    setHasChanges(true);
  };

  const handleSave = (roleId: number) => {
    const role = localRoles.find(r => r.id === roleId);
    if (role) {
      setSavingRoleId(roleId);
      updateMutation.mutate({ 
        roleId, 
        permissionIds: role.permissions?.map(p => p.id) || [] 
      });
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm overflow-hidden">
      
      <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-[#111111]">Permission Matrix</h2>
          <p className="text-sm text-gray-500">Configure access control for different roles across the application modules.</p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b-2 border-[#E5E7EB] z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-[14px] font-bold text-[#111111] uppercase tracking-wider w-1/4">
                Modules & Permissions
              </th>
              {roles.map(role => (
                <th key={role.id} className="px-6 py-4 text-center border-l border-[#E5E7EB]">
                  <div className="text-[15px] font-bold text-[#111111] mb-1">{role.name}</div>
                  <div className="text-[12px] font-normal text-gray-500 mb-3">{role.description}</div>
                  {role.id !== 1 && (
                    <button
                      onClick={() => handleSave(role.id)}
                      disabled={savingRoleId === role.id || role.id === 1}
                      className="px-3 py-1.5 bg-[#111111] text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors inline-flex items-center"
                    >
                      {savingRoleId === role.id ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                  {role.id === 1 && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded inline-flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> Full Access
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-white">
            {Object.entries(permissionsByModule).map(([module, perms]: [string, any]) => (
              <React.Fragment key={module}>
                <tr className="bg-gray-50">
                  <td colSpan={roles.length + 1} className="px-6 py-3 font-semibold text-gray-900 border-y border-[#E5E7EB]">
                    {module.replace(/_/g, ' ').toUpperCase()}
                  </td>
                </tr>
                {perms.map((permission: Permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 text-[14px] text-gray-700 font-medium">
                      {permission.description || permission.name}
                    </td>
                    {roles.map(role => {
                      const hasPerm = role.permissions?.some(p => p.id === permission.id);
                      const isAdministrator = role.id === 1;
                      
                      return (
                        <td key={role.id} className="px-6 py-4 text-center border-l border-[#E5E7EB]">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isAdministrator || hasPerm}
                              disabled={isAdministrator}
                              onChange={() => handleToggle(role.id, permission.id)}
                              className="h-5 w-5 rounded border-gray-300 text-[#111111] focus:ring-[#111111] disabled:opacity-50"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Temporary icon to avoid large imports
const Shield = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);
