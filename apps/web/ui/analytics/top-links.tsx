"use client";

import { LinkLogo, Modal, useRouterStuff } from "@dub/ui";
import { Globe, Hyperlink } from "@dub/ui/icons";
import { X } from "@/ui/shared/icons";
import { getApexDomain, nFormatter, cn } from "@dub/utils";
import { useContext, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import AnalyticsPieChartWithLists from "./analytics-pie-chart-with-lists";
import { useAnalyticsFilterOption } from "./utils";
import { ANALYTICS_QR_TYPES_DATA } from "../qr-builder-new/constants/get-qr-config";
import { Icon } from "@iconify/react";
import { PieChartIcon, ChartBar, Search } from "lucide-react";
import { ChartTooltipWithCopy } from "./chart-tooltip-with-copy";

const tabs = [
  {
    name: "QR Name",
    value: "links",
    icon: Globe,
  },
  {
    name: "Destination URLs",
    value: "urls",
    icon: Hyperlink,
  },
  {
    name: "QR Type",
    value: "qrType",
    icon: Globe,
  },
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

interface TopLinksBarChartProps {
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

function TopLinksBarChart({ data, maxValue, unit, limit = 6, onViewAll }: TopLinksBarChartProps) {
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
    return visibleBarsData
      .map((item, index) => {
        return {
          sr: visibleBarsData.length - index,
          service: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
          sales: displayTotalValue > 0 ? Math.round((item.value / displayTotalValue) * 100) : 0,
          fill: chartColors[index % chartColors.length],
          icon: item.icon,
          title: item.title,
          value: item.value,
          copyValue: item.copyValue,
        };
      });
  }, [visibleBarsData, displayTotalValue]);

  const chartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  const hasMore = data.length > MAX_VISIBLE_BARS;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => setIsContainerHovered(false)}
    >
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] -mt-2 overflow-hidden items-start">
      <div className="pl-2 pr-6 min-w-0 overflow-hidden flex items-center justify-center relative h-fit">
        <ChartContainer config={chartConfig} className="h-[300px] w-[320px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            barSize={24}
            barCategoryGap={4}
            margin={{
              top: 0,
              bottom: 0,
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
                      copyValue={data.copyValue || data.title}
                      showCopy={true}
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
                />
              ))}
              <LabelList
                dataKey="title"
                position="top"
                fill="hsl(var(--muted-foreground))"
                className="text-xs"
                offset={5}
                content={(props: any) => {
                  if (!props) return null;
                  const { x, y, value } = props;

                  // Position label above the bar
                  const labelY = y - 8; // 8px offset above the bar

                  return (
                    <text
                      x={x}
                      y={labelY}
                      fill="hsl(var(--muted-foreground))"
                      textAnchor="start"
                      fontSize="12"
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
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
            return (
              <div 
                key={index} 
                className="flex items-center justify-end gap-2"
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

export default function TopLinks({ 
  tab, 
  view, 
  onViewChange 
}: { 
  tab: "links" | "urls" | "qrType";
  view: "pie" | "list";
  onViewChange: (view: "pie" | "list") => void;
}) {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  
  // Fetch data for each tab
  const { data: linksData } = useAnalyticsFilterOption({
    groupBy: "top_links",
  });
  const { data: urlsData } = useAnalyticsFilterOption({
    groupBy: "top_urls",
  });
  
  // For QR Type, aggregate top_links data by qrType
  const qrTypeData = useMemo(() => {
    if (!linksData) return null;
    
    const qrTypeMap = new Map();
    linksData.forEach((link) => {
      const qrType = link.qr?.qrType || "unknown";
      const existing = qrTypeMap.get(qrType) || { qrType, [dataKey]: 0 };
      existing[dataKey] += link[dataKey] || 0;
      qrTypeMap.set(qrType, existing);
    });
    
    return Array.from(qrTypeMap.values());
  }, [linksData, dataKey]);
  
  // Get data for current tab
  const data = tab === "links" ? linksData : tab === "urls" ? urlsData : qrTypeData;
  
  const selectedTabData = tabs.find(t => t.value === tab) || tabs[0];

  const getBarListData = (tabValue: string) => {
    // Use the correct data source based on tabValue
    const tabData = tabValue === "links" ? linksData : tabValue === "urls" ? urlsData : qrTypeData;
    
    if (tabValue === "qrType") {
      return tabData
        ?.map((d) => {
          const qrTypeInfo = ANALYTICS_QR_TYPES_DATA.find(type => type.id === d.qrType);
          return {
            icon: qrTypeInfo ? (
              <Icon icon={qrTypeInfo.icon} className="size-5" />
            ) : <Globe className="size-5" />,
            title: qrTypeInfo?.label || d.qrType || "Unknown",
            href: queryParams({
              ...(searchParams.has("qrType")
                ? { del: "qrType" }
                : {
                    set: { qrType: d.qrType },
                  }),
              getNewPath: true,
            }) as string,
            value: d[dataKey] || 0,
          };
        })
        ?.sort((a, b) => b.value - a.value) || [];
    }
    
    return tabData
      ?.map((d) => ({
        icon: (
          <LinkLogo
            apexDomain={getApexDomain(d.url)}
            className="size-5 sm:size-5"
          />
        ),
        title:
          tabValue === "links"
            ? (d["qr"]?.title || d["shortLink"] || "Unknown")
            : d.url ?? "Unknown",
        copyValue: tabValue === "links" ? d["shortLink"] : d.url,
        href: queryParams({
          ...((tabValue === "links" &&
            searchParams.has("domain") &&
            searchParams.has("key")) ||
          (tabValue === "urls" && searchParams.has("url"))
            ? {
                del:
                  tabValue === "links"
                    ? ["domain", "key"]
                    : "url",
              }
            : {
                set: {
                  ...(tabValue === "links"
                    ? { domain: d.domain, key: d.key || "_root" }
                    : {
                        url: d.url,
                      }),
                },
              }),
          getNewPath: true,
        }) as string,
        value: d[dataKey] || 0,
        ...(tabValue === "links" && { linkData: d }),
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

      <Card className="h-[442px] gap-4 overflow-hidden pt-6">
        <CardContent className="relative px-6 overflow-hidden">
          {data ? (
            data.length > 0 ? (
              <>
                {view === "list" ? (
                  <>
                    {/* Controls for Bar Chart - Top */}
                    <div className="flex gap-3 justify-end mb-4">
                      <div className="flex gap-1 border rounded-lg p-1">
                        <button
                          onClick={() => onViewChange("pie")}
                          className={cn(
                            "p-2 rounded transition-colors",
                            // @ts-ignore
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
                    <TopLinksBarChart
                      data={getBarListData(tab)}
                      unit={selectedTab}
                      maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                      limit={EXPAND_LIMIT}
                      onViewAll={() => setShowModal(true)}
                    />
                  </>
                ) : (
                  <AnalyticsPieChartWithLists
                    data={getBarListData(tab)}
                    unit={selectedTab}
                    maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                    limit={EXPAND_LIMIT}
                    showName={false}
                    showCopy={true}
                    onViewAll={() => setShowModal(true)}
                    controls={
                      <div className="flex gap-3">
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
                              // @ts-ignore
                              view === "list" 
                                ? "bg-secondary text-white" 
                                : "hover:bg-gray-100"
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
