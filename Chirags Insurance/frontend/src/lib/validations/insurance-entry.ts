import * as z from "zod";

export const insuranceEntrySchema = z.object({
  vehicle_id: z.number({
    required_error: "Vehicle is required.",
  }).min(1, "Please select a vehicle."),
  
  insurance_company_id: z.coerce.number().optional().nullable(),
  insurance_company_name: z.string().min(1, "Insurance company is required."), // Fallback or text based selection
  
  policy_number: z.string().min(1, "Policy number is required."),
  receipt_number: z.string().optional(),
  
  start_date: z.string().optional().nullable(),
  expiry_date: z.string().min(1, "Policy expiry date is required."),
  
  confirmation_number: z.string().optional(),
  confirmation_date: z.string().optional().nullable(),
  transfer_date: z.string().optional().nullable(),
  
  group_name: z.string().optional(),
  hpa_with: z.string().optional(),
  remarks: z.string().optional(),
  
  sum_insured: z.coerce.number().min(0).optional().default(0),
  trolley_amount: z.coerce.number().min(0).optional().default(0),
  other_amount: z.coerce.number().min(0).optional().default(0),
  ncb: z.coerce.number().min(0).optional().default(0),
  od_tp_premium: z.coerce.number().min(0).optional().default(0),
  service_tax: z.coerce.number().min(0).optional().default(0),
});

export type InsuranceEntryFormValues = z.infer<typeof insuranceEntrySchema>;
