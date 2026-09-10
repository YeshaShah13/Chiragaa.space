import React from "react";
import { Vehicle } from "@/types/vehicle";

interface CFRAFormTemplateProps {
  vehicle: Vehicle | null;
}

export const CFRAFormTemplate = React.forwardRef<HTMLDivElement, CFRAFormTemplateProps>(
  ({ vehicle }, ref) => {
    if (!vehicle) return null;

    const mmvNo = vehicle.vehicle_number || "";
    const secondaryNo = vehicle.troli_no || "";
    // @ts-ignore
    const make = vehicle.make?.name || vehicle.make_id || "";
    const model = vehicle.model || "";
    const ownerName = vehicle.owner_name || "";
    const address = vehicle.permanent_address || "";

    return (
      <div className="cfra-form-print-container flex justify-center w-full">
        {/* Style for printing to enforce A4 Portrait and isolate document */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * {
              position: static !important;
              overflow: visible !important;
            }
            body * {
              visibility: hidden;
            }
            .cfra-form-print-container,
            .cfra-form-print-container * {
              visibility: visible;
            }
            .cfra-form-print-container {
              position: absolute !important;
              left: 0 !important;
              top: 5mm !important;
              width: 100% !important;
              display: flex !important;
              justify-content: center !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .cfra-form-document {
              width: 100% !important;
              max-width: 190mm !important; /* Fit safely inside A4 */
              height: auto !important;
              aspect-ratio: 898 / 780 !important;
              margin: 0 auto !important;
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}} />

        <svg 
          viewBox="0 0 898 780" 
          className="cfra-form-document w-full h-auto bg-white shadow-md print:shadow-none"
          style={{ aspectRatio: '898/780' }}
        >
          <foreignObject x="0" y="0" width="898" height="780">
            <div ref={ref} className="w-[898px] h-[780px] bg-white text-black p-12 box-border relative" style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "18px",
              lineHeight: "1.8",
              margin: 0,
            }}>
              
              {/* Header Title */}
              <div className="text-center font-bold tracking-[0.3em] text-[22px] mb-2">
                C.F.R.A.
              </div>

              {/* Amount */}
              <div className="flex justify-end pr-8 mb-6">
                <span className="whitespace-pre">Rs. : _________________</span>
              </div>

              {/* RTO and Date row */}
              <div className="flex justify-between items-start mb-8 pr-32">
                <div>
                  <div>R.T.O</div>
                  <div>_________________</div>
                </div>
                <div>
                  __/__/____
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="mb-2 whitespace-pre flex">
                <span className="w-[140px]">M.V. No.</span>
                <span className="w-[20px]">:</span>
                <span className="font-bold tracking-widest text-[22px]">{mmvNo}</span>
              </div>
              <div className="mb-10 pl-[160px] font-bold tracking-widest text-[20px]">
                {secondaryNo}
              </div>

              <div className="mb-4 whitespace-pre flex">
                <span className="w-[140px]">MAKE</span>
                <span className="w-[20px]">:</span>
                <span className="font-bold uppercase">{make}</span>
              </div>

              <div className="mb-4 whitespace-pre flex">
                <span className="w-[140px]">MODEL</span>
                <span className="w-[20px]">:</span>
                <span className="font-bold">{model}</span>
              </div>

              <div className="mb-4 whitespace-pre flex">
                <span className="w-[140px]">OWNER NAME</span>
                <span className="w-[20px]">:</span>
                <span className="font-bold uppercase">{ownerName}</span>
              </div>

              <div className="mb-8 whitespace-pre flex">
                <span className="w-[140px]">ADDRESS</span>
                <span className="w-[20px]">:</span>
                <span className="font-bold uppercase break-words whitespace-normal w-[600px]">{address}</span>
              </div>

              {/* D.A. REMARKS section */}
              <div className="absolute right-12 bottom-16 w-[400px]">
                <div className="text-center mb-2">D.A.REMARKS</div>
                <div className="border border-dashed border-black h-[140px] flex items-center justify-center p-4">
                   <div className="font-bold tracking-widest text-[22px] -mt-8">{mmvNo}</div>
                </div>
              </div>

            </div>
          </foreignObject>
        </svg>
      </div>
    );
  }
);

CFRAFormTemplate.displayName = "CFRAFormTemplate";
