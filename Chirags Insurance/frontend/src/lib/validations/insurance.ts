import * as z from "zod";

const numericString = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  })
  .refine((val) => val === undefined || val >= 0, "Value cannot be negative");

const emptyStringToNull = (val: string | undefined | null) => {
  if (val === "" || val === undefined || val === null) return undefined;
  return val;
};

export const insurancePolicySchema = z.object({
  vehicle_id: z.number({ required_error: "Vehicle is required" }),
  insurance_company_id: numericString,
  policy_number: z.string().min(1, "Policy number is required").max(255),
  start_date: z.string().nullish().transform(emptyStringToNull),
  expiry_date: z.string().min(1, "Expiry date is required"),
  premium_amount: numericString,
  is_active: z.boolean().optional(),
});

export type InsurancePolicyFormValues = z.infer<typeof insurancePolicySchema>;
