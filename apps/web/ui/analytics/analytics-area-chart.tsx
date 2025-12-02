import { Card, CardContent } from "@/components/ui/card";
import { formatDateTooltip } from "@/lib/analytics/format-date-tooltip";
import { EventType } from "@/lib/analytics/types";
import { editQueryString } from "@/lib/analytics/utils";
import useWorkspace from "@/lib/swr/use-workspace";
import { Tooltip } from "@dub/ui";
import { cn, currencyFormatter, fetcher, nFormatter } from "@dub/utils";
import { subDays } from "date-fns";
import {
  ChromeIcon,
  GlobeIcon,
  LayoutGridIcon,
  MonitorIcon,
  QrCodeIcon,
  SmartphoneIcon,
  TagIcon,
  TrendingDown,
  TrendingUp,
  UsersIcon,
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import useSWR from "swr";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import {
  getDataKey,
  getYAxisConfig,
  transformToRechartsData,
} from "./chart-helpers";
import {
  DashboardStats,
  formatPercentageChange,
  formatStatChange,
  formatStatValue,
  getCountryName,
  getQrTypeLabel,
} from "./stats-helpers";

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

// Component to conditionally show tooltip only when text is truncated
function TruncatedValue({
  value,
  className,
}: {
  value: string;
  className: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (ref.current) {
        setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
      }
    };
    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [value]);

  const span = (
    <span ref={ref} className={className}>
      {value}
    </span>
  );

  return isTruncated ? <Tooltip content={value}>{span}</Tooltip> : span;
}

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

  const rechartsData = useMemo(() => {
    // Check if we should show hours (24h interval or custom range <= 24 hours)
    const shouldShowHours =
      interval === "24h" ||
      (start && end && end.getTime() - start.getTime() <= 24 * 60 * 60 * 1000);

    return transformToRechartsData(
      chartData,
      resource,
      saleUnit,
      shouldShowHours ? "24h" : interval,
    );
  }, [chartData, resource, saleUnit, interval, start, end]);

  const dataKey = getDataKey(resource);
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
        icon: <LayoutGridIcon className="text-primary size-8 stroke-[1.5]" />,
        title: "Top QR Type",
        value: getQrTypeLabel(stats?.topQrType?.name),
        change: formatStatChange(stats?.topQrType?.percentage),
        isNumeric: false,
      },
      {
        icon: <SmartphoneIcon className="text-primary size-8 stroke-[1.5]" />,
        title: "Top Device",
        value: stats?.topDevice?.name || "-",
        change: formatStatChange(stats?.topDevice?.percentage),
        isNumeric: false,
      },
      {
        icon: <ChromeIcon className="text-primary size-8 stroke-[1.5]" />,
        title: "Top Browser",
        value: stats?.topBrowser?.name || "-",
        change: formatStatChange(stats?.topBrowser?.percentage),
        isNumeric: false,
      },
      {
        icon: <MonitorIcon className="text-primary size-8 stroke-[1.5]" />,
        title: "Top OS",
        value: stats?.topOS?.name || "-",
        change: formatStatChange(stats?.topOS?.percentage),
        isNumeric: false,
      },
      {
        icon: <GlobeIcon className="text-primary size-8 stroke-[1.5]" />,
        title: "Top Country",
        value: getCountryName(stats?.topCountry?.name),
        change: formatStatChange(stats?.topCountry?.percentage),
        isNumeric: false,
      },
      {
        icon: <TagIcon className="text-primary size-8 stroke-[1.5]" />,
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
    <Card className={cn("flex flex-col gap-4 border-none p-3 sm:p-4 md:p-4")}>
      <div className="flex flex-col gap-4">
        <CardContent className="grow p-0">
          <div className="dub-scrollbar -mx-1 flex w-full gap-4 overflow-x-auto px-1 py-1">
            {statsData.map((stat, index) => {
              const isNumeric =
                stat.isNumeric &&
                typeof stat.change === "object" &&
                stat.change !== null;
              const changeValue =
                typeof stat.change === "string"
                  ? stat.change
                  : stat.change?.text || "-";
              const isPositive =
                typeof stat.change === "object" && stat.change?.isPositive;

              return (
                <div
                  key={index}
                  className="flex h-[90px] min-w-[145px] flex-1 flex-col items-start justify-between rounded-md bg-white p-2 shadow"
                >
                  <span className="text-muted-foreground text-xs font-medium leading-none">
                    {stat.title}
                  </span>
                  {isNumeric ? (
                    <>
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <div className="flex flex-col">
                          <TruncatedValue
                            value={stat.value}
                            className="w-full max-w-[100px] truncate text-sm font-semibold"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isPositive !== undefined &&
                          (isPositive ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-orange-600" />
                          ))}
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
                          <span className="text-muted-foreground text-xs leading-none">
                            {stat.comparisonPeriod}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <TruncatedValue
                          value={stat.value}
                          className="w-full max-w-[100px] truncate text-sm font-bold"
                        />
                      </div>
                      <span className="text-muted-foreground text-xs leading-none">
                        {changeValue}{" "}
                        {index !== statsData.length - 1 ? "of all scans" : null}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>
      <div className="flex flex-col space-y-4 overflow-x-auto">
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
                      resource === "clicks"
                        ? " Scans"
                        : resource === "leads"
                          ? " Leads"
                          : " Sales",
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
    </Card>
  );
}
