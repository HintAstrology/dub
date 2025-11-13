import { getAnalytics } from "@/lib/analytics/get-analytics";
import { validDateRangeForPlan } from "@/lib/analytics/utils";
import { withWorkspace } from "@/lib/auth";
import { getDomainOrThrow } from "@/lib/api/domains/get-domain-or-throw";
import { analyticsQuerySchema } from "@/lib/zod/schemas/analytics";
import { getSearchParams } from "@dub/utils";
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
    const [
      totalClicks,
      uniqueClicks,
      topDevice,
      topBrowser,
      topOS,
      topCountry,
      topLink,
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
    ]);

    // Process the data to extract top items
    const totalClicksCount = (totalClicks as any)?.clicks || 0;
    const uniqueClicksCount = (uniqueClicks as any)?.clicks || 0;

    const stats = {
      totalClicks: totalClicksCount,
      uniqueClicks: uniqueClicksCount,
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

