"use client";

import { Vehicle } from "@/types/vehicle";
import { Car, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface FitnessKpiCardsProps {
  vehicles?: Vehicle[];
}

export function FitnessKpiCards({ vehicles = [] }: FitnessKpiCardsProps) {
  const { data: statsData } = useQuery({
    queryKey: ["compliance-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/compliance/stats");
      return res.data.data;
    },
    staleTime: 1000 * 60,
  });

  const fitnessStats = statsData?.fitness;

  const total = fitnessStats ? fitnessStats.total : vehicles.length;
  const active = fitnessStats ? fitnessStats.active : vehicles.filter(v => v.fitness_status === 'ACTIVE').length;
  const expiringSoon = fitnessStats ? fitnessStats.expiring_soon : vehicles.filter(v => v.fitness_status === 'EXPIRING_SOON').length;
  const expired = fitnessStats ? fitnessStats.expired : vehicles.filter(v => v.fitness_status === 'EXPIRED').length;
  const notAvailable = fitnessStats ? fitnessStats.not_available : vehicles.filter(v => v.fitness_status === 'NOT_AVAILABLE' || !v.fitness_status).length;

  const cards = [
    {
      title: "Total Vehicles",
      value: total.toLocaleString("en-IN"),
      icon: Car,
      subtitle: "Total registered in system"
    },
    {
      title: "Fit / Active",
      value: active.toLocaleString("en-IN"),
      icon: CheckCircle2,
      subtitle: "Fitness up to date"
    },
    {
      title: "Expiring Soon",
      value: expiringSoon.toLocaleString("en-IN"),
      icon: AlertTriangle,
      subtitle: "Expires in < 30 days"
    },
    {
      title: "Expired",
      value: expired.toLocaleString("en-IN"),
      icon: XCircle,
      subtitle: "Validity period ended"
    },
    {
      title: "Not Available",
      value: notAvailable.toLocaleString("en-IN"),
      icon: HelpCircle,
      subtitle: "Missing fitness info"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="group relative overflow-hidden rounded-[12px] border border-[#E5E5E5] bg-white p-3.5 sm:p-4 transition-all hover:border-[#A0A0A0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-[#444444] truncate">{card.title}</p>
            <card.icon className="h-4 w-4 text-[#888888] shrink-0 transition-colors group-hover:text-[#111111]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] sm:text-[22px] font-bold text-[#111111] leading-tight tracking-tight truncate">{card.value}</span>
            <span className="mt-1 text-[11px] text-[#777777] truncate">{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
