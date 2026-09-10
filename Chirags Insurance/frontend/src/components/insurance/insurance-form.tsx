"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, Search, CheckCircle2, Car } from "lucide-react";
import { insurancePolicySchema, type InsurancePolicyFormValues } from "@/lib/validations/insurance";
import { apiClient } from "@/lib/api-client";
import { Vehicle } from "@/types/vehicle";
import { Button } from "@/components/ui/button";

interface InsuranceFormProps {
  renewPolicyId?: string;
}

export function InsuranceForm({ renewPolicyId }: InsuranceFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Vehicle Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: renewingPolicy, isLoading: isLoadingRenewal } = useQuery({
    queryKey: ["insurance-policy", renewPolicyId],
    queryFn: async () => {
      const response = await apiClient.get(`/insurance/${renewPolicyId}`);
      return response.data.data;
    },
    enabled: !!renewPolicyId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InsurancePolicyFormValues>({
    resolver: zodResolver(insurancePolicySchema) as any,
    defaultValues: {
      is_active: true,
    },
  });

  useEffect(() => {
    if (renewingPolicy) {
      if (renewingPolicy.vehicle) {
        setSelectedVehicle(renewingPolicy.vehicle);
        setValue("vehicle_id", renewingPolicy.vehicle.id);
      }
      if (renewingPolicy.insurance_company_id || renewingPolicy.policy?.insuranceCompanyId) {
        setValue("insurance_company_id", renewingPolicy.insurance_company_id || renewingPolicy.policy?.insuranceCompanyId);
      }
    }
  }, [renewingPolicy, setValue]);

  const searchVehicleMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiClient.get(`/vehicles?search=${query}`);
      return response.data.data.data; // Paginated data array
    },
    onSuccess: (vehicles: Vehicle[]) => {
      if (vehicles.length === 0) {
        setSearchError("No vehicle found with that number or name.");
        setSelectedVehicle(null);
      } else {
        setSearchError(null);
        setSelectedVehicle(vehicles[0]);
        setValue("vehicle_id", vehicles[0].id);
      }
    },
    onError: () => {
      setSearchError("Error searching for vehicle. Please try again.");
      setSelectedVehicle(null);
    }
  });

  const handleSearchVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchError(null);
    searchVehicleMutation.mutate(searchQuery);
  };

  const mutation = useMutation({
    mutationFn: async (data: InsurancePolicyFormValues) => {
      const response = await apiClient.post("/insurance", data);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg("Insurance policy created successfully!");
      queryClient.invalidateQueries({ queryKey: ["insurance-list"] });
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      setTimeout(() => {
        router.push("/insurance");
      }, 1500);
    },
    onError: (error: any) => {
      setErrorMsg(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    },
  });

  const onSubmit = (data: InsurancePolicyFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!selectedVehicle) {
      setErrorMsg("Please select a vehicle first.");
      return;
    }
    mutation.mutate(data);
  };

  if (renewPolicyId && isLoadingRenewal) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Vehicle Selection */}
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <Car className="mr-2 h-5 w-5 text-primary" />
          1. Vehicle Selection
        </h3>
        
        {!selectedVehicle ? (
          <form onSubmit={handleSearchVehicle} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label htmlFor="searchQuery" className="text-sm font-medium leading-none">
                Search Vehicle (by Number or Owner)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="searchQuery"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pl-10 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. MH01AB1234"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchError && (
                <p className="text-[0.8rem] font-medium text-destructive mt-1">
                  {searchError}
                </p>
              )}
            </div>
            <Button type="submit" disabled={searchVehicleMutation.isPending}>
              {searchVehicleMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Selected Vehicle</p>
              <h4 className="text-lg font-bold text-primary mt-1">{selectedVehicle.vehicle_number}</h4>
              <p className="text-sm">{selectedVehicle.owner_name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedVehicle(null);
              setValue("vehicle_id", 0);
            }}>
              Change Vehicle
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: Policy Details (Only show if vehicle is selected) */}
      {selectedVehicle && (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 transition-all animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            2. Policy Details
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="rounded-md bg-green-100 p-4 text-sm text-green-800 font-medium border border-green-200">
                {successMsg}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="policy_number" className="text-sm font-medium leading-none">
                  Policy Number *
                </label>
                <input
                  {...register("policy_number")}
                  id="policy_number"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm uppercase placeholder:normal-case shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. POL-123456"
                />
                {errors.policy_number && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.policy_number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="insurance_company_id" className="text-sm font-medium leading-none">
                  Insurance Company ID
                </label>
                <input
                  {...register("insurance_company_id")}
                  id="insurance_company_id"
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Optional"
                />
                {errors.insurance_company_id && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.insurance_company_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium leading-none">
                  Start Date
                </label>
                <input
                  {...register("start_date")}
                  id="start_date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {errors.start_date && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="expiry_date" className="text-sm font-medium leading-none">
                  Expiry Date *
                </label>
                <input
                  {...register("expiry_date")}
                  id="expiry_date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {errors.expiry_date && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.expiry_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="premium_amount" className="text-sm font-medium leading-none">
                  Premium Amount (₹)
                </label>
                <input
                  {...register("premium_amount")}
                  id="premium_amount"
                  type="number"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. 5000"
                />
                {errors.premium_amount && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.premium_amount.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 flex flex-col justify-center">
                <label className="flex items-center space-x-2 text-sm font-medium leading-none mt-6">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Policy is Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Insurance Policy
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
