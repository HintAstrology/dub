"use client";

import { nFormatter } from "@dub/utils";
import { Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useContext, useMemo } from "react";
import { AnalyticsContext } from "./analytics-provider";
import { ReactNode } from "react";

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
}

export default function AnalyticsPieChartWithLists({
  data,
  maxValue,
  unit,
  limit = 6,
  showName = false,
}: AnalyticsPieChartWithListsProps) {
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);

  const formatValue = (value: number) => {
    if (unit === "sales" && saleUnit === "saleAmount") {
      return `$${nFormatter(value / 100)}`;
    }
    return nFormatter(value);
  };

  const displayData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return sorted.slice(0, limit);
  }, [data, limit]);

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] -mt-2 overflow-hidden">
      {/* Pie Chart */}
      <div className="relative w-full flex items-center justify-center order-first lg:order-first min-w-0 overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[240px] w-[240px]">
          <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
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
                            {data.fullName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4">
                          {data.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={15}
              outerRadius={90}
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

      {/* List with optional names and Scans */}
      <div className="min-w-0">
        <div className="mb-3 flex justify-end">
          <h3 className="text-base font-semibold text-black">Scans</h3>
        </div>
        <div className="space-y-3">
          {list1Data.map((item, index) => {
            const formattedValue = formatValue(item.value);
            const displayTitle = item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title;
            return (
              <div key={index} className="flex items-center gap-4">
                {showName && (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-foreground text-sm font-medium truncate">
                      {item.icon}
                    </span>
                    <span className="text-foreground text-sm font-medium truncate">
                      {displayTitle}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 ml-auto">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground text-sm font-semibold whitespace-nowrap">
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

