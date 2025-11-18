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
  DashboardStats,
  formatPercentageChange,
  getQrTypeLabel,
  getCountryName,
  formatStatValue,
  formatStatChange,
} from "./stats-helpers";
import {
  QrCodeIcon,
  UsersIcon,
  TagIcon,
  LayoutGridIcon,
  SmartphoneIcon,
  GlobeIcon,
  ChromeIcon,
  MonitorIcon,
  TrendingUp,
  TrendingDown,
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

  const { data: stats } = useSWR<DashboardStats>(
    !demo && `${baseApiPath}/stats?${queryString}`,
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

  const rechartsData = useMemo(
    () => transformToRechartsData(chartData, resource, saleUnit),
    [chartData, resource, saleUnit]
  );

  const dataKey = getDataKey(resource);
  const chartColor = getChartColor(resource);
  const yAxisConfig = getYAxisConfig(rechartsData, dataKey);

  const statsData = useMemo(() => {
    const comparisonPeriod = stats?.comparisonPeriod || "vs 7 days";

    return [
      {
        icon: <QrCodeIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Total Scans",
        value: formatStatValue(stats?.totalClicks, true),
        change: formatPercentageChange(stats?.totalClicksChange ?? null),
        comparisonPeriod,
        isNumeric: true,
      },
      {
        icon: <UsersIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Unique Scans",
        value: formatStatValue(stats?.uniqueClicks, true),
        change: formatPercentageChange(stats?.uniqueClicksChange ?? null),
        comparisonPeriod,
        isNumeric: true,
      },
      {
        icon: <LayoutGridIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Top QR Type",
        value: getQrTypeLabel(stats?.topQrType?.name),
        change: formatStatChange(stats?.topQrType?.percentage),
        isNumeric: false,
      },
      {
        icon: <SmartphoneIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Top Device",
        value: stats?.topDevice?.name || "-",
        change: formatStatChange(stats?.topDevice?.percentage),
        isNumeric: false,
      },
      {
        icon: <ChromeIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Top Browser",
        value: stats?.topBrowser?.name || "-",
        change: formatStatChange(stats?.topBrowser?.percentage),
        isNumeric: false,
      },
      {
        icon: <MonitorIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Top OS",
        value: stats?.topOS?.name || "-",
        change: formatStatChange(stats?.topOS?.percentage),
        isNumeric: false,
      },
      {
        icon: <GlobeIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Top Country",
        value: getCountryName(stats?.topCountry?.name),
        change: formatStatChange(stats?.topCountry?.percentage),
        isNumeric: false,
      },
      {
        icon: <TagIcon className="text-primary size-6 stroke-[1.5]" />,
        title: "Top QR Name",
        value: stats?.topLink?.name || "-",
        change: formatStatChange(undefined, stats?.topLink?.value),
        isNumeric: false,
      },
    ];
  }, [stats]);

  if (!chartData) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <AnalyticsLoadingSpinner />
      </div>
    );
  }

  return (
    <Card className={cn("grid gap-4 p-3 sm:p-4 md:p-6 lg:grid-cols-[70%_30%] border-none")}>
        <div className="space-y-4 flex flex-col overflow-x-auto">
          <div className="h-56 w-full min-w-[600px] sm:h-80 sm:min-w-0 md:h-96">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={rechartsData}
              margin={{
                left: -30,
                right: 0,
              }}
            >
              <defs>
                <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#016766" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#016766" stopOpacity={0.1} />
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
                stroke="#016766"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-2">
        <CardContent className="grow p-0">
          <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
            {statsData.map((stat, index) => {
              const isNumeric = stat.isNumeric && typeof stat.change === "object" && stat.change !== null;
              const changeValue = typeof stat.change === "string" ? stat.change : stat.change?.text || "-";
              const isPositive = typeof stat.change === "object" && stat.change?.isPositive;

              return (
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
                      {!isNumeric && (
                        <span className="text-xs text-muted-foreground">{changeValue}</span>
                      )}
                    </div>
                  </div>
                  {isNumeric && (
                    <div className="flex items-center gap-1.5 mt-auto">
                      {isPositive !== undefined && (
                        isPositive ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-orange-600" />
                        )
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isPositive === true
                            ? "text-green-600"
                            : isPositive === false
                              ? "text-orange-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {changeValue}
                      </span>
                      {stat.comparisonPeriod && (
                        <span className="text-xs text-muted-foreground">
                          {stat.comparisonPeriod}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
