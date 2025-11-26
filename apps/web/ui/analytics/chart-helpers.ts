import { EventType } from "@/lib/analytics/types";
import { format } from "date-fns";

export interface ChartDataItem {
  date: Date;
  values: {
    clicks: number;
    leads: number;
    sales: number;
    saleAmount: number;
  };
}

export interface RechartsDataItem {
  date: Date;
  dateLabel: string;
  clicks: number;
  leads: number;
  sales: number;
}

/**
 * Transform chart data to recharts format
 */
export function transformToRechartsData(
  chartData: ChartDataItem[] | null,
  resource: EventType,
  saleUnit: "sales" | "saleAmount",
  interval?: string
): RechartsDataItem[] {
  if (!chartData) return [];
  
  return chartData.map((item) => ({
    date: item.date,
    dateLabel: interval === "24h" 
      ? format(item.date, "HH:mm")
      : format(item.date, "MMM dd"),
    clicks: item.values.clicks,
    leads: item.values.leads,
    sales:
      resource === "sales" && saleUnit === "saleAmount"
        ? item.values.saleAmount
        : item.values.sales,
  }));
}

/**
 * Get chart color based on resource type
 */
export function getChartColor(resource: EventType): string {
  switch (resource) {
    case "clicks":
      return "var(--chart-2)";
    case "leads":
      return "var(--chart-1)";
    case "sales":
      return "var(--chart-5)";
    default:
      return "var(--chart-2)";
  }
}

/**
 * Calculate Y-axis configuration with domain and ticks
 */
export function getYAxisConfig(
  data: RechartsDataItem[],
  dataKey: "clicks" | "leads" | "sales"
): { domain: [number, number]; ticks: number[] } {
  if (!data.length) {
    return { domain: [0, 1000], ticks: [0, 500, 1000] };
  }

  const values = data.map((d) => d[dataKey] as number);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const padding = (maxValue - minValue) * 0.2;
  const domainMin = Math.max(0, Math.floor(minValue - padding));
  const domainMax = Math.ceil(maxValue + padding);

  // Generate 5-6 nice tick values
  const step = Math.ceil((domainMax - domainMin) / 5);
  const ticks = Array.from({ length: 6 }, (_, i) => domainMin + i * step);

  return { domain: [domainMin, domainMax], ticks };
}

/**
 * Get the data key for the chart based on resource
 */
export function getDataKey(resource: EventType): "clicks" | "leads" | "sales" {
  return resource === "clicks" ? "clicks" : resource;
}

