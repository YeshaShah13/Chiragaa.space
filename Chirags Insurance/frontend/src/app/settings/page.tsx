"use client";

import { useState } from "react";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { GeneralSettings } from "@/components/settings/tabs/general-settings";
import { VehicleSettings } from "@/components/settings/tabs/vehicle-settings";
import { TaxSettings } from "@/components/settings/tabs/tax-settings";
import { InsuranceSettings } from "@/components/settings/tabs/insurance-settings";
import { RtoSettings } from "@/components/settings/tabs/rto-settings";
import { DocumentSettings } from "@/components/settings/tabs/document-settings";
import { NotificationSettings } from "@/components/settings/tabs/notification-settings";
import { AppearanceSettings } from "@/components/settings/tabs/appearance-settings";
import { SecuritySettings } from "@/components/settings/tabs/security-settings";
import { DataBackupSettings } from "@/components/settings/tabs/data-backup-settings";
import { Settings } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";

export type SettingsTab = 
  | "general" 
  | "vehicle" 
  | "tax" 
  | "insurance" 
  | "rto" 
  | "documents" 
  | "notifications" 
  | "appearance" 
  | "security" 
  | "data";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general": return <GeneralSettings />;
      case "vehicle": return <VehicleSettings />;
      case "tax": return <TaxSettings />;
      case "insurance": return <InsuranceSettings />;
      case "rto": return <RtoSettings />;
      case "documents": return <DocumentSettings />;
      case "notifications": return <NotificationSettings />;
      case "appearance": return <AppearanceSettings />;
      case "security": return <SecuritySettings />;
      case "data": return <DataBackupSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <PermissionGuard permission="settings.view" showPageDenied>
      <div className="space-y-8 pb-12 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[36px] font-serif font-medium text-[#111111] tracking-tight flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#A0A0A0]" strokeWidth={2} />
              System Settings
            </h1>
            <p className="text-[18px] text-[#777777] mt-1 mb-4">
              Manage global application configuration and defaults.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-white border border-[#E5E5E5] rounded-[16px] shadow-sm min-w-0">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
