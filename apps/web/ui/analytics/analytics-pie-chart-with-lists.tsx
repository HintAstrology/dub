"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CopyButton } from "@dub/ui";
import { nFormatter } from "@dub/utils";
import { ReactNode, useContext, useMemo, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { AnalyticsContext } from "./analytics-provider";
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
  controls?: ReactNode;
}

export default function AnalyticsPieChartWithLists({
  data,
  maxValue,
  unit,
  limit = 6,
  showName = false,
  showCopy = false,
  onViewAll,
  controls,
}: AnalyticsPieChartWithListsProps) {
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isContainerHovered, setIsContainerHovered] = useState(false);

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
    return sortedData.slice(
      0,
      limit ? Math.min(limit, MAX_VISIBLE_ITEMS) : MAX_VISIBLE_ITEMS,
    );
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
      name:
        item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
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
    <div 
      className="relative flex flex-col overflow-hidden"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => setIsContainerHovered(false)}
    >
      {/* Pie Chart and Controls */}
      <div className="flex items-start justify-between gap-8">
        {/* Pie Chart */}
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
                      showCopy={false}
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
              innerRadius={55}
              strokeWidth={10}
              outerRadius={80}
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

        {/* Controls */}
        {controls && <div>{controls}</div>}
      </div>

      {/* Scans List */}
      <div className="relative h-fit min-w-0">
        <div className="mb-3 flex justify-end">
          <h3 className="text-base font-semibold text-black">Scans</h3>
        </div>
        <div className="space-y-1">
          {list1Data.map((item, index) => {
            const formattedValue = formatValue(item.value);
            // Calculate max length based on available space (approximately 20-25 chars)
            const maxLength = 40;
            const displayTitle =
              item.title.length > maxLength
                ? `${item.title.slice(0, maxLength)}...`
                : item.title;
            return (
              <div
                key={index}
                className="flex hover:bg-neutral-100 p-1 min-w-0 items-center gap-3 group"
                onMouseEnter={() => showCopy && setHoveredIndex(index)}
                onMouseLeave={() => showCopy && setHoveredIndex(null)}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.icon && <div className="shrink-0">{item.icon}</div>}
                  <span
                    className="text-foreground truncate text-sm font-medium"
                    title={item.title}
                  >
                    {displayTitle}
                  </span>
                  {showCopy && hoveredIndex === index && (
                    <CopyButton
                      value={item.title}
                      variant="neutral"
                      className="h-4 w-4 p-0.5"
                    />
                  )}
                </div>
                <span className="text-foreground shrink-0 whitespace-nowrap text-sm font-semibold">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
        {/* {hasMore && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-20 bg-gradient-to-t from-white via-white/80 to-transparent" />
        )} */}
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
