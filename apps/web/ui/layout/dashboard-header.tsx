"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnalyticsFiltersHeader } from "@/ui/analytics/analytics-filters-header";
import { QRHeaderControls } from "@/ui/layout/qr-header-controls";
import { usePathname } from "next/navigation";
import { cn } from "@dub/utils";
import { Session } from "@/lib/auth/utils";

interface DashboardHeaderProps {
  user?: Session["user"];
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const isAnalyticsPage = pathname?.endsWith("/analytics");
  const isQRCodesPage = pathname?.match(/\/[^/]+$/) && !pathname?.includes("/analytics") && !pathname?.includes("/settings") && !pathname?.includes("/account");

  return (
    <>
      {/* Title section - Above header */}
      <div className="mb-4 flex items-center gap-3">
        <SidebarTrigger className="text-secondary hover:bg-secondary/10 [&_svg]:!size-5" />
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
        "bg-card mb-6 rounded-[20px] border border-border px-4 shadow-sm sm:px-6",
        "[&_*]:no-underline"
      )}>
        <div className="flex w-full min-h-16 flex-col gap-3 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
          {/* Filters/Controls */}
          {isAnalyticsPage && (
            <div className="flex w-full items-center gap-2">
              <AnalyticsFiltersHeader />
            </div>
          )}
          {isQRCodesPage && user && (
            <div className="flex w-full items-center gap-2 md:w-auto">
              <QRHeaderControls user={user} />
            </div>
          )}
        </div>
      </header>
    </>
  );
}

