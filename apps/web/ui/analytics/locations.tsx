import { SINGULAR_ANALYTICS_ENDPOINTS } from "@/lib/analytics/constants";
import { Modal, useRouterStuff } from "@dub/ui";
import {
  FlagWavy,
  LocationPin,
  MapPosition,
  OfficeBuilding,
} from "@dub/ui/icons";
import { X } from "@/ui/shared/icons";
import { CONTINENTS, COUNTRIES, REGIONS } from "@dub/utils";
import { useContext, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import AnalyticsPieChartWithLists from "./analytics-pie-chart-with-lists";
import ContinentIcon from "./continent-icon";
import { useAnalyticsFilterOption } from "./utils";

const tabs = [
  { name: "Countries", value: "countries" as const, icon: FlagWavy },
  { name: "Cities", value: "cities" as const, icon: OfficeBuilding },
  { name: "Regions", value: "regions" as const, icon: LocationPin },
  { name: "Continents", value: "continents" as const, icon: MapPosition },
];

const EXPAND_LIMIT = 8;

export default function Locations() {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [tab, setTab] = useState<
    "countries" | "cities" | "continents" | "regions"
  >("countries");
  const [showModal, setShowModal] = useState(false);

  // Fetch data for each tab
  const { data: countriesData } = useAnalyticsFilterOption("countries");
  const { data: citiesData } = useAnalyticsFilterOption("cities");
  const { data: regionsData } = useAnalyticsFilterOption("regions");
  const { data: continentsData } = useAnalyticsFilterOption("continents");
  
  // Get data for current tab
  const data = tab === "countries" ? countriesData 
    : tab === "cities" ? citiesData
    : tab === "regions" ? regionsData
    : continentsData;
  
  const selectedTabData = tabs.find(t => t.value === tab) || tabs[0];
  const hasMore = (data?.length ?? 0) > EXPAND_LIMIT;

  const getBarListData = (tabValue: typeof tab) => {
    const tabData = tabValue === "countries" ? countriesData 
      : tabValue === "cities" ? citiesData
      : tabValue === "regions" ? regionsData
      : continentsData;
    const singularTabName = SINGULAR_ANALYTICS_ENDPOINTS[tabValue];
    
    return tabData
      ?.map((d) => ({
        icon:
          tabValue === "continents" ? (
            <ContinentIcon
              display={d.continent}
              className="size-3"
            />
          ) : (
            <img
              alt={d.country}
              src={`https://flag.vercel.app/m/${d.country}.svg`}
              className="h-3 w-5"
            />
          ),
        title:
          tabValue === "continents"
            ? CONTINENTS[d.continent]
            : tabValue === "countries"
              ? COUNTRIES[d.country]
              : tabValue === "regions"
                ? REGIONS[d.region] || d.region.split("-")[1]
                : d.city,
        href: queryParams({
          ...(searchParams.has(singularTabName)
            ? { del: singularTabName }
            : {
                set: {
                  [singularTabName]: d[singularTabName],
                },
              }),
          getNewPath: true,
        }) as string,
        value: d[dataKey] || 0,
      }))
      ?.sort((a, b) => b.value - a.value) || [];
  };

  return (
    <>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-lg px-0"
      >
        <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
          <h1 className="text-lg font-semibold">{selectedTabData.name}</h1>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="active:bg-border-500 group relative -right-2 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:right-0 md:block"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {data && data.length > 0 && (
          <AnalyticsPieChartWithLists
            data={getBarListData(tab)}
            unit={selectedTab}
            maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
            showName={true}
          />
        )}
      </Modal>

      <Card className="gap-4 pt-6">
        <CardContent className="relative px-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
            <div className="mb-6">
              <TabsList className="bg-background gap-1 border p-1">
                {tabs.map(({ icon: Icon, name, value }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex items-center gap-1.5 data-[state=active]:bg-secondary dark:data-[state=active]:bg-secondary data-[state=active]:text-white dark:data-[state=active]:text-white dark:data-[state=active]:border-transparent"
                  >
                    <Icon className="h-4 w-4" />
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tabItem) => {
              const tabData = tabItem.value === "countries" ? countriesData 
                : tabItem.value === "cities" ? citiesData
                : tabItem.value === "regions" ? regionsData
                : continentsData;
              const tabMaxValue = Math.max(...(tabData?.map((d) => d[dataKey] ?? 0) ?? [0]));
              
              return (
                <TabsContent key={tabItem.value} value={tabItem.value}>
                  {tabData ? (
                    tabData.length > 0 ? (
                      <AnalyticsPieChartWithLists
                        data={getBarListData(tabItem.value)}
                        unit={selectedTab}
                        maxValue={tabMaxValue}
                        limit={EXPAND_LIMIT}
                        showName={true}
                      />
                    ) : (
                      <div className="flex h-[300px] items-center justify-center">
                        <p className="text-sm text-neutral-600">No data available</p>
                      </div>
                    )
                  ) : (
                    <div className="flex h-[300px] items-center justify-center">
                      <AnalyticsLoadingSpinner />
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="px-6">
            {hasMore && (
              <div className="relative z-10 flex w-full items-end pb-4 pt-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="group relative flex w-full items-center justify-center"
                >
                  <div className="border-border-500 rounded-md border bg-white px-2.5 py-1 text-sm text-neutral-950 group-hover:bg-neutral-100 group-active:border-neutral-300">
                    View All
                  </div>
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
