import { VehicleDetails } from "@/components/vehicles/vehicle-details";
import { use } from "react";

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="max-w-5xl mx-auto">
      <VehicleDetails vehicleId={id} />
    </div>
  );
}
