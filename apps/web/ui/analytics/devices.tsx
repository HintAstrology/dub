import {
  SINGULAR_ANALYTICS_ENDPOINTS,
  TRIGGER_DISPLAY,
} from "@/lib/analytics/constants";
import { DeviceTabs } from "@/lib/analytics/types";
import { Modal, useRouterStuff } from "@dub/ui";
import { Cube, CursorRays, MobilePhone, Window } from "@dub/ui/icons";
import { X } from "@/ui/shared/icons";
import { cn, nFormatter } from "@dub/utils";
import { useContext, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import AnalyticsPieChartWithLists from "./analytics-pie-chart-with-lists";
import DeviceIcon from "./device-icon";
import { useAnalyticsFilterOption } from "./utils";
import { PieChartIcon, ChartBar, Search } from "lucide-react";
import { ChartTooltipWithCopy } from "./chart-tooltip-with-copy";

const tabs = [
  { name: "Devices", value: "devices" as const, icon: MobilePhone },
  { name: "Browsers", value: "browsers" as const, icon: Window },
  { name: "OS", value: "os" as const, icon: Cube },
  { name: "Triggers", value: "triggers" as const, icon: CursorRays },
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

interface DevicesBarChartProps {
  data: Array<{
    icon: React.ReactNode;
    title: string;
    href?: string;
    value: number;
  }>;
  maxValue: number;
  unit: string;
  limit?: number;
  onViewAll?: () => void;
}

function DevicesBarChart({ data, maxValue, unit, limit = 6, onViewAll }: DevicesBarChartProps) {
  const { saleUnit } = useContext(AnalyticsContext);

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

  // Limit visible bars to maximum 5 (5th one will be transparent)
  const MAX_VISIBLE_BARS = 4;
  const SHOW_TRANSPARENT_BAR = displayData.length > MAX_VISIBLE_BARS;
  const visibleBarsData = useMemo(() => {
    // Show 5 items if there are more than 4, otherwise show all
    return displayData.slice(0, SHOW_TRANSPARENT_BAR ? MAX_VISIBLE_BARS + 1 : displayData.length);
  }, [displayData, SHOW_TRANSPARENT_BAR]);

  const displayTotalValue = useMemo(() => {
    return visibleBarsData.reduce((sum, item) => sum + item.value, 0);
  }, [visibleBarsData]);

  const chartData = useMemo(() => {
    return visibleBarsData
      .map((item, index) => {
        const isTransparent = SHOW_TRANSPARENT_BAR && index === MAX_VISIBLE_BARS;
        return {
          sr: visibleBarsData.length - index,
          service: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
          sales: displayTotalValue > 0 ? Math.round((item.value / displayTotalValue) * 100) : 0,
          fill: chartColors[index % chartColors.length],
          icon: item.icon,
          title: item.title,
          value: item.value,
          isTransparent,
        };
      });
  }, [visibleBarsData, displayTotalValue, SHOW_TRANSPARENT_BAR]);

  const chartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  const needsFade = displayData.length > MAX_VISIBLE_BARS;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] -mt-2 overflow-hidden items-start">
      <div className="pl-2 pr-6 py-6 min-w-0 overflow-hidden flex items-center justify-center relative h-fit">
        <ChartContainer config={chartConfig} className={needsFade ? "min-h-[300px] h-[300px] w-[320px]" : "h-[240px] w-[320px]"}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            barSize={24}
            barCategoryGap={4}
            margin={{
              top: 0,
              bottom: needsFade ? 10 : 0,
            }}
          >
            <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
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
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  opacity={entry.isTransparent ? 0.25 : 1}
                />
              ))}
              <LabelList
                dataKey="title"
                position="bottom"
                fill="hsl(var(--muted-foreground))"
                className="text-xs"
                offset={5}
                formatter={(value: string, entry: any) => {
                  const dataEntry = chartData.find((d) => d.title === value);
                  if (dataEntry?.isTransparent) {
                    return value ? `${value}...` : '';
                  }
                  return value;
                }}
                content={(props: any) => {
                  if (!props) return null;
                  const { x, y, width, height, value, payload } = props;
                  const dataEntry = chartData.find((d) => d.title === value);
                  const isTransparent = dataEntry?.isTransparent;
                  
                  // For vertical bar chart, position="bottom" means below the bar
                  // y is the top of the bar, so we add bar height + offset to place text below
                  // x is the left edge of the bar, so we use it for left alignment
                  const barHeight = height || 24;
                  const labelY = y + barHeight + 15; // 15px offset below the bar
                  
                  return (
                    <text
                      x={x}
                      y={labelY}
                      fill="hsl(var(--muted-foreground))"
                      textAnchor="start"
                      fontSize="12"
                      opacity={isTransparent ? 0.4 : 1}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
        {needsFade && onViewAll && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center h-max z-20 pointer-events-auto">
            <button
              onClick={onViewAll}
              className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-neutral-50 active:bg-neutral-100 shadow-sm"
            >
              View All
            </button>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="mb-3 flex justify-end">
          <h3 className="text-base font-semibold text-black">Scans</h3>
        </div>
        
        <div className="space-y-3">
          {visibleBarsData.map((item, index) => {
            const formattedValue = formatValue(item.value);
            const dataEntry = chartData.find((d) => d.title === item.title);
            const color = dataEntry?.fill || chartColors[index % chartColors.length];
            const isTransparent = dataEntry?.isTransparent || false;
            return (
              <div 
                key={index} 
                className="flex items-center justify-end gap-2"
                style={{ opacity: isTransparent ? 0.4 : 1 }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-foreground text-sm font-semibold whitespace-nowrap">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Devices({ 
  tab,
  view,
  onViewChange 
}: { 
  tab: DeviceTabs;
  view: "pie" | "list";
  onViewChange: (view: "pie" | "list") => void;
}) {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch data for each tab
  const { data: devicesData, loading: devicesLoading } = useAnalyticsFilterOption("devices");
  const { data: browsersData, loading: browsersLoading } = useAnalyticsFilterOption("browsers");
  const { data: osData, loading: osLoading } = useAnalyticsFilterOption("os");
  const { data: triggersData, loading: triggersLoading } = useAnalyticsFilterOption("triggers");
  
  // Get data for current tab
  const data = tab === "devices" ? devicesData 
    : tab === "browsers" ? browsersData
    : tab === "os" ? osData
    : triggersData;
  const loading = tab === "devices" ? devicesLoading 
    : tab === "browsers" ? browsersLoading
    : tab === "os" ? osLoading
    : triggersLoading;
  
  const selectedTabData = tabs.find(t => t.value === tab) || tabs[0];
  const hasMore = (data?.length ?? 0) > EXPAND_LIMIT;

  const getBarListData = (tabValue: DeviceTabs) => {
    const tabData = tabValue === "devices" ? devicesData 
      : tabValue === "browsers" ? browsersData
      : tabValue === "os" ? osData
      : triggersData;
    const singularTabName = SINGULAR_ANALYTICS_ENDPOINTS[tabValue];
    
    return tabData
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
      ?.sort((a, b) => b.value - a.value) || [];
  };

  return (
    <>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-[500px] px-0"
      >
        <div className="flex w-full items-center justify-between gap-2 px-6 py-4 border-b">
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
        <div className="relative px-6 py-3 border-b">
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
                    : true
                )
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 bg-neutral-100 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="shrink-0">{item.icon}</div>
                      <span className="text-sm font-medium text-neutral-900 truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 shrink-0">
                      {nFormatter(item.value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Modal>

      <Card className="gap-4 pt-6 overflow-hidden">
        <CardContent className="relative px-6 overflow-hidden">
          {/* View Toggle */}
          <div className="flex justify-start mb-4">
            <div className="flex gap-1 border rounded-lg p-1">
              <button
                onClick={() => onViewChange("pie")}
                className={cn(
                  "p-2 rounded transition-colors",
                  view === "pie" 
                    ? "bg-secondary text-white" 
                    : "hover:bg-gray-100"
                )}
              >
                <PieChartIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewChange("list")}
                className={cn(
                  "p-2 rounded transition-colors",
                  view === "list" 
                    ? "bg-secondary text-white" 
                    : "hover:bg-gray-100"
                )}
              >
                <ChartBar className="h-4 w-4" />
              </button>
            </div>
          </div>

          {data ? (
            data.length > 0 ? (
              <>
                {view === "list" ? (
                  <DevicesBarChart
                    data={getBarListData(tab)}
                    unit={selectedTab}
                    maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                    limit={EXPAND_LIMIT}
                    onViewAll={() => setShowModal(true)}
                  />
                        ) : (
                          <AnalyticsPieChartWithLists
                            data={getBarListData(tab)}
                            unit={selectedTab}
                            maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                            limit={EXPAND_LIMIT}
                            showName={false}
                            onViewAll={() => setShowModal(true)}
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
