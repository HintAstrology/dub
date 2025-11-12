import { VALID_ANALYTICS_ENDPOINTS } from "@/lib/analytics/constants";
import { getAnalytics } from "@/lib/analytics/get-analytics";
import { getFolderIdsToFilter } from "@/lib/analytics/get-folder-ids-to-filter";
import { EventType } from "@/lib/analytics/types.ts";
import { validDateRangeForPlan } from "@/lib/analytics/utils";
import { getDomainOrThrow } from "@/lib/api/domains/get-domain-or-throw";
import { getLinkOrThrow } from "@/lib/api/links/get-link-or-throw";
import { throwIfClicksUsageExceeded } from "@/lib/api/links/usage-checks";
import { withWorkspace } from "@/lib/auth";
import { verifyFolderAccess } from "@/lib/folder/permissions";
import {
  analyticsPathParamsSchema,
  analyticsQuerySchema,
} from "@/lib/zod/schemas/analytics";
import { Link } from "@dub/prisma/client";
import { NextResponse } from "next/server";
import { utils, write } from 'xlsx';

function convertToCSV(data: any[]) {
  const headers = Object.keys(data[0] || {}).join(',');
  const rows = data.map((row) => Object.values(row).join(',')).join('\n');
  return `${headers}\n${rows}`;
}

async function convertToXLSX(data: any[]) {
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(data);
  utils.book_append_sheet(wb, ws, 'Analytics');
  return write(wb, { type: 'buffer', bookType: 'xlsx' });
}

type Endpoint =
  | "count"
  | "timeseries"
  | "continents"
  | "regions"
  | "countries"
  | "cities"
  | "devices"
  | "browsers"
  | "os"
  | "trigger"
  | "triggers"
  | "referers"
  | "referer_urls"
  | "top_links"
  | "top_urls"
  | "utm_sources"
  | "utm_mediums"
  | "utm_campaigns"
  | "utm_terms"
  | "utm_contents";

// GET /api/analytics – get analytics
export const GET = withWorkspace( // @ts-ignore
  async ({ params, searchParams, workspace, session }) => {
    throwIfClicksUsageExceeded(workspace);

    let { eventType: oldEvent, endpoint: oldType } =
      analyticsPathParamsSchema.parse(params);

    // for backwards compatibility (we used to support /analytics/[endpoint] as well)
    if (
      !oldType &&
      oldEvent &&
      VALID_ANALYTICS_ENDPOINTS.includes(oldEvent as Endpoint)
    ) {
      oldType = oldEvent;
      oldEvent = undefined;
    }

    const parsedParams = analyticsQuerySchema.parse(searchParams);

    let {
      event,
      format,
      interval,
      start,
      end,
      linkId,
      externalId,
      domain,
      key,
      folderId,
    } = parsedParams;

    let link: Link | null = null;

    event = (oldEvent || event) as EventType;

    if (domain) {
      await getDomainOrThrow({ workspace, domain: domain as string });
    }

    if (linkId || externalId || (domain && key)) {
      link = await getLinkOrThrow({
        workspaceId: workspace.id,
        linkId: linkId as string,
        externalId: externalId as string,
        domain: domain as string,
        key: key as string,
      });
    }

    const folderIdToVerify = link?.folderId || folderId;

    if (folderIdToVerify) {
      await verifyFolderAccess({
        workspace,
        userId: session.user.id,
        folderId: folderIdToVerify as string,
        requiredPermission: "folders.read",
      });
    }

    validDateRangeForPlan({
      plan: workspace.plan,
      dataAvailableFrom: workspace.createdAt,
      interval: interval as string,
      start: start as Date,
      end: end as Date,
      throwError: true,
    });

    const folderIds = folderIdToVerify
      ? undefined
      : await getFolderIdsToFilter({
          workspace,
          userId: session.user.id,
        });

    // Identify the request is from deprecated clicks endpoint
    // (/api/analytics/clicks)
    // (/api/analytics/count)
    // (/api/analytics/clicks/clicks)
    // (/api/analytics/clicks/count)
    const isDeprecatedClicksEndpoint =
      oldEvent === "clicks" || oldType === "count";

    const response = await getAnalytics({
      ...parsedParams,
      event,
      groupBy: 'download',
      ...(link && { linkId: link.id }),
      workspaceId: workspace.id,
      isDeprecatedClicksEndpoint,
      dataAvailableFrom: workspace.createdAt,
      folderIds,
    });
    
    // map response to desired columns`
    const mappedData = response.map((row) => ({
      'QR name': row.qr_name || '',
      'QR type': row.qr_type || '',
      'Date of QR scanning': row.timestamp,
      'Scans by country': row.country,
      'Scans by city': row.city,
      'Scans by region': row.region,
      'Scans by continent': row.continent,
      'Scans by device': row.device,
      'Scans by OS': row.os,
      'Scans by browser': row.browser,
      'Scans by destination url': row.url,
    }));

    if (format === 'csv' || format === 'xlsx') {
      const headers = new Headers({
        'Content-Disposition': `attachment; filename="analytics.${format}"`,
        'Content-Type':
          format === 'csv'
            ? 'text/csv; charset=utf-8'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    
      const content =
        format === 'csv'
          ? convertToCSV(mappedData)
          : await convertToXLSX(mappedData);
    
      return new NextResponse(content, { headers });
    }
  },
  {
    requiredPermissions: ["analytics.read"],
  },
);
