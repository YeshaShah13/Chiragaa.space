export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  role_id: number;
  role?: Role;
  permissions?: Permission[];
  last_login_at?: string;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  module: string;
  record_id?: number;
  entity_name?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  status: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  recent_activity_count: number;
  recent_activity: AuditLog[];
}
