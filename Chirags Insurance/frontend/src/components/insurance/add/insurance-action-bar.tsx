import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface InsuranceActionBarProps {
  isSaving: boolean;
  onSaveAndNew: () => void;
}

export function InsuranceActionBar({ isSaving, onSaveAndNew }: InsuranceActionBarProps) {
  const router = useRouter();

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-[#E5E5E5] bg-white/80 backdrop-blur-md px-6 py-4 lg:px-8 mt-12 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <button
        type="button"
        onClick={() => router.back()}
        disabled={isSaving}
        className="rounded-[10px] border border-[#E5E5E5] bg-transparent px-6 py-2.5 text-[16px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] hover:border-[#111111] disabled:opacity-50"
      >
        Cancel
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveAndNew}
          disabled={isSaving}
          className="rounded-[10px] border border-[#111111] bg-white px-6 py-2.5 text-[16px] font-medium text-[#111111] transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save & New"}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center rounded-[10px] bg-[#111111] px-8 py-2.5 text-[16px] font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Policy...
            </>
          ) : (
            "Save Policy"
          )}
        </button>
      </div>
    </div>
  );
}
