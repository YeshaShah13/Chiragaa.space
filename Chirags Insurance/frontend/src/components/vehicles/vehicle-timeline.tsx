import { Vehicle, InsurancePolicy, TaxRecord, FitnessRecord, Permit, NationalPermit, VehicleDocument } from "@/types/vehicle";
import {
  FileText,
  Shield,
  Calendar,
  FileCheck,
  Truck,
  CarFront,
  AlertCircle,
  UploadCloud
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleTimelineProps {
  vehicle: Vehicle;
}

type TimelineEvent = {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'creation' | 'document' | 'insurance' | 'tax' | 'fitness' | 'permit' | 'national_permit';
  status?: 'upcoming' | 'past';
};

export function VehicleTimeline({ vehicle }: VehicleTimelineProps) {
  const events: TimelineEvent[] = [];
  const now = new Date();

  const addEvent = (event: Omit<TimelineEvent, 'id' | 'status'> & { id?: string | number }) => {
    if (isNaN(event.date.getTime())) return;
    
    events.push({
      ...event,
      id: `${event.type}-${event.id || Math.random().toString(36).substr(2, 9)}`,
      status: event.date > now ? 'upcoming' : 'past',
    });
  };

  // Vehicle Creation
  if (vehicle.created_at) {
    addEvent({
      id: 'creation',
      date: new Date(vehicle.created_at),
      title: 'Vehicle Registered',
      description: `Vehicle ${vehicle.vehicle_number} added to the system.`,
      type: 'creation'
    });
  }

  // Documents
  vehicle.documents?.forEach((doc) => {
    if (doc.created_at) {
      addEvent({
        id: doc.id,
        date: new Date(doc.created_at),
        title: 'Document Uploaded',
        description: `Uploaded ${doc.document_type || 'a document'} - ${doc.file_name}`,
        type: 'document'
      });
    }
  });

  // Insurance Policies
  vehicle.insurance_policies?.forEach((policy) => {
    if (policy.expiry_date) {
      addEvent({
        id: policy.id,
        date: new Date(policy.expiry_date),
        title: 'Insurance Expiry',
        description: `Policy ${policy.policy_number} ${policy.insurance_company ? `(${policy.insurance_company.name})` : ''} expires.`,
        type: 'insurance'
      });
    }
  });

  // Tax Records
  vehicle.tax_records?.forEach((tax) => {
    if (tax.valid_upto) {
      addEvent({
        id: tax.id,
        date: new Date(tax.valid_upto),
        title: 'Tax Validity Expiry',
        description: `Tax record valid up to this date. Receipt: ${tax.receipt_number || 'N/A'}`,
        type: 'tax'
      });
    }
  });

  // Fitness Records
  vehicle.fitness_records?.forEach((fitness) => {
    if (fitness.expiry_date) {
      addEvent({
        id: fitness.id,
        date: new Date(fitness.expiry_date),
        title: 'Fitness Certificate Expiry',
        description: `Fitness certificate expires. Passed by: ${fitness.passed_by || 'N/A'}`,
        type: 'fitness'
      });
    }
  });

  // Permits
  vehicle.permits?.forEach((permit) => {
    if (permit.expiry_date) {
      addEvent({
        id: permit.id,
        date: new Date(permit.expiry_date),
        title: 'Permit Expiry',
        description: `Permit ${permit.permit_number || ''} expires.`,
        type: 'permit'
      });
    }
  });

  // National Permits
  vehicle.national_permits?.forEach((permit) => {
    if (permit.expiry_date) {
      addEvent({
        id: permit.id,
        date: new Date(permit.expiry_date),
        title: 'National Permit Expiry',
        description: `National Permit expires. State info: ${permit.state_info || 'N/A'}`,
        type: 'national_permit'
      });
    }
  });

  // Sort events chronologically (newest first / furthest in future first down to oldest)
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'creation': return <CarFront className="h-4 w-4" />;
      case 'document': return <UploadCloud className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'tax': return <FileText className="h-4 w-4" />;
      case 'fitness': return <FileCheck className="h-4 w-4" />;
      case 'permit': 
      case 'national_permit': return <Truck className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getColor = (type: TimelineEvent['type'], status: TimelineEvent['status']) => {
    if (status === 'upcoming') {
      return "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    }
    
    switch (type) {
      case 'creation': return "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case 'document': return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      case 'insurance': return "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-8">
      {events.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
          No timeline events available for this vehicle.
        </div>
      ) : (
        <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
          {events.map((event) => (
            <div key={event.id} className="relative pl-6">
              {/* Timeline marker */}
              <div 
                className={cn(
                  "absolute -left-3.5 top-1 h-7 w-7 rounded-full border-2 flex items-center justify-center bg-background",
                  getColor(event.type, event.status)
                )}
              >
                {getIcon(event.type)}
              </div>
              
              <div className="bg-card border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  <div className="flex items-center text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3 mr-1" />
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.status === 'upcoming' && (
                      <span className="ml-2 text-amber-500 font-bold flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
