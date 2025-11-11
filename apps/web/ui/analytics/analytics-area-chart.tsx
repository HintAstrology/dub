import { formatDateTooltip } from "@/lib/analytics/format-date-tooltip";
import { EventType } from "@/lib/analytics/types";
import { editQueryString } from "@/lib/analytics/utils";
import useWorkspace from "@/lib/swr/use-workspace";
import { cn, currencyFormatter, fetcher, nFormatter } from "@dub/utils";
import { subDays } from "date-fns";
import { useContext, useMemo } from "react";
import useSWR from "swr";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  transformToRechartsData,
  getChartColor,
  getYAxisConfig,
  getDataKey,
} from "./chart-helpers";
import {
  QrCodeIcon,
  UsersIcon,
  TagIcon,
  LayoutGridIcon,
  SmartphoneIcon,
  GlobeIcon,
  ChromeIcon,
  MonitorIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const DEMO_DATA = [
  180, 230, 320, 305, 330, 290, 340, 310, 380, 360, 270, 360, 280, 270, 350,
  370, 350, 340, 300,
]
  .reverse()
  .map((value, index) => ({
    date: subDays(new Date(), index),
    values: {
      clicks: value,
      leads: value,
      sales: value,
      saleAmount: value * 19,
    },
  }))
  .reverse();

const chartConfig = {
  clicks: {
    label: "Scans",
  },
  leads: {
    label: "Leads",
  },
  sales: {
    label: "Sales",
  },
} satisfies ChartConfig;

// Mock data for stats - replace with API data later
const MOCK_STATS_DATA = [
  {
    icon: <QrCodeIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Total Scans",
    value: "12,543",
    change: "+1.2K",
  },
  {
    icon: <UsersIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Unique Scans",
    value: "8,234",
    change: "+856",
  },
 
  {
    icon: <LayoutGridIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Top QR Type",
    value: "URL",
    change: "65%",
  },
  {
    icon: <SmartphoneIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Top Device",
    value: "iPhone",
    change: "45%",
  },
  {
    icon: <ChromeIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Top Browser",
    value: "Chrome",
    change: "52%",
  },
  {
    icon: <MonitorIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Top OS",
    value: "iOS",
    change: "48%",
  },
  {
    icon: <GlobeIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Top Country",
    value: "United States",
    change: "38%",
  },
  {
    icon: <TagIcon className="text-primary size-6 stroke-[1.5]" />,
    title: "Top QR Name",
    value: "Product-2024 Qr code",
    change: "2.3K scans",
  },
];

export default function AnalyticsAreaChart({
  resource,
  demo,
}: {
  resource: EventType;
  demo?: boolean;
}) {
  const { createdAt } = useWorkspace();

  const {
    baseApiPath,
    queryString,
    start,
    end,
    interval,
    saleUnit,
    requiresUpgrade,
  } = useContext(AnalyticsContext);

  const { data } = useSWR<
    {
      start: Date;
      clicks: number;
      leads: number;
      sales: number;
      saleAmount: number;
    }[]
  >(
    !demo &&
      `${baseApiPath}?${editQueryString(queryString, {
        groupBy: "timeseries",
      })}`,
    fetcher,
    {
      shouldRetryOnError: !requiresUpgrade,
    },
  );

  const chartData = useMemo(
    () =>
      demo
        ? DEMO_DATA
        : data?.map(({ start, clicks, leads, sales, saleAmount }) => ({
            date: new Date(start),
            values: {
              clicks,
              leads,
              sales,
              saleAmount: (saleAmount ?? 0) / 100,
            },
          })) ?? null,
    [data, demo],
  );

  // Transform data for recharts format
  const rechartsData = useMemo(
    () => transformToRechartsData(chartData, resource, saleUnit),
    [chartData, resource, saleUnit]
  );

  // Get chart configuration
  const dataKey = getDataKey(resource);
  const chartColor = getChartColor(resource);
  const yAxisConfig = getYAxisConfig(rechartsData, dataKey);

  if (!chartData) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <AnalyticsLoadingSpinner />
      </div>
    );
  }

  return (
    <Card className={cn("grid gap-4 p-3 sm:p-4 md:p-6 lg:grid-cols-[2fr_2fr] border-none")}>
      <div className="space-y-4 flex items-end overflow-x-auto">
        <div className="h-56 w-full min-w-[600px] sm:h-80 sm:min-w-0 md:h-96">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={rechartsData}
              margin={{
                left: 0,
                right: 0,
                top: 12,
                bottom: 12,
              }}
            >
              <defs>
                <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                domain={yAxisConfig.domain}
                ticks={yAxisConfig.ticks}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) =>
                  resource === "sales" && saleUnit === "saleAmount"
                    ? `$${nFormatter(value)}`
                    : nFormatter(value)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        return formatDateTooltip(payload[0].payload.date, {
                          interval: demo ? "day" : interval,
                          start,
                          end,
                          dataAvailableFrom: createdAt,
                        });
                      }
                      return "";
                    }}
                    formatter={(value) => [
                      resource === "sales" && saleUnit === "saleAmount"
                        ? currencyFormatter(value as number)
                        : nFormatter(value as number, { full: true }),
                      resource === "clicks" ? "Scans" : resource === "leads" ? "Leads" : "Sales",
                    ]}
                  />
                }
              />
              <Area
                dataKey={dataKey}
                type="monotone"
                fill="url(#fillArea)"
                fillOpacity={1}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-2">
        <CardContent className="grow p-0">
          <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
            {MOCK_STATS_DATA.map((stat, index) => (
              <div
                key={index}
                className="bg-muted flex flex-col gap-2 rounded-lg p-2"
              >
                <span className="text-muted-foreground text-xs font-medium">
                  {stat.title}
                </span>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-sm">
                    <AvatarFallback className="bg-card text-primary shrink-0 rounded-sm">
                      {stat.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
