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
import { PieChartIcon, ChartBar } from "lucide-react";

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
}

function TopLinksBarChart({ data, maxValue, unit, limit = 6 }: TopLinksBarChartProps) {
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

  const displayTotalValue = useMemo(() => {
    return displayData.reduce((sum, item) => sum + item.value, 0);
  }, [displayData]);

  const chartData = useMemo(() => {
    return displayData
      .map((item, index) => ({
        sr: displayData.length - index,
        service: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
        sales: displayTotalValue > 0 ? Math.round((item.value / displayTotalValue) * 100) : 0,
        fill: chartColors[index % chartColors.length],
        icon: item.icon,
        title: item.title,
        value: item.value,
      }))
      .reverse();
  }, [displayData, displayTotalValue]);

  const chartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_1fr] -mt-2 overflow-hidden">
      <div className="pl-2 pr-6 py-6 min-w-0 overflow-hidden flex items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[240px] w-[270px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            barSize={24}
            margin={{
              top: 0,
              bottom: 40,
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
                    <div className="rounded-lg border bg-white p-2 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: data.fill }}
                          />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {data.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4">
                          {data.sales}%
                        </span>
                      </div>
                    </div>
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
                position="bottom"
                fill="hsl(var(--muted-foreground))"
                className="text-xs"
                offset={5}
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
          {[...displayData].reverse().map((item, index) => {
            const formattedValue = formatValue(item.value);
            const color = chartData.find((d) => d.title === item.title)?.fill || chartColors[(displayData.length - 1 - index) % chartColors.length];
            return (
              <div key={index} className="flex items-center justify-end gap-2">
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
  const hasMore = (data?.length ?? 0) > EXPAND_LIMIT;

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
                  <TopLinksBarChart
                    data={getBarListData(tab)}
                    unit={selectedTab}
                    maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                    limit={EXPAND_LIMIT}
                  />
                ) : (
                  <AnalyticsPieChartWithLists
                    data={getBarListData(tab)}
                    unit={selectedTab}
                    maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                    limit={EXPAND_LIMIT}
                    showName={false}
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
