import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { SINGULAR_ANALYTICS_ENDPOINTS } from "@/lib/analytics/constants";
import { X } from "@/ui/shared/icons";
import { Modal, useRouterStuff } from "@dub/ui";
import { FlagWavy, MapPosition, OfficeBuilding } from "@dub/ui/icons";
import { CONTINENTS, COUNTRIES, cn, nFormatter } from "@dub/utils";
import { ChartBar, PieChartIcon, Search } from "lucide-react";
import React, { useContext, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import AnalyticsPieChartWithLists from "./analytics-pie-chart-with-lists";
import { AnalyticsContext } from "./analytics-provider";
import { ChartTooltipWithCopy } from "./chart-tooltip-with-copy";
import ContinentIcon from "./continent-icon";
import { useAnalyticsFilterOption } from "./utils";

const tabs = [
  { name: "Countries", value: "countries" as const, icon: FlagWavy },
  { name: "Cities", value: "cities" as const, icon: OfficeBuilding },
  // { name: "Regions", value: "regions" as const, icon: LocationPin },
  { name: "Continents", value: "continents" as const, icon: MapPosition },
];

const EXPAND_LIMIT = 8;

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

interface LocationsBarChartProps {
  data: Array<{
    icon: React.ReactNode;
    title: string;
    href?: string;
    value: number;
  }>;
  maxValue: number;
  unit: string;
  limit?: number;
  tab?: string;
  onViewAll?: () => void;
}

function LocationsBarChart({
  data,
  maxValue,
  unit,
  limit = 6,
  tab,
  onViewAll,
}: LocationsBarChartProps) {
  const { saleUnit } = useContext(AnalyticsContext);
  const [isContainerHovered, setIsContainerHovered] = useState(false);

  const formatValue = (value: number) => {
    if (unit === "sales" && saleUnit === "saleAmount") {
      return `$${nFormatter(value / 100)}`;
    }
    return nFormatter(value);
  };

  const formatPercentage = (value: number) => {
    return maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  };

  const displayData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return sorted.slice(0, limit);
  }, [data, limit]);

  // Limit visible bars
  const MAX_VISIBLE_BARS = 5;
  const visibleBarsData = useMemo(() => {
    return displayData.slice(0, MAX_VISIBLE_BARS);
  }, [displayData]);

  const displayTotalValue = useMemo(() => {
    return visibleBarsData.reduce((sum, item) => sum + item.value, 0);
  }, [visibleBarsData]);

  const chartData = useMemo(() => {
    return visibleBarsData.map((item, index) => {
      return {
        sr: visibleBarsData.length - index,
        service:
          item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
        sales:
          displayTotalValue > 0
            ? Math.round((item.value / displayTotalValue) * 100)
            : 0,
        fill: chartColors[index % chartColors.length],
        icon: item.icon,
        title: item.title,
        value: item.value,
      };
    });
  }, [visibleBarsData, displayTotalValue]);

  const chartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  const needsFade = displayData.length > MAX_VISIBLE_BARS;
  const hasMore = data.length > MAX_VISIBLE_BARS;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => setIsContainerHovered(false)}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[350px_1fr] overflow-hidden">
        <div className="relative flex h-fit min-w-0 items-center justify-center overflow-hidden w-full">
          <ChartContainer
            config={chartConfig}
            className={"h-[300px] min-h-[300px] w-full -ml-10 min-w-[350px]"}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              barSize={24}
              barCategoryGap={4}
              margin={{
                top: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                dataKey="sales"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                dataKey="sr"
                type="category"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                width={30}
                tick={false}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipWithCopy
                        color={data.fill}
                        name={data.title}
                        value={formatValue(data.value)}
                        percentage={data.sales}
                        copyValue={data.title}
                        showCopy={false}
                        active={active}
                      />
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="sales" radius={[0, 10, 10, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="title"
                  position="top"
                  fill="hsl(var(--muted-foreground))"
                  className="text-xs"
                  offset={5}
                  content={(props: any) => {
                    if (!props) return null;
                    const { x, y, value, payload } = props;
                    // Use payload.sr to find the correct entry (most reliable)
                    const dataEntry = chartData.find(
                      (d) =>
                        d.sr === payload?.sr ||
                        d.title === (value || payload?.title),
                    );
                    const displayTitle =
                      value || payload?.title || dataEntry?.title || "";

                    // Position label above the bar
                    const labelY = y - 15; // offset above the bar

                    const iconElement = dataEntry?.icon;
                    let iconToRender: React.ReactNode = null;

                    // Don't show icons for continents tab
                    if (tab !== "continents") {
                      if (
                        iconElement &&
                        typeof iconElement === "object" &&
                        "props" in iconElement
                      ) {
                        const iconProps = (iconElement as any).props;
                        if (iconProps?.src) {
                          iconToRender = (
                            <img
                              alt={iconProps.alt || displayTitle}
                              src={iconProps.src}
                              className="h-3"
                            />
                          );
                        }
                      }
                    }

                    return (
                      <foreignObject
                        x={x}
                        y={labelY}
                        width={200}
                        height={24}
                      >
                        <div className="flex items-center gap-1.5">
                          {iconToRender && (
                            <div className="shrink-0">{iconToRender}</div>
                          )}
                          <span className="text-muted-foreground truncate text-xs">
                            {displayTitle}
                          </span>
                        </div>
                      </foreignObject>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <div className="min-w-0 h-full -mt-1">
          <div className="mb-3 flex justify-end">
            <h3 className="text-base font-semibold text-black">Scans</h3>
          </div>
          <div className={`flex flex-col ${visibleBarsData.length === 1 ? 'justify-center' : 'justify-between'} h-[calc(100%-90px)]`}>
            {visibleBarsData.map((item, index) => {
              const formattedValue = formatValue(item.value);
              const dataEntry = chartData.find((d) => d.title === item.title);
              const color =
                dataEntry?.fill || chartColors[index % chartColors.length];
              return (
                <div
                  key={index}
                  className={`flex items-center ${visibleBarsData.length === 1 ? 'justify-center' : 'justify-end'} gap-2`}
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground whitespace-nowrap text-sm font-semibold">
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* View All Button */}
      {hasMore && isContainerHovered && (
        <div className="mt-4 flex justify-center transition-opacity duration-200">
          <button
            onClick={onViewAll}
            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-neutral-950 shadow-sm hover:bg-neutral-50 active:bg-neutral-100"
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
}

export default function Locations({
  tab,
  view,
  onViewChange,
}: {
  tab: "countries" | "cities" | "regions" | "continents";
  view: "pie" | "list";
  onViewChange: (view: "pie" | "list") => void;
}) {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch data for each tab
  const { data: countriesData } = useAnalyticsFilterOption("countries");
  const { data: citiesData } = useAnalyticsFilterOption("cities");
  // const { data: regionsData } = useAnalyticsFilterOption("regions");
  const { data: continentsData } = useAnalyticsFilterOption("continents");

  // Get data for current tab
  const data =
    tab === "countries"
      ? countriesData
      : tab === "cities"
        ? citiesData
        // : tab === "regions"
        //   ? regionsData
          : continentsData;

  const selectedTabData = tabs.find((t) => t.value === tab) || tabs[0];

  const getBarListData = (tabValue: typeof tab) => {
    const tabData =
      tabValue === "countries"
        ? countriesData
        : tabValue === "cities"
          ? citiesData
          // : tabValue === "regions"
          //   ? regionsData
            : continentsData;
    const singularTabName = SINGULAR_ANALYTICS_ENDPOINTS[tabValue];

    return (
      tabData
        ?.map((d) => {
          return {
            icon:
              tabValue === "continents" ? (
                <ContinentIcon display={d.continent} className="size-2" />
              ) : (
                <img
                  alt={d.country}
                  src={`https://flag.vercel.app/m/${d.country}.svg`}
                  className="h-3"
                />
              ),
            title:
              tabValue === "continents"
                ? CONTINENTS[d.continent]
                : tabValue === "countries"
                  ? COUNTRIES[d.country] ||
                  // : tabValue === "regions"
                    // ? REGIONS[d.region] ||
                      d.region.split("-")[1] || COUNTRIES[d.country] || d.region
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
          };
        })
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

      <Card className="h-[442px] gap-4 overflow-hidden pt-6">
        <CardContent className="relative h-full overflow-hidden px-4">
          {data ? (
            data.length > 0 ? (
              <>
                {view === "list" ? (
                  <>
                    {/* Controls for Bar Chart - Top */}
                    <div className="mb-4 flex justify-end gap-3">
                      <div className="flex gap-1 rounded-lg border p-1">
                        <button
                          onClick={() => onViewChange("pie")}
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
                          onClick={() => onViewChange("list")}
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
                    <LocationsBarChart
                      data={getBarListData(tab)}
                      unit={selectedTab}
                      maxValue={Math.max(
                        ...(data?.map((d) => d[dataKey] ?? 0) ?? [0]),
                      )}
                      limit={EXPAND_LIMIT}
                      tab={tab}
                      onViewAll={() => setShowModal(true)}
                    />
                  </>
                ) : (
                  <AnalyticsPieChartWithLists
                    data={getBarListData(tab)}
                    unit={selectedTab}
                    maxValue={Math.max(
                      ...(data?.map((d) => d[dataKey] ?? 0) ?? [0]),
                    )}
                    limit={EXPAND_LIMIT}
                    showName={false}
                    onViewAll={() => setShowModal(true)}
                    controls={
                      <div className="flex gap-3">
                        <div className="flex gap-1 rounded-lg border p-1">
                          <button
                            onClick={() => onViewChange("pie")}
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
                            onClick={() => onViewChange("list")}
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
    </>
  );
}
