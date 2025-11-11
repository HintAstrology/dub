"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnalyticsFiltersHeader } from "@/ui/analytics/analytics-filters-header";
import { usePathname } from "next/navigation";
import { cn } from "@dub/utils";

export function DashboardHeader() {
  const pathname = usePathname();
  const isAnalyticsPage = pathname?.endsWith("/analytics");

  return (
    <header className={cn(
      "bg-card mb-6 rounded-[20px] border border-border px-4 shadow-sm sm:px-6",
      "[&_*]:no-underline"
    )}>
      <div className="flex min-h-16 flex-col gap-3 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
        {/* Left side - Title/Breadcrumb */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-secondary hover:bg-secondary/10 [&_svg]:!size-5" />
          {isAnalyticsPage && (
            <h1 className="text-lg font-semibold text-neutral-900">
              Statistics
            </h1>
          )}
        </div>

        {/* Right side - Filters */}
        {isAnalyticsPage && (
          <div className="flex w-full items-center gap-2 md:w-auto">
            <AnalyticsFiltersHeader />
          </div>
        )}
      </div>
    </header>
  );
}

