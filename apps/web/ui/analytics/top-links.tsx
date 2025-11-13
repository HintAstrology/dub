"use client";

import { LinkLogo, Modal, useRouterStuff } from "@dub/ui";
import { Globe, Hyperlink } from "@dub/ui/icons";
import { X } from "@/ui/shared/icons";
import { getApexDomain, nFormatter } from "@dub/utils";
import { useContext, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import AnalyticsPieChartWithLists from "./analytics-pie-chart-with-lists";
import { useAnalyticsFilterOption } from "./utils";

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

  const chartData = useMemo(() => {
    return displayData
      .map((item, index) => ({
        sr: index + 1,
        service: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
        sales: maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0,
        fill: chartColors[index % chartColors.length],
        icon: item.icon,
        title: item.title,
        value: item.value,
      }))
      .reverse();
  }, [displayData, maxValue]);

  const chartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr] -mt-2">
      <div className="p-6">
        <ChartContainer config={chartConfig} className="h-full min-h-60 w-full max-lg:max-h-70 lg:max-w-95">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            barSize={24}
            margin={{
              left: -35,
              right: 12,
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="4" stroke="var(--border)" />
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
            <YAxis dataKey="sr" type="category" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="sales" radius={[0, 10, 10, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="service"
                position="insideLeft"
                fill="var(--primary-foreground)"
                className="text-sm"
                offset={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <div>
        <div className="mb-3 flex justify-end gap-8">
          <h3 className="text-base font-semibold text-black">Percentage</h3>
          <h3 className="text-base font-semibold text-black">Scans</h3>
        </div>
        <div className="space-y-3">
          {displayData.map((item, index) => {
            const percentage = formatPercentage(item.value);
            const formattedValue = formatValue(item.value);
            const displayTitle = item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title;
            const color = chartColors[index % chartColors.length];
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground text-sm font-medium truncate">
                    {displayTitle}
                  </span>
                </div>
                <div className="flex gap-8">
                  <span className="text-foreground text-sm font-semibold whitespace-nowrap min-w-[60px] text-left">
                    {percentage}%
                  </span>
                  <span className="text-foreground text-sm font-semibold whitespace-nowrap min-w-[60px] text-left">
                    {formattedValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TopLinks() {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [tab, setTab] = useState<"links" | "urls">("links");
  const [showModal, setShowModal] = useState(false);
  
  // Fetch data for each tab
  const { data: linksData } = useAnalyticsFilterOption({
    groupBy: "top_links",
  });
  const { data: urlsData } = useAnalyticsFilterOption({
    groupBy: "top_urls",
  });
  
  // Get data for current tab
  const data = tab === "links" ? linksData : urlsData;
  
  const selectedTabData = tabs.find(t => t.value === tab) || tabs[0];
  const hasMore = (data?.length ?? 0) > EXPAND_LIMIT;

  const getBarListData = (tabValue: string) => {
    // Use the correct data source based on tabValue, not the current tab state
    const tabData = tabValue === "links" ? linksData : urlsData;
    
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

      <Card className="gap-4 pt-6">
        <CardContent className="relative px-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "links" | "urls")} className="w-full">
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
              const tabData = tabItem.value === "links" ? linksData : urlsData;
              const tabMaxValue = Math.max(...(tabData?.map((d) => d[dataKey] ?? 0) ?? [0]));
              
              return (
                <TabsContent key={tabItem.value} value={tabItem.value}>
                  {tabData ? (
                    tabData.length > 0 ? (
                      <TopLinksBarChart
                        data={getBarListData(tabItem.value)}
                        unit={selectedTab}
                        maxValue={tabMaxValue}
                        limit={EXPAND_LIMIT}
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
