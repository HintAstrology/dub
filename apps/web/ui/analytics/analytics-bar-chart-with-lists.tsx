"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { nFormatter } from "@dub/utils";
import { ReactNode, useContext, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { AnalyticsContext } from "./analytics-provider";

const chartColors = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#a855f7", // purple
  "#10b981", // emerald
];

interface DataItem {
  icon: ReactNode;
  title: string;
  href?: string;
  value: number;
  linkId?: string;
}

interface AnalyticsBarChartWithListsProps {
  data: DataItem[];
  maxValue: number;
  unit: string;
  limit?: number;
}

export default function AnalyticsBarChartWithLists({
  data,
  maxValue,
  unit,
  limit = 6,
}: AnalyticsBarChartWithListsProps) {
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const displayData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return sorted.slice(0, limit);
  }, [data, limit]);

  const chartData = useMemo(() => {
    return displayData
      .map((item, index) => ({
        name: `${index + 1}`, // Show number on Y-axis
        label:
          item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
        value: item.value,
        percentage:
          maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0,
        color: chartColors[index % chartColors.length],
        fullName: item.title,
        icon: item.icon,
      }))
      .reverse(); // Reverse to show top item at top (1 at top)
  }, [displayData, maxValue]);

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

  const chartConfig = {
    value: {
      label: "Value",
    },
  };

  const formatValue = (value: number) => {
    if (unit === "sales" && saleUnit === "saleAmount") {
      return `$${nFormatter(value / 100)}`;
    }
    return nFormatter(value);
  };

  const formatPercentage = (value: number) => {
    return maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_1fr] -mt-2">
      <div className="relative w-full lg:w-fit">
        <ChartContainer config={chartConfig} className="h-[240px] w-full lg:w-[500px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 150, bottom: 5, left: 40 }}
            barCategoryGap="10%"
          >
            <CartesianGrid
              horizontal={true}
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={50}
              tick={{
                fontSize: 14,
                fill: "hsl(var(--foreground))",
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-white p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="text-sm font-medium">
                            {data.fullName}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {formatValue(data.value)} ({data.percentage}%)
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        {/* Item name labels */}
        <div className="absolute bottom-0 right-4 top-0 flex flex-col justify-around">
          {chartData.map((entry, index) => (
            <div
              key={index}
              className="flex items-center"
              style={{ height: `${100 / chartData.length}%` }}
            >
              <span className="text-foreground whitespace-nowrap text-xs font-medium">
                {entry.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Percentage List */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-black">Percentage</h3>
        <div className="space-y-3">
          {list1Data.map((item, index) => {
            const percentage = formatPercentage(item.value);
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-foreground flex-shrink-0 text-sm font-semibold">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SCANS List */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-black">Scans</h3>
        <div className="space-y-3">
          {list2Data.map((item, index) => {
            const formattedValue = formatValue(item.value);
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-foreground flex-shrink-0 text-sm font-semibold">
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