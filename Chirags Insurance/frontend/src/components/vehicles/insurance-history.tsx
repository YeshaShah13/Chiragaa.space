import { InsurancePolicy } from "@/types/vehicle";
import { Shield, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InsuranceHistoryProps {
  policies: InsurancePolicy[];
  vehicleId: string;
}

export function InsuranceHistory({ policies, vehicleId }: InsuranceHistoryProps) {
  // Sort policies chronologically (newest expiry first)
  const sortedPolicies = [...policies].sort((a, b) => {
    return new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Insurance History
        </h3>
        <Link href={`/insurance/create?vehicle_id=${vehicleId}`}>
          <Button variant="outline" size="sm">
            Add Policy
          </Button>
        </Link>
      </div>

      {sortedPolicies.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed bg-muted/20">
          No insurance policies found for this vehicle.
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Policy No.</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Start Date</th>
                  <th className="px-4 py-3 font-medium">Expiry Date</th>
                  <th className="px-4 py-3 font-medium">Premium</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-card">
                {sortedPolicies.map((policy) => {
                  const isExpired = new Date(policy.expiry_date) < new Date();
                  const isExpiringSoon = !isExpired && 
                    (new Date(policy.expiry_date).getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <tr key={policy.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{policy.policy_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{policy.insurance_company?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{policy.start_date ? new Date(policy.start_date).toLocaleDateString() : "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "font-medium",
                          isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {new Date(policy.expiry_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{policy.premium_amount ? `₹${policy.premium_amount}` : "N/A"}</td>
                      <td className="px-4 py-3">
                        {policy.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 border border-slate-200">
                            Inactive
                          </span>
                        )}
                        {isExpired && policy.is_active && (
                          <span className="inline-flex ml-2 items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                            <ShieldAlert className="mr-1 h-3 w-3" />
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/insurance/view?id=${policy.id}`} className="text-primary hover:underline inline-flex items-center font-medium">
                          View
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
