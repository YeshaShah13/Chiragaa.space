import { UploadCloud } from "lucide-react";

export function DocumentUploader() {
  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#111111]">Policy Documents</h2>
        <p className="text-[16px] text-[#777777] mt-1">Upload documents related to this insurance policy.</p>
      </div>

      <div className="rounded-[12px] border-2 border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-8 text-center transition-colors hover:border-[#111111] hover:bg-white cursor-pointer">
        <UploadCloud className="mx-auto h-10 w-10 text-[#999999] mb-4" />
        <p className="text-[16px] font-medium text-[#111111] mb-1">
          Drag & drop files here or <span className="underline">Browse Files</span>
        </p>
        <p className="text-[15px] text-[#777777]">
          Supported: PDF, JPG, PNG (Max size: 10 MB)
        </p>
      </div>
      
      {/* Example placeholder for uploaded files - logic to be integrated with vehicle document API */}
      <div className="mt-4 space-y-2">
         <p className="text-[15px] text-[#999999] italic">Documents will be uploaded and associated with the vehicle after the policy is saved.</p>
      </div>
    </div>
  );
}
