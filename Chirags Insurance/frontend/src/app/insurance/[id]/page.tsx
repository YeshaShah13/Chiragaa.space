import { InsuranceDetails } from "@/components/insurance/insurance-details";
import { use } from "react";

export default function InsuranceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="max-w-5xl mx-auto">
      <InsuranceDetails policyId={id} />
    </div>
  );
}
