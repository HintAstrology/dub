import { getAnalytics } from "@/lib/analytics/get-analytics";
import { validDateRangeForPlan } from "@/lib/analytics/utils";
import { getStartEndDates } from "@/lib/analytics/utils/get-start-end-dates";
import { withWorkspace } from "@/lib/auth";
import { getDomainOrThrow } from "@/lib/api/domains/get-domain-or-throw";
import { analyticsQuerySchema } from "@/lib/zod/schemas/analytics";
import { getDaysDifference, getSearchParams } from "@dub/utils";
import { NextResponse } from "next/server";

export const GET = withWorkspace(async ({ workspace, searchParams }) => {
  const parsedParams = analyticsQuerySchema.parse(searchParams);

  const { interval, start, end } = parsedParams;

  validDateRangeForPlan({
    plan: workspace.plan,
    dataAvailableFrom: workspace.createdAt,
    interval,
    start,
    end,
    throwError: true,
  });

  try {
    // Helper function to extract days from interval string
    const getDaysFromInterval = (interval: string | undefined): number | null => {
      if (!interval) return null;
      
      // Extract number from intervals like "7d", "30d", "90d"
      const dayMatch = interval.match(/^(\d+)d$/);
      if (dayMatch) {
        return parseInt(dayMatch[1], 10);
      }
      
      // Extract hours and convert to days for "24h"
      if (interval === "24h") {
        return 1;
      }
      
      // Extract years and convert to days for "1y"
      const yearMatch = interval.match(/^(\d+)y$/);
      if (yearMatch) {
        return parseInt(yearMatch[1], 10) * 365;
      }
      
      return null;
    };

    // Calculate previous period dates for comparison
    const getPreviousPeriodDates = () => {
      const { startDate, endDate } = getStartEndDates({
        interval,
        start,
        end,
        dataAvailableFrom: workspace.createdAt,
      });

      if (start && end) {
        // Custom date range - compare with same duration before
        const periodDuration = end.getTime() - start.getTime();
        const daysDiff = getDaysDifference(new Date(start), new Date(end));
        return {
          prevStart: new Date(start.getTime() - periodDuration),
          prevEnd: start,
          comparisonLabel: daysDiff,
        };
      } else if (interval) {
        // Interval-based - compare with same interval before
        const periodDuration = endDate.getTime() - startDate.getTime();
        
        // Try to get days from interval string first (more accurate)
        const daysFromInterval = getDaysFromInterval(interval);
        const daysDiff = daysFromInterval !== null 
          ? daysFromInterval 
          : getDaysDifference(startDate, endDate);
        
        return {
          prevStart: new Date(startDate.getTime() - periodDuration),
          prevEnd: startDate,
          comparisonLabel: daysDiff,
        };
      }
      return null;
    };

    const prevPeriod = getPreviousPeriodDates();

    const [
      totalClicks,
      uniqueClicks,
      topDevice,
      topBrowser,
      topOS,
      topCountry,
      topLink,
      prevTotalClicks,
      prevUniqueClicks,
    ] = await Promise.all([
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "count",
      }),
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "count",
        unique: true,
      }),
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "devices",
      }),
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "browsers",
      }),
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "os",
      }),
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "countries",
      }),
      getAnalytics({
        ...parsedParams,
        workspaceId: workspace.id,
        event: "clicks",
        groupBy: "top_links",
      }),
      // Previous period data for comparison
      prevPeriod
        ? getAnalytics({
            ...parsedParams,
            workspaceId: workspace.id,
            event: "clicks",
            groupBy: "count",
            start: prevPeriod.prevStart,
            end: prevPeriod.prevEnd,
          })
        : Promise.resolve(null),
      prevPeriod
        ? getAnalytics({
            ...parsedParams,
            workspaceId: workspace.id,
            event: "clicks",
            groupBy: "count",
            unique: true,
            start: prevPeriod.prevStart,
            end: prevPeriod.prevEnd,
          })
        : Promise.resolve(null),
    ]);

    const totalClicksCount = (totalClicks as any)?.clicks || 0;
    const uniqueClicksCount = (uniqueClicks as any)?.clicks || 0;
    const prevTotalClicksCount = (prevTotalClicks as any)?.clicks || 0;
    const prevUniqueClicksCount = (prevUniqueClicks as any)?.clicks || 0;

    const calculatePercentageChange = (current: number, previous: number): number | null => {
      if (previous === 0) return current > 0 ? 100 : null;
      return Math.round(((current - previous) / previous) * 100);
    };

    const qrTypeMap = new Map<string, number>();
    if (Array.isArray(topLink)) {
      topLink.forEach((link: any) => {
        const qrType = link.qr?.qrType || "unknown";
        const clicks = link.clicks || 0;
        qrTypeMap.set(qrType, (qrTypeMap.get(qrType) || 0) + clicks);
      });
    }
    const topQrTypeEntry = Array.from(qrTypeMap.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const stats = {
      totalClicks: totalClicksCount,
      uniqueClicks: uniqueClicksCount,
      totalClicksChange: calculatePercentageChange(totalClicksCount, prevTotalClicksCount),
      uniqueClicksChange: calculatePercentageChange(uniqueClicksCount, prevUniqueClicksCount),
      comparisonPeriod: prevPeriod ? `vs ${prevPeriod.comparisonLabel} days` : null,
      topDevice: Array.isArray(topDevice) && topDevice.length > 0
        ? {
            name: topDevice[0].device,
            value: topDevice[0].clicks,
            percentage: totalClicksCount
              ? Math.round((topDevice[0].clicks / totalClicksCount) * 100)
              : 0,
          }
        : null,
      topBrowser: Array.isArray(topBrowser) && topBrowser.length > 0
        ? {
            name: topBrowser[0].browser,
            value: topBrowser[0].clicks,
            percentage: totalClicksCount
              ? Math.round((topBrowser[0].clicks / totalClicksCount) * 100)
              : 0,
          }
        : null,
      topOS: Array.isArray(topOS) && topOS.length > 0
        ? {
            name: topOS[0].os,
            value: topOS[0].clicks,
            percentage: totalClicksCount
              ? Math.round((topOS[0].clicks / totalClicksCount) * 100)
              : 0,
          }
        : null,
      topCountry: Array.isArray(topCountry) && topCountry.length > 0
        ? {
            name: topCountry[0].country,
            value: topCountry[0].clicks,
            percentage: totalClicksCount
              ? Math.round((topCountry[0].clicks / totalClicksCount) * 100)
              : 0,
          }
        : null,
      topQrType: topQrTypeEntry
        ? {
            name: topQrTypeEntry[0],
            value: topQrTypeEntry[1],
            percentage: totalClicksCount
              ? Math.round((topQrTypeEntry[1] / totalClicksCount) * 100)
              : 0,
          }
        : null,
      topLink: Array.isArray(topLink) && topLink.length > 0
        ? {
            name: topLink[0].qr?.title || topLink[0].shortLink || "Unknown",
            value: topLink[0].clicks,
          }
        : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching analytics stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics stats" },
      { status: 500 }
    );
  }
});

