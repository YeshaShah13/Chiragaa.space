export interface Vehicle {
  id: number;
  vehicle_number: string;
  troli_no?: string;
  owner_name: string;
  registration_date?: string;
  tractor_registration_date?: string;
  permanent_address?: string;
  phone?: string;
  
  make_id?: number;
  class_id?: number;
  
  model?: string;
  horse_power?: number;
  rlw?: number;
  cylinder?: number;
  s_c_ind?: number;
  uw?: number;
  
  engine_number?: string;
  chassis_number?: string;
  plw?: number;
  status: 'Active' | 'Inactive' | 'Archived';
  tax_status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'DUE';
  tax?: {
    tax_up_to_date?: string;
    tax_paid_date?: string;
    amount?: number;
    penalty?: number;
    interest?: number;
    receipt_no?: string;
    yearly?: boolean;
    yearly_amount?: number;
    half_yearly?: boolean;
    half_yearly_amount?: number;
  };
  fitness_status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_AVAILABLE';
  fitness?: {
    issue_date?: string;
    expiry_date?: string;
    certificate_number?: string;
    passed_by?: string;
    place?: string;
  };
  permit_status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_AVAILABLE';
  permit?: {
    id?: number;
    expiry_date?: string;
    permit_number?: string;
    amount?: number;
    receipt_no?: string;
    issue_date?: string;
  };
  national_permit_status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_AVAILABLE';
  national_permit?: {
    id?: number;
    expiry_date?: string;
    state_info?: string;
    address?: string;
    city?: string;
  };
  
  hpa_with?: string;
  remarks?: string;
  group?: string;

  created_at: string;
  updated_at: string;

  make?: {
    id: number;
    name: string;
  };
  vehicle_class?: {
    id: number;
    name: string;
  };

  tax_records?: TaxRecord[];
  fitness_records?: FitnessRecord[];
  permits?: Permit[];
  national_permits?: NationalPermit[];
  insurance_policies?: InsurancePolicy[];
  documents?: VehicleDocument[];
}

export interface TaxRecord {
  id: number;
  vehicle_id: number;
  valid_upto: string;
  paid_date?: string;
  penalty?: number;
  interest?: number;
  amount?: number;
  receipt_number?: string;
  yearly?: boolean;
  yearly_amount?: number;
  half_yearly?: boolean;
  half_yearly_amount?: number;
}

export interface FitnessRecord {
  id: number;
  vehicle_id: number;
  expiry_date: string;
  passed_by?: string;
  place?: string;
}

export interface Permit {
  id: number;
  vehicle_id: number;
  expiry_date: string;
  permit_number?: string;
  amount?: number;
  receipt_no?: string;
  issue_date?: string;
}

export interface NationalPermit {
  id: number;
  vehicle_id: number;
  expiry_date: string;
  state_info?: string;
  address?: string;
  city?: string;
}

export interface InsurancePolicy {
  id: number;
  vehicle_id: number;
  insurance_company_id?: number;
  policy_number: string;
  start_date?: string;
  expiry_date: string;
  premium_amount?: number;
  is_active?: boolean;
  insurance_company?: {
    id: number;
    name: string;
  }
}

export interface VehicleDocument {
  id: number;
  vehicle_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
