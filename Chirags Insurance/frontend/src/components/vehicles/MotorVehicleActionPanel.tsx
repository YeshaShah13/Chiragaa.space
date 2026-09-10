import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MotorVehicleActionPanelProps {
  mode: "create" | "edit";
  isSaving: boolean;
  isDeleting: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function MotorVehicleActionPanel({ mode, isSaving, isDeleting, onEditClick, onDeleteClick }: MotorVehicleActionPanelProps) {
  const router = useRouter();

  const ActionButton = ({
    label,
    primary = false,
    onClick,
    disabled = false
  }: {
    label: string;
    primary?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full h-[32px] text-[13px] font-bold rounded-sm flex items-center justify-between px-2 shadow-none
        ${primary 
          ? "bg-[#003399] hover:bg-[#002277] text-white border-transparent" 
          : "bg-white hover:bg-slate-50 text-[#003399] border border-[#003399]"
        }
      `}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="flex-1 text-center">{label}</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="w-[180px] border border-slate-300 rounded-md p-3 bg-white shadow-sm flex flex-col gap-3">
      <ActionButton
        label="EDIT"
        primary
        onClick={onEditClick}
        disabled={isSaving}
      />
      
      <ActionButton
        label="DELETE"
        onClick={onDeleteClick}
        disabled={isDeleting}
      />
      
      <ActionButton
        label="NEXT SCREEN"
      />
      
      <ActionButton
        label="EXIT"
        onClick={() => router.back()}
        disabled={isSaving}
      />
    </div>
  );
}
