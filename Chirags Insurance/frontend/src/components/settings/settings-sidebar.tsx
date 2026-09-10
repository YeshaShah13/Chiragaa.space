"use client";

import { 
  Building2, 
  Car, 
  Receipt, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Bell, 
  Palette, 
  Lock, 
  Database 
} from "lucide-react";
import { SettingsTab } from "@/app/settings/page";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const navItems = [
  { id: "general", label: "General", icon: Building2 },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "tax", label: "Tax & Compliance", icon: Receipt },
  { id: "insurance", label: "Insurance", icon: ShieldCheck },
  { id: "rto", label: "RTO / Office", icon: MapPin },
  { id: "documents", label: "Documents & Reports", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Lock },
  { id: "data", label: "Data & Backup", icon: Database },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as SettingsTab)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all whitespace-nowrap lg:whitespace-normal
              ${isActive 
                ? "bg-[#111111] text-white shadow-sm" 
                : "text-[#777777] hover:bg-[#F5F5F5] hover:text-[#111111]"
              }
            `}
          >
            <Icon 
              className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-[#A0A0A0]"}`} 
              strokeWidth={1.5} 
            />
            <span className="text-[15px] font-medium tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
