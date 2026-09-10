import { RotateCcw, Save, Plus, Trash, Printer } from "lucide-react";

interface MotorVehicleActionBarProps {
  mode: "create" | "edit";
  isSaving: boolean;
  isDeleting: boolean;
  onReset?: () => void;
  onExit?: () => void;
  onSave?: () => void;
  onSaveAndNew?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
}

export function MotorVehicleActionBar({
  mode,
  isSaving,
  isDeleting,
  onReset,
  onExit,
  onSave,
  onSaveAndNew,
  onDelete,
  onPrint
}: MotorVehicleActionBarProps) {
  const secondaryBtn = "flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200";
  const primaryBtn = "flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#1D4ED8] rounded-md hover:bg-blue-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50";
  const dangerBtn = "flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200";
  
  return (
    <div className="w-full bg-white border-t border-slate-200 py-3 px-6 flex justify-between items-center shrink-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div>
        <button type="button" onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors focus:outline-none">
          <RotateCcw className="w-4 h-4" />
          Reset Form
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        {mode === "edit" && (
          <>
            <button type="button" onClick={onDelete} disabled={isDeleting} className={dangerBtn}>
              <Trash className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            
            <button type="button" onClick={onPrint} className={secondaryBtn}>
              <Printer className="w-4 h-4" />
              Print
            </button>
          </>
        )}

        <button type="button" onClick={onExit} className={secondaryBtn}>
          Cancel
        </button>
        
        <button type="button" onClick={onSaveAndNew} disabled={isSaving} className={secondaryBtn}>
          <Plus className="w-4 h-4" />
          Save & New
        </button>
        
        <button type="button" onClick={onSave} disabled={isSaving} className={primaryBtn}>
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
