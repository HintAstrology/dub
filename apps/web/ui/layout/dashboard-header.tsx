"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnalyticsFiltersHeader } from "@/ui/analytics/analytics-filters-header";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const pathname = usePathname();
  const isAnalyticsPage = pathname?.endsWith("/analytics");

  return (
    <header className="bg-card mb-6 flex flex-col gap-3 rounded-[20px] border border-border px-4 py-3.5 shadow-sm sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <SidebarTrigger className="text-secondary hover:bg-secondary/10 [&_svg]:!size-5" />
        {isAnalyticsPage && (
          <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">Statistics</h1>
        )}
      </div>
      {isAnalyticsPage && (
        <div className="flex w-full items-center gap-2 md:w-auto">
          <AnalyticsFiltersHeader />
        </div>
      )}
    </header>
  );
}

