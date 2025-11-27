"use client";

import useWorkspace from "@/lib/swr/use-workspace";
import { useContext } from "react";
import { AnalyticsContext } from "./analytics-provider";
import Devices from "./devices";
import Locations from "./locations";
import TopLinks from "./top-links";

export function StatsGrid() {
  const { dashboardProps, partnerPage, selectedTab, view } =
    useContext(AnalyticsContext);
  const { plan } = useWorkspace();

  const hide =
    (selectedTab === "leads" || selectedTab === "sales" || view === "funnel") &&
    (plan === "free" || plan === "pro");

 
  return hide ? null : (
    <div className="space-y-4 mb-4">
      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full items-start">
        {!dashboardProps && <TopLinks />}
        <Locations />
        <Devices />
      </div>
    </div>
  );
}

