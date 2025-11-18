"use client";
import { cn } from "@dub/utils";
/* 
  This Analytics component lives in 2 different places:
  1. Workspace analytics page, e.g. app.dub.co/dub/analytics
  2. Public stats page, e.g. dub.sh/stats/github, stey.me/stats/weathergpt
*/

import useWorkspace from "@/lib/swr/use-workspace";
import { useContext, useState } from "react";
import AnalyticsProvider, {
  AnalyticsContext,
  AnalyticsDashboardProps,
} from "./analytics-provider";
import Devices from "./devices";
import Locations from "./locations";
import Main from "./main";
import Toggle from "./toggle";
import TopLinks from "./top-links";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Hyperlink, FlagWavy, OfficeBuilding, LocationPin, MapPosition, MobilePhone, Window, Cube, CursorRays, Sliders } from "@dub/ui/icons";
import { AnalyticsFiltersList } from "./analytics-filters-list";

const topLinksTabs = [
  { name: "QR Name", value: "links" as const, icon: Globe },
  { name: "Destination URLs", value: "urls" as const, icon: Hyperlink },
  { name: "QR Type", value: "qrType" as const, icon: Sliders },
];

const locationsTabs = [
  { name: "Countries", value: "countries" as const, icon: FlagWavy },
  { name: "Cities", value: "cities" as const, icon: OfficeBuilding },
  { name: "Regions", value: "regions" as const, icon: LocationPin },
  { name: "Continents", value: "continents" as const, icon: MapPosition },
];

const devicesTabs = [
  { name: "Devices", value: "devices" as const, icon: MobilePhone },
  { name: "Browsers", value: "browsers" as const, icon: Window },
  { name: "OS", value: "os" as const, icon: Cube },
  { name: "Triggers", value: "triggers" as const, icon: CursorRays },
];


export default function Analytics({
  adminPage,
  demoPage,
  dashboardProps,
}: {
  adminPage?: boolean;
  demoPage?: boolean;
  dashboardProps?: AnalyticsDashboardProps;
}) {
  return (
    <AnalyticsProvider {...{ adminPage, demoPage, dashboardProps }}>
      <AnalyticsContext.Consumer>
        {({ dashboardProps }) => {
          return (
            <div
              className={cn( dashboardProps && "bg-neutral-50")}
            >
              <Toggle />
              <AnalyticsFiltersList />
              <div className="mx-auto grid w-full gap-5">
                <Main />
                <StatsGrid />
              </div>
            </div>
          );
        }}
      </AnalyticsContext.Consumer>
    </AnalyticsProvider>
  );
}

function StatsGrid() {
  const { dashboardProps, partnerPage, selectedTab, view } =
    useContext(AnalyticsContext);
  const { plan } = useWorkspace();

  const [topLinksTab, setTopLinksTab] = useState<"links" | "urls" | "qrType">("links");
  const [locationsTab, setLocationsTab] = useState<"countries" | "cities" | "regions" | "continents">("countries");
  const [devicesTab, setDevicesTab] = useState<"devices" | "browsers" | "os" | "triggers">("devices");
  
  const [topLinksView, setTopLinksView] = useState<"pie" | "list">("pie");
  const [locationsView, setLocationsView] = useState<"pie" | "list">("pie");
  const [devicesView, setDevicesView] = useState<"pie" | "list">("pie");

  const hide =
    (selectedTab === "leads" || selectedTab === "sales" || view === "funnel") &&
    (plan === "free" || plan === "pro");

 
  return hide ? null : (
    <div className="space-y-5">
      {/* Tabs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* TopLinks Tabs */}
        {!dashboardProps && (
          <div>
            <Tabs value={topLinksTab} onValueChange={(v) => setTopLinksTab(v as typeof topLinksTab)} className="gap-4">
              <TabsList className="bg-white rounded-none border-b p-0 w-max">
                {topLinksTabs.map(({ name, value }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="bg-white data-[state=active]:bg-white data-[state=active]:border-secondary data-[state=active]:text-secondary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none text-xs sm:text-sm"
                  >
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Locations Tabs */}
        <div>
          <Tabs value={locationsTab} onValueChange={(v) => setLocationsTab(v as typeof locationsTab)} className="gap-4">
            <TabsList className="bg-white rounded-none border-b p-0 w-max">
              {locationsTabs.map(({ name, value }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="bg-white data-[state=active]:bg-white data-[state=active]:border-secondary data-[state=active]:text-secondary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none text-xs sm:text-sm"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Devices Tabs */}
        <div>
          <Tabs value={devicesTab} onValueChange={(v) => setDevicesTab(v as typeof devicesTab)} className="gap-4">
            <TabsList className="bg-white rounded-none border-b p-0 w-max">
              {devicesTabs.map(({ name, value }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="bg-white data-[state=active]:bg-white data-[state=active]:border-secondary data-[state=active]:text-secondary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none text-xs sm:text-sm"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full items-start">
        {!dashboardProps && <TopLinks tab={topLinksTab} view={topLinksView} onViewChange={setTopLinksView} />}
        <Locations tab={locationsTab} view={locationsView} onViewChange={setLocationsView} />
        <Devices tab={devicesTab} view={devicesView} onViewChange={setDevicesView} />
      </div>
    </div>
  );
}
