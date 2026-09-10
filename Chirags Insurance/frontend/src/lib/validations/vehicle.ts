import * as z from "zod";

export const vehicleSchema = z.object({
  // Basic Information
  vehicle_number: z.any().optional(),
  troli_no: z.any().optional(),
  owner_name: z.any().optional(),
  registration_date: z.any().optional(),
  tractor_registration_date: z.any().optional(),
  
  // Address
  permanent_address: z.any().optional(),
  phone: z.any().optional(),
  status: z.any().optional(),
  
  // General Details
  class_id: z.any().optional(),
  model: z.any().optional(),
  horse_power: z.any().optional(),
  rlw: z.any().optional(),
  cylinder: z.any().optional(),
  s_c_ind: z.any().optional(),
  uw: z.any().optional(),
  make_id: z.any().optional(),
  chassis_number: z.any().optional(),
  engine_number: z.any().optional(),
  plw: z.any().optional(),
  
  // Compliance Details
  tax: z.any().optional(),
  fitness: z.any().optional(),
  permit: z.any().optional(),
  national_permit: z.any().optional(),
  insurance: z.any().optional(),

  // Additional Information
  hpa_with: z.any().optional(),
  remarks: z.any().optional(),
  group: z.any().optional(),
}).passthrough();

export type VehicleFormValues = {
  vehicle_number?: string;
  troli_no?: string;
  owner_name?: string;
  registration_date?: string;
  tractor_registration_date?: string;
  permanent_address?: string;
  phone?: string;
  status?: string;
  class_id?: any;
  model?: string;
  horse_power?: any;
  rlw?: any;
  cylinder?: any;
  s_c_ind?: any;
  uw?: any;
  make_id?: any;
  chassis_number?: string;
  engine_number?: string;
  plw?: any;
  tax?: any;
  fitness?: any;
  permit?: any;
  national_permit?: any;
  insurance?: any;
  hpa_with?: string;
  remarks?: string;
  group?: string;
  [key: string]: any;
};

export type VehicleFormOutput = VehicleFormValues;
