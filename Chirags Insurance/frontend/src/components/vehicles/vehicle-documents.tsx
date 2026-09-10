"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, Trash2, Download, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface Document {
  id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface VehicleDocumentsProps {
  vehicleId: string | number;
  documents: Document[];
}

export function VehicleDocuments({ vehicleId, documents = [] }: VehicleDocumentsProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("RC");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post(`/vehicles/${vehicleId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setFile(null);
      setErrorMsg(null);
      setSuccessMsg("Document uploaded successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      queryClient.invalidateQueries({ queryKey: ["vehicle", String(vehicleId)] });
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || "Failed to upload document.");
      setSuccessMsg(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiClient.delete(`/vehicles/${vehicleId}/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle", String(vehicleId)] });
      setIsDeletingId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete document.");
      setIsDeletingId(null);
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setIsDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 mt-[20px]">
      {/* Upload New Document Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[24px]">
        <div className="flex items-center mb-[18px]">
          <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
          <h3 className="text-[15px] font-semibold text-[#111111]">Upload New Document</h3>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[13px] font-semibold text-[#333333] uppercase tracking-wide">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#123B6D]"
            >
              <option value="RC">RC Copy</option>
              <option value="Insurance">Insurance Policy</option>
              <option value="Fitness">Fitness Certificate</option>
              <option value="Permit">Permit</option>
              <option value="National Permit">National Permit</option>
              <option value="Tax">Tax Receipt</option>
              <option value="PUC">PUC Certificate</option>
              <option value="Other">Other Document</option>
            </select>
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-[13px] font-semibold text-[#333333] uppercase tracking-wide">Choose File (PDF, PNG, JPG - Max 5MB)</label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#111111] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#123B6D]/10 file:text-[#123B6D] hover:file:bg-[#123B6D]/20 cursor-pointer"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Button 
              type="submit" 
              disabled={!file || uploadMutation.isPending} 
              className="w-full h-11 bg-[#123B6D] hover:bg-[#0c2849] text-white font-medium text-[13px] rounded-md transition-colors shadow-sm"
            >
              {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[24px]">
        <div className="flex items-center justify-between mb-[18px]">
          <div className="flex items-center">
            <div className="w-[3px] h-[16px] bg-[#123B6D] rounded-[2px] mr-[8px]"></div>
            <h3 className="text-[15px] font-semibold text-[#111111]">Attached Documents</h3>
          </div>
          <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {documents.length} {documents.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-[#777777]">
            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-[15px] font-medium text-[#333333]">No documents attached to this vehicle yet.</p>
            <p className="text-[13px] text-[#777777] mt-1">Upload registration documents, insurance policies, or fitness certificates above.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-4 group hover:bg-slate-50/50 -mx-6 px-6 transition-colors">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="bg-[#123B6D]/10 p-2.5 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 text-[#123B6D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px] text-[#111111] truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[#666666]">
                      <span className="font-medium text-[#123B6D]">{doc.document_type}</span>
                      <span>&bull;</span>
                      <span>Uploaded {new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="h-9 px-3 border-[#CBD5E1] text-[#333333] hover:text-[#111111] hover:bg-white shadow-2xs">
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeletingId === doc.id}
                  >
                    {isDeletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
