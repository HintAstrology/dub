"use client";

import { nFormatter } from "@dub/utils";
import { Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useContext, useMemo } from "react";
import { AnalyticsContext } from "./analytics-provider";
import { ReactNode } from "react";
import { ChartTooltipWithCopy } from "./chart-tooltip-with-copy";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

interface DataItem {
  icon: ReactNode;
  title: string;
  href?: string;
  value: number;
  linkId?: string;
}

interface AnalyticsPieChartWithListsProps {
  data: DataItem[];
  maxValue: number;
  unit: string;
  limit?: number;
  showName?: boolean;
  showCopy?: boolean;
  onViewAll?: () => void;
}

export default function AnalyticsPieChartWithLists({
  data,
  maxValue,
  unit,
  limit = 6,
  showName = false,
  showCopy = false,
  onViewAll,
}: AnalyticsPieChartWithListsProps) {
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);

  const formatValue = (value: number) => {
    if (unit === "sales" && saleUnit === "saleAmount") {
      return `$${nFormatter(value / 100)}`;
    }
    return nFormatter(value);
  };

  const MAX_VISIBLE_ITEMS = 5;
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const displayData = useMemo(() => {
    return sortedData.slice(0, limit ? Math.min(limit, MAX_VISIBLE_ITEMS) : MAX_VISIBLE_ITEMS);
  }, [sortedData, limit]);

  const hasMore = sortedData.length > MAX_VISIBLE_ITEMS;

  const totalValue = useMemo(() => {
    return displayData.reduce((sum, item) => sum + item.value, 0);
  }, [displayData]);

  const formatPercentage = (value: number) => {
    return totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
  };

  const pieChartData = useMemo(() => {
    return displayData.map((item, index) => ({
      name: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
      value: item.value,
      fill: chartColors[index % chartColors.length],
      fullName: item.title,
      percentage: formatPercentage(item.value),
    }));
  }, [displayData, totalValue]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color?: string }> = {
      value: {
        label: "Value",
      },
    };
    displayData.forEach((item, index) => {
      config[`item${index}`] = {
        label: item.title,
        color: chartColors[index % chartColors.length],
      };
    });
    return config;
  }, [displayData]);

  // Both lists show all items - Percentage shows percentages, Scans shows actual values
  const list1Data = useMemo(() => {
    return displayData.map((item, idx) => ({
      ...item,
      color: chartColors[idx % chartColors.length],
    }));
  }, [displayData]);

  const list2Data = useMemo(() => {
    return displayData.map((item, idx) => ({
      ...item,
      color: chartColors[idx % chartColors.length],
    }));
  }, [displayData]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[160px_1fr] -mt-2 overflow-hidden relative items-start min-h-[230px]">
      {/* Pie Chart */}
      <div className="relative w-full flex items-center justify-center order-first lg:order-first min-w-0 overflow-hidden h-fit">
        <ChartContainer config={chartConfig} className="h-[160px] w-[160px]">
          <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <ChartTooltipWithCopy
                      color={data.fill}
                      name={data.fullName}
                      value={formatValue(data.value)}
                      percentage={data.percentage}
                      copyValue={data.fullName}
                      showCopy={showCopy}
                      active={active}
                    />
                  );
                }
                return null;
              }}
            />
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              strokeWidth={10}
              outerRadius={60}
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) - 8}
                          className="fill-foreground text-lg font-semibold"
                        >
                          {formatValue(totalValue)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 12}
                          className="fill-muted-foreground text-xs"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      {/* List with names and Scans */}
      <div className="min-w-0 h-fit">
        <div className="mb-3 flex justify-end">
          <h3 className="text-base font-semibold text-black">Scans</h3>
        </div>
        <div className="space-y-3">
          {list1Data.map((item, index) => {
            const formattedValue = formatValue(item.value);
            // Calculate max length based on available space (approximately 20-25 chars)
            const maxLength = 25;
            const displayTitle = item.title.length > maxLength 
              ? `${item.title.slice(0, maxLength)}...` 
              : item.title;
            return (
              <div key={index} className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.icon && (
                    <div className="shrink-0">{item.icon}</div>
                  )}
                  <span className="text-foreground text-sm font-medium truncate" title={item.title}>
                    {displayTitle}
                  </span>
                </div>
                <span className="text-foreground text-sm font-semibold whitespace-nowrap shrink-0">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
      {hasMore && onViewAll && (
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
  );
}

