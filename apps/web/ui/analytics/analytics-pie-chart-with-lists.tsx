"use client";

import { nFormatter } from "@dub/utils";
import { Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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

  const formatPercentage = (value: number) => {
    return maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  };

  const displayData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return sorted.slice(0, limit);
  }, [data, limit]);

  const pieChartData = useMemo(() => {
    return displayData.map((item, index) => ({
      name: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
      value: item.value,
      fill: chartColors[index % chartColors.length],
      fullName: item.title,
      percentage: formatPercentage(item.value),
    }));
  }, [displayData, maxValue]);

  const totalValue = useMemo(() => {
    return displayData.reduce((sum, item) => sum + item.value, 0);
  }, [displayData]);

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr] -mt-2">
      {/* Pie Chart */}
      <div className="relative w-full flex items-center justify-center order-first lg:order-first">
        <ChartContainer config={chartConfig} className="h-[240px] w-full max-w-[240px]">
          <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    return [
                      `${formatValue(data.value)} (${data.percentage}%)`,
                      data.fullName,
                    ];
                  }}
                />
              }
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

      {/* Combined List with Name/URL, Percentage, and Scans */}
      <div>
        <div className="mb-3 flex justify-end gap-8">
          <h3 className="text-base font-semibold text-black">Percentage</h3>
          <h3 className="text-base font-semibold text-black">Scans</h3>
        </div>
        <div className="space-y-3">
          {list1Data.map((item, index) => {
            const percentage = formatPercentage(item.value);
            const formattedValue = formatValue(item.value);
            const displayTitle = item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title;
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {showName && (
                    <span className="text-foreground text-sm font-medium truncate">
                      {displayTitle}
                    </span>
                  )}
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

