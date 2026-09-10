import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/admin";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => apiClient.get("/auth/me").then(res => res.data.data.user as User),
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAdmin = Boolean(
    user && (
      user.role_id === 1 ||
      user.role?.name === 'Administrator' ||
      user.role?.name?.toLowerCase().includes('admin')
    )
  );

  const hasPermission = (permissionName: string) => {
    if (!user) return false;
    
    // Administrator role gets all permissions automatically
    if (isAdmin) return true;
    
    // Direct user permissions check
    if (user.permissions && user.permissions.some(p => p.name === permissionName)) {
      return true;
    }

    // Role permissions check
    if (user.role?.permissions && user.role.permissions.some(p => p.name === permissionName)) {
      return true;
    }
    
    return false;
  };

  return { user, isLoading, error, hasPermission, isAdmin };
}
