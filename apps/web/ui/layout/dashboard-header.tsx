"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnalyticsFiltersHeader } from "@/ui/analytics/analytics-filters-header";
import { QRHeaderControls } from "@/ui/layout/qr-header-controls";
import { usePathname } from "next/navigation";
import { cn } from "@dub/utils";
import { Session } from "@/lib/auth/utils";
import { QrCode, BarChart3, UserIcon, WalletIcon, CreditCardIcon } from "lucide-react";

interface DashboardHeaderProps {
  user?: Session["user"];
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const isAnalyticsPage = pathname?.endsWith("/analytics");
  const isQRCodesPage = pathname?.match(/\/[^/]+$/) && !pathname?.includes("/analytics") && !pathname?.includes("/settings") && !pathname?.includes("/account");
  const isAccountSettingsPage = pathname?.includes("/account/settings");
  const isAccountPlansPage = pathname?.includes("/account/plans");
  const isAccountBillingPage = pathname?.includes("/account/billing");

  // Determine which icon to show
  const getPageIcon = () => {
    if (isAnalyticsPage) return BarChart3;
    if (isAccountSettingsPage) return UserIcon;
    if (isAccountPlansPage) return WalletIcon;
    if (isAccountBillingPage) return CreditCardIcon;
    if (isQRCodesPage) return QrCode;
    return QrCode; // Default icon
  };

  return (
    <>
      {/* Title section - Above header */}
      <div className="mb-4 flex items-center gap-3">
        <SidebarTrigger 
          icon={getPageIcon()}
          asPageIcon={true}
          className="text-secondary [&_svg]:!size-5" 
        />
        {isAnalyticsPage && (
          <h1 className="text-lg font-semibold text-neutral-900">
            Statistics
          </h1>
        )}
        {isQRCodesPage && (
          <h1 className="text-lg font-semibold text-neutral-900">
            My QR Codes
          </h1>
        )}
      </div>

      {/* Header with controls */}
      <header className={cn(
        "bg-card rounded-[20px] shadow px-4 sm:px-6",
        "[&_*]:no-underline"
      )}>
        <div className="flex w-full min-h-16 flex-col gap-3 py-3 md:h-16 md:flex-row md:items-center md:gap-4 md:py-0">
          {/* Filters/Controls */}
          {isAnalyticsPage && (
            <div className="flex w-full items-center gap-2">
              <AnalyticsFiltersHeader />
            </div>
          )}
          {isQRCodesPage && user && (
            <div className="flex w-full items-center gap-2">
              <QRHeaderControls user={user} />
            </div>
          )}
        </div>
      </header>
    </>
  );
}

