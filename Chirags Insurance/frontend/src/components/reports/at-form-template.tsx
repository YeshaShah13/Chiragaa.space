import React from "react";
import { Vehicle } from "@/types/vehicle";

interface ATFormTemplateProps {
  vehicle: Vehicle | null;
}

export const ATFormTemplate = React.forwardRef<HTMLDivElement, ATFormTemplateProps>(
  ({ vehicle }, ref) => {
    if (!vehicle) return null;

    // Helper to format date safely
    const formatDate = (dateString?: string) => {
      if (!dateString) return "  /  /    ";
      try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "  /  /    ";
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
      } catch {
        return "  /  /    ";
      }
    };
    
    const mmvNo = vehicle.vehicle_number || "";
    const ownerName = vehicle.owner_name || "";
    const address = vehicle.permanent_address || "";
    
    // @ts-ignore
    const vehicleClass = vehicle.vehicle_class?.name || vehicle.class_id || ""; 
    
    // Tax fields
    const tax = (vehicle as any).tax || {};
    const taxAmount = tax.amount ? Number(tax.amount).toFixed(2) : "";
    const penalty = tax.penalty ? Number(tax.penalty).toFixed(2) : "";
    
    let totalAmount = "";
    if (taxAmount || penalty) {
      totalAmount = (Number(tax.amount || 0) + Number(tax.penalty || 0)).toFixed(2);
    }

    const taxWef = formatDate(tax.tax_up_to_date);
    const taxFrequency = tax.yearly ? "Yearly" : (tax.half_yearly ? "Half Yearly" : "");

    // Insurance fields
    const insurance = (vehicle as any).insurance || {};
    // @ts-ignore
    const insuranceCompany = insurance.insurance_company?.name || insurance.insurance_company_id || "__________________";
    const policyNo = insurance.policy_no || "__________________";
    const insFrom = formatDate(insurance.insurance_expiry_date); // Often insurance object only has expiry in this schema, using it for demonstration
    const insTo = formatDate(insurance.insurance_expiry_date);

    return (
      <div className="at-form-print-container flex justify-center w-full">
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
            .at-form-print-container,
            .at-form-print-container * {
              visibility: visible;
            }
            .at-form-print-container {
              position: absolute !important;
              left: 0 !important;
              top: 5mm !important;
              width: 100% !important;
              display: flex !important;
              justify-content: center !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .at-form-document {
              width: 100% !important;
              max-width: 190mm !important; /* Fit safely inside A4 */
              height: auto !important;
              aspect-ratio: 1338 / 1050 !important;
              margin: 0 auto !important;
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}} />

        <svg 
          viewBox="0 0 1338 1050" 
          className="at-form-document w-full h-auto bg-white shadow-md print:shadow-none"
          style={{ aspectRatio: '1338/1050' }}
        >
          <foreignObject x="0" y="0" width="1338" height="1050">
            <div ref={ref} className="w-[1338px] h-[1050px] bg-white text-black p-10 box-border" style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "18px",
              lineHeight: "1.5",
              margin: 0,
            }}>
              <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="text-[24px] font-bold tracking-widest w-1/3 pt-6">
              {mmvNo}
            </div>
            <div className="flex flex-col items-center w-2/3 text-[22px]">
              <div>AS PER BOMBAY MOTOR VEHICAL ACT,1958</div>
              <div className="font-bold tracking-widest mt-1">A.  -  T.  FORM</div>
              <div>[See Rule-6(1) and (6)]</div>
            </div>
          </div>

          {/* Owner & Address */}
          <div className="mb-1 whitespace-pre">
            {`I               :${ownerName}`}
          </div>
          <div className="mb-1 whitespace-pre flex">
            <span>Address         :</span>
            <span className="flex-1 break-words whitespace-normal">{address}</span>
          </div>

          {/* Tax Assessment */}
          <div className="mb-1 whitespace-pre">
            {`Running Assessment year as per registration date, MVNO:${mmvNo}`}
          </div>
          <div className="mb-1 flex">
            <span className="whitespace-pre">for that i want to pay the tax for the time of due Rs.           </span>
            <span className="font-bold tracking-widest ml-4">{taxAmount}</span>
          </div>
          <div className="mb-2">
            for cash i want to paid
          </div>

          {/* Declarations */}
          <div className="mb-1">(A.)      I want to use my vehical under municipality area</div>
          <div className="mb-1">(B.)      I want to use my vehical under and out to municipality area</div>
          <div className="mb-1">(C.)      vehical use fuel for motor sprit / other than motor sprit</div>
          
          {/* Insurance */}
          <div className="mb-1 flex">
            <span className="whitespace-pre">(D.)      Insured Co. {insuranceCompany}    (E.) Pilicy no :{policyNo}</span>
          </div>
          <div className="mb-8 flex">
            <span className="whitespace-pre">(F.)      From </span>
            <span className="font-bold">{insFrom}</span>
            <span className="whitespace-pre"> To : </span>
            <span className="font-bold">{insTo}</span>
          </div>

          {/* Signature Space */}
          <div className="flex justify-end pr-32 mt-12 mb-8">
            Signature of Applicant(s)
          </div>

          {/* Lower Vehicle Info */}
          <div className="flex mb-8">
            <span className="w-1/3 whitespace-pre">MMV No. : {mmvNo}</span>
            <span className="font-bold ml-24">{vehicleClass}</span>
          </div>

          {/* Legal Text */}
          <div className="mb-8 leading-relaxed whitespace-pre-wrap">
{`Under B.M.V.act 1958 , section 10 if any person declare falt all declaration
file under the form is not true then person is panish. if it moves that
declaration is falt first time DAM-100 and for another time DAM-200.`}
          </div>

          {/* Lower Tax Info */}
          <div className="mb-6 flex">
            <span className="whitespace-pre">Tax wef : {taxWef} to :    /  /         -      </span>
            <span className="font-bold mr-6">{taxFrequency}</span>
            <span className="font-bold">{mmvNo}</span>
          </div>

          <div className="mb-4 whitespace-pre">
            {`Tax Rs.         :      ${taxAmount}`}
          </div>

          <div className="mb-4 flex">
            <span className="whitespace-pre">Panelty Rs. : </span>
            {penalty ? <span>{penalty}</span> : <span className="tracking-widest">________________________</span>}
          </div>

          <div className="mb-16 flex">
            <span className="whitespace-pre">Total Rs.     : </span>
            {totalAmount ? <span>{totalAmount}</span> : <span className="tracking-widest">________________________</span>}
          </div>

          {/* Footer */}
          <div className="flex justify-end pr-12 mt-auto pb-8">
            Regional Transport Authority
          </div>
        </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    );
  }
);

ATFormTemplate.displayName = "ATFormTemplate";
