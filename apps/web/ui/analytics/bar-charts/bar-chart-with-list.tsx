"use client";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { nFormatter } from "@dub/utils";
import { useContext, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { AnalyticsContext } from "../analytics-provider";
import { ChartTooltipWithCopy } from "../components/chart-tooltip-with-copy";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export interface BarChartData {
  icon: React.ReactNode;
  title: string;
  href?: string;
  value: number;
}

interface BarChartWithListProps {
  data: BarChartData[];
  maxValue: number;
  unit: string;
  limit?: number;
  onViewAll?: () => void;
  showCopy?: boolean;
  copyTooltipText?: string;
  renderIcon?: (icon: React.ReactNode, title: string) => React.ReactNode | null;
  containerClassName?: string;
  chartHeight?: string;
}

export function BarChartWithList({
  data,
  maxValue,
  unit,
  limit = 6,
  onViewAll,
  showCopy = false,
  copyTooltipText,
  renderIcon,
  containerClassName,
  chartHeight = "h-[300px]",
}: BarChartWithListProps) {
  const { saleUnit } = useContext(AnalyticsContext);
  const [isContainerHovered, setIsContainerHovered] = useState(false);

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

  // Limit visible bars
  const MAX_VISIBLE_BARS = 5;
  const visibleBarsData = useMemo(() => {
    return displayData.slice(0, MAX_VISIBLE_BARS);
  }, [displayData]);

  const displayTotalValue = useMemo(() => {
    return visibleBarsData.reduce((sum, item) => sum + item.value, 0);
  }, [visibleBarsData]);

  const chartData = useMemo(() => {
    return visibleBarsData.map((item, index) => {
      return {
        sr: visibleBarsData.length - index,
        service: item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title,
        sales: displayTotalValue > 0 ? Math.round((item.value / displayTotalValue) * 100) : 0,
        fill: chartColors[index % chartColors.length],
        icon: item.icon,
        title: item.title,
        value: item.value,
      };
    });
  }, [visibleBarsData, displayTotalValue]);

  const chartConfig = {
    sales: {
      label: "Sales",
    },
  } satisfies ChartConfig;

  const hasMore = data.length > MAX_VISIBLE_BARS;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => setIsContainerHovered(false)}
    >
      <div className={containerClassName || "grid grid-cols-[min(400px,90%)_1fr] overflow-hidden items-start"}>
        <div className="w-full mt-4 min-w-0 overflow-hidden flex items-center justify-center relative h-fit">
          <ChartContainer config={chartConfig} className={`${chartHeight} w-full -ml-10`} style={{ maxWidth: 'min(100%, 80vw)' }}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              barSize={24}
              barCategoryGap={4}
              margin={{
                top: 25,
                bottom: 0,
                left: 0,
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
                tick={false}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <ChartTooltipWithCopy
                        color={data.fill}
                        name={data.title}
                        value={formatValue(data.value)}
                        percentage={data.sales}
                        copyValue={data.title}
                        showCopy={showCopy}
                        active={active}
                        copyTooltipText={copyTooltipText}
                      />
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
                  position="top"
                  fill="hsl(var(--muted-foreground))"
                  className="text-xs"
                  offset={5}
                  content={(props: any) => {
                    if (!props) return null;
                    const { x, y, value, payload } = props;

                    // Use payload.sr to find the correct entry (most reliable)
                    const dataEntry = chartData.find(
                      (d) => d.sr === payload?.sr || d.title === (value || payload?.title)
                    );
                    const displayTitle = value || payload?.title || dataEntry?.title || "";

                    // Position label above the bar
                    const labelY = y - (renderIcon ? 18 : 8);

                    const iconElement = dataEntry?.icon;
                    const iconToRender = renderIcon ? renderIcon(iconElement, displayTitle) : null;

                    // If renderIcon is provided, use foreignObject for HTML rendering
                    if (renderIcon) {
                      return (
                        <foreignObject x={x} y={labelY} width={200} height={24}>
                          <div className="flex items-center gap-1.5">
                            {iconToRender && <div className="shrink-0">{iconToRender}</div>}
                            <span className="text-muted-foreground truncate text-xs">
                              {displayTitle}
                            </span>
                          </div>
                        </foreignObject>
                      );
                    }

                    // Otherwise use simple text
                    return (
                      <text
                        x={x}
                        y={labelY}
                        fill="hsl(var(--muted-foreground))"
                        textAnchor="start"
                        fontSize="12"
                      >
                        {displayTitle}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <div className="min-w-0 h-full -mt-1">
          <div className="mb-3 flex justify-end">
            <h3 className="text-base font-semibold text-black">Scans</h3>
          </div>
          <div
            className={`flex flex-col ${
              visibleBarsData.length === 1 ? "justify-center" : "justify-around"
            } h-[calc(100%-60px)]`}
          >
            {visibleBarsData.map((item, index) => {
              const formattedValue = formatValue(item.value);
              const dataEntry = chartData.find((d) => d.title === item.title);
              const color = dataEntry?.fill || chartColors[index % chartColors.length];
              return (
                <div
                  key={index}
                  className={`flex items-center ${
                    visibleBarsData.length === 1 ? "justify-center" : "justify-end"
                  } gap-2`}
                >
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-foreground text-sm font-semibold whitespace-nowrap">
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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

