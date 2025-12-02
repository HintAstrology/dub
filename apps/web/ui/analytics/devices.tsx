import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SINGULAR_ANALYTICS_ENDPOINTS,
  TRIGGER_DISPLAY,
} from "@/lib/analytics/constants";
import { DeviceTabs } from "@/lib/analytics/types";
import { X } from "@/ui/shared/icons";
import { Modal, useRouterStuff } from "@dub/ui";
import { Cube, CursorRays, MobilePhone, Window } from "@dub/ui/icons";
import { cn, nFormatter } from "@dub/utils";
import { ChartBar, PieChartIcon, Search } from "lucide-react";
import { useContext, useState } from "react";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import DeviceIcon from "./components/device-icon";
import AnalyticsPieChartWithLists from "./pie-charts/analytics-pie-chart-with-lists";
import { BarChartWithList } from "./bar-charts";
import { useAnalyticsFilterOption } from "./utils";

const tabs = [
  { name: "Devices", value: "devices" as const, icon: MobilePhone },
  { name: "Browsers", value: "browsers" as const, icon: Window },
  { name: "OS", value: "os" as const, icon: Cube },
  // { name: "Triggers", value: "triggers" as const, icon: CursorRays },
];

const EXPAND_LIMIT = 8;

export default function Devices() {
  const [tab, setTab] = useState<DeviceTabs>("devices");
  const [view, setView] = useState<"pie" | "list">("pie");
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit, totalEvents } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch data for each tab
  const { data: devicesData, loading: devicesLoading } =
    useAnalyticsFilterOption("devices");
  const { data: browsersData, loading: browsersLoading } =
    useAnalyticsFilterOption("browsers");
  const { data: osData, loading: osLoading } = useAnalyticsFilterOption("os");
  const { data: triggersData, loading: triggersLoading } =
    useAnalyticsFilterOption("triggers");

  // Get data for current tab
  const data =
    tab === "devices"
      ? devicesData
      : tab === "browsers"
        ? browsersData
        : tab === "os"
          ? osData
          : triggersData;

  const selectedTabData = tabs.find((t) => t.value === tab) || tabs[0];

  const getBarListData = (tabValue: DeviceTabs) => {
    const tabData =
      tabValue === "devices"
        ? devicesData
        : tabValue === "browsers"
          ? browsersData
          : tabValue === "os"
            ? osData
            : triggersData;
    const singularTabName = SINGULAR_ANALYTICS_ENDPOINTS[tabValue];

    return (
      tabData
        ?.map((d) => ({
          icon: (
            <DeviceIcon
              display={d[singularTabName]}
              tab={tabValue}
              className="h-4 w-4"
            />
          ),
          title:
            tabValue === "triggers"
              ? TRIGGER_DISPLAY[d.trigger]
              : d[singularTabName],
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
        ?.sort((a, b) => b.value - a.value) || []
    );
  };

  return (
    <>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-[500px] px-0"
      >
        <div className="flex w-full items-center justify-between gap-2 border-b px-6 py-4">
          <h1 className="text-lg font-semibold">{selectedTabData.name}</h1>
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setSearch("");
            }}
            className="active:bg-border-500 group relative -right-2 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:right-0 md:block"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative border-b px-6 py-3">
          <div className="pointer-events-none absolute inset-y-0 left-9 flex items-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            autoFocus
            className="w-full rounded-md border border-neutral-300 py-2 pl-10 pr-4 text-black placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-4 focus:ring-neutral-200 sm:text-sm"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {data && data.length > 0 && (
          <div className="h-[400px] overflow-auto p-4">
            <div className="space-y-2">
              {getBarListData(tab)
                .filter((item) =>
                  search
                    ? item.title.toLowerCase().includes(search.toLowerCase())
                    : true,
                )
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-lg bg-neutral-100 px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="shrink-0">{item.icon}</div>
                      <span className="truncate text-sm font-medium text-neutral-900">
                        {item.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-neutral-900">
                      {nFormatter(item.value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-col gap-4">
        {/* Devices Tabs */}
        <div>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
            className="gap-4"
          >
            <TabsList className="w-max rounded-none border-b bg-white p-0">
              {tabs.map(({ name, value }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:border-secondary data-[state=active]:text-secondary h-full rounded-none border-0 border-b-2 border-transparent bg-white text-xs data-[state=active]:bg-white data-[state=active]:shadow-none sm:text-sm"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Card className="h-[442px] gap-4 overflow-hidden pt-4 rounded-[20px]">
          <CardContent className="p-4 pt-0 relative h-full overflow-hidden px-4">
            {data ? (
              data.length > 0 ? (
                <>
                  {view === "list" ? (
                    <>
                      {/* Controls for Bar Chart - Top */}
                      <div className="mb-4 flex justify-end gap-3">
                        <div className="flex gap-1 rounded-lg border p-1">
                          <button
                            onClick={() => setView("pie")}
                            className={cn(
                              "rounded p-2 transition-colors",
                              // @ts-ignore
                              view === "pie"
                                ? "bg-secondary text-white"
                                : "hover:bg-gray-100",
                            )}
                          >
                            <PieChartIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setView("list")}
                            className={cn(
                              "rounded p-2 transition-colors",
                              view === "list"
                                ? "bg-secondary text-white"
                                : "hover:bg-gray-100",
                            )}
                          >
                            <ChartBar className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <BarChartWithList
                        data={getBarListData(tab)}
                        unit={selectedTab}
                        maxValue={Math.max(
                          ...(data?.map((d) => d[dataKey] ?? 0) ?? [0]),
                        )}
                        limit={EXPAND_LIMIT}
                        onViewAll={() => setShowModal(true)}
                        renderIcon={(iconElement) => iconElement}
                      />
                    </>
                  ) : (
                    <AnalyticsPieChartWithLists
                      data={getBarListData(tab)}
                      unit={selectedTab}
                      onViewAll={() => setShowModal(true)}
                      maxValue={Math.max(
                        ...(data?.map((d) => d[dataKey] ?? 0) ?? [0]),
                      )}
                      limit={EXPAND_LIMIT}
                      showName={false}
                      totalCount={totalEvents?.[selectedTab]}
                      controls={
                        <div className="flex gap-3">
                          <div className="flex gap-1 rounded-lg border p-1">
                            <button
                              onClick={() => setView("pie")}
                              className={cn(
                                "rounded p-2 transition-colors",
                                view === "pie"
                                  ? "bg-secondary text-white"
                                  : "hover:bg-gray-100",
                              )}
                            >
                              <PieChartIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setView("list")}
                              className={cn(
                                "rounded p-2 transition-colors",
                                // @ts-ignore
                                view === "list"
                                  ? "bg-secondary text-white"
                                  : "hover:bg-gray-100",
                              )}
                            >
                              <ChartBar className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      }
                    />
                  )}
                </>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
