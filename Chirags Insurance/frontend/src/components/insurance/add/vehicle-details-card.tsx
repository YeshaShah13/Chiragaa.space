import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface VehicleDetailsProps {
  vehicle: {
    id: number;
    vehicleNumber: string;
    ownerName: string;
    address: string;
    phone: string;
    registrationDate: string | null;
    model: string;
    make: string | null;
    seatingCapacity: number;
    horsePower: string;
    rlw: number;
    engineNumber: string;
    chassisNumber: string;
  };
}

export function VehicleDetailsCard({ vehicle }: VehicleDetailsProps) {
  const fields = [
    { label: "Vehicle Number", value: vehicle.vehicleNumber },
    { label: "Owner Name", value: vehicle.ownerName },
    { label: "Phone", value: vehicle.phone || "-" },
    { label: "Address", value: vehicle.address || "-" },
    { label: "Make", value: vehicle.make || "-" },
    { label: "Model", value: vehicle.model || "-" },
    { label: "Registration Date", value: vehicle.registrationDate ? new Date(vehicle.registrationDate).toLocaleDateString('en-GB') : "-" },
    { label: "Seating Capacity", value: vehicle.seatingCapacity ? String(vehicle.seatingCapacity) : "-" },
    { label: "Horse Power", value: vehicle.horsePower || "-" },
    { label: "RLW", value: vehicle.rlw ? String(vehicle.rlw) : "-" },
    { label: "Engine Number", value: vehicle.engineNumber || "-" },
    { label: "Chassis Number", value: vehicle.chassisNumber || "-" },
  ];

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[#111111]">Vehicle Details</h2>
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="h-4 w-4 text-[#999999]" />
            <p className="text-[15px] text-[#777777]">
              Vehicle information is read-only and managed from Motor Entry.
            </p>
          </div>
        </div>
        <Link 
          href={`/vehicles/view?id=${vehicle.id}`}
          target="_blank"
          className="inline-flex items-center text-[15px] font-medium text-[#111111] hover:underline"
        >
          View Vehicle Details
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 rounded-[12px] bg-[#FAFAFA] p-6 border border-[#E5E5E5]">
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[14px] font-medium text-[#777777] uppercase tracking-wider mb-1">
              {field.label}
            </span>
            <span className="text-[16px] font-medium text-[#111111] truncate" title={field.value}>
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
