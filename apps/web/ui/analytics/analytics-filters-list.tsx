"use client";

import { VALID_ANALYTICS_FILTERS } from "@/lib/analytics/constants";
import { AnalyticsGroupByOptions, EventType } from "@/lib/analytics/types";
import { editQueryString } from "@/lib/analytics/utils";
import useWorkspace from "@/lib/swr/use-workspace";
import { cn, fetcher, linkConstructor, nFormatter } from "@dub/utils";
import { Filter, useRouterStuff } from "@dub/ui";
import {
  Cube,
  FlagWavy,
  Hyperlink,
  LinkBroken,
  LocationPin,
  MapPosition,
  MobilePhone,
  OfficeBuilding,
  Sliders,
  Window,
} from "@dub/ui/icons";
import {
  capitalize,
  CONTINENTS,
  COUNTRIES,
  getApexDomain,
  REGIONS,
} from "@dub/utils";
import { LinkLogo } from "@dub/ui";
import { LinkProps } from "@/lib/types";
import { Icon } from "@iconify/react";
import { ComponentProps, useContext, useMemo } from "react";
import useSWR from "swr";
import { LinkIcon } from "../links/link-icon";
import { ANALYTICS_QR_TYPES_DATA } from "../qr-builder-new/constants/get-qr-config";
import { AnalyticsContext } from "./analytics-provider";
import DeviceIcon from "./components/device-icon";

function useStandaloneFilterOption(
  groupBy: AnalyticsGroupByOptions,
  options?: { cacheOnly?: boolean; filterKey?: string },
  workspaceId?: string,
  queryString?: string,
  selectedTab?: EventType,
) {
  const params = useMemo(() => {
    const p = new URLSearchParams(
      editQueryString(queryString || "", {
        groupBy,
        event: selectedTab || "clicks",
      }),
    );

    if (options?.filterKey) {
      p.delete(options.filterKey);
    }

    if (workspaceId) {
      p.set("workspaceId", workspaceId);
    }

    return p;
  }, [queryString, groupBy, selectedTab, options?.filterKey, workspaceId]);

  const baseApiPath = `/api/analytics`;
  const path = `${baseApiPath}?${params.toString()}`;

  const { data, isLoading, error } = useSWR<any[]>(
    workspaceId && !options?.cacheOnly ? path : null,
    fetcher,
    {
      shouldRetryOnError: true,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      keepPreviousData: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    },
  );

  return {
    data:
      data?.map((d: any) => ({
        ...d,
        count: d[selectedTab || "clicks"] as number,
      })) ?? null,
    loading: isLoading && !error,
  };
}

export function AnalyticsFiltersList() {
  const workspace = useWorkspace();
  const { queryParams, searchParamsObj } = useRouterStuff();
  const { queryString } = useContext(AnalyticsContext);

  const { id: workspaceId } = workspace || {};
  const selectedTab = (searchParamsObj.event || "clicks") as EventType;
  const dashboardProps = undefined; // Only used in shared dashboards

  // Calculate active filters
  const activeFilters = useMemo(() => {
    const { domain, key, root, folderId, ...params } = searchParamsObj;
    const filters = [
      ...(domain && !key ? [{ key: "domain", value: domain }] : []),
      ...(domain && key
        ? [
            {
              key: "link",
              value: linkConstructor({ domain, key, pretty: true }),
            },
          ]
        : []),
      ...(root ? [{ key: "root", value: root === "true" }] : []),
      ...(folderId ? [{ key: "folderId", value: folderId }] : []),
    ];

    VALID_ANALYTICS_FILTERS.forEach((filter) => {
      if (["domain", "key", "tagId", "tagIds", "root"].includes(filter)) return;
      if (["interval", "start", "end", "qr", "event"].includes(filter)) return;

      const value = params[filter];
      if (value) {
        filters.push({ key: filter, value });
      }
    });

    return filters;
  }, [searchParamsObj]);

  // Fetch filter options
  const { data: links } = useStandaloneFilterOption(
    "top_links",
    { cacheOnly: false, filterKey: "domain" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: countries } = useStandaloneFilterOption(
    "countries",
    { cacheOnly: false, filterKey: "country" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: regions } = useStandaloneFilterOption(
    "regions",
    { cacheOnly: false, filterKey: "region" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: cities } = useStandaloneFilterOption(
    "cities",
    { cacheOnly: false, filterKey: "city" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: continents } = useStandaloneFilterOption(
    "continents",
    { cacheOnly: false, filterKey: "continent" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: devices } = useStandaloneFilterOption(
    "devices",
    { cacheOnly: false, filterKey: "device" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: browsers } = useStandaloneFilterOption(
    "browsers",
    { cacheOnly: false, filterKey: "browser" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: os } = useStandaloneFilterOption(
    "os",
    { cacheOnly: false, filterKey: "os" },
    workspaceId,
    queryString,
    selectedTab,
  );
  const { data: urls } = useStandaloneFilterOption(
    "top_urls",
    { cacheOnly: false, filterKey: "url" },
    workspaceId,
    queryString,
    selectedTab,
  );

  // Build filters array for Filter.List
  const filters: ComponentProps<typeof Filter.List>["filters"] = useMemo(
    () => [
      ...(dashboardProps
        ? []
        : [
            {
              key: "link",
              icon: Hyperlink,
              label: "QR name",
              getOptionIcon: (value, props) => {
                const url = props.option?.data?.url;
                const [domain, key] = value.split("/");
                return <LinkIcon url={url} domain={domain} linkKey={key} />;
              },
              options:
                links?.map(
                  ({
                    domain,
                    key,
                    url,
                    count,
                    qr,
                  }: LinkProps & {
                    count?: number;
                    qr?: { title: string };
                  }) => ({
                    value: linkConstructor({ domain, key, pretty: true }),
                    label: qr?.title,
                    right: nFormatter(count, { full: true }),
                    data: { url },
                  }),
                ) ?? null,
            },
            {
              key: "qrType",
              icon: Sliders,
              label: "QR type",
              options: ANALYTICS_QR_TYPES_DATA.map((type) => ({
                value: type.id,
                icon: () => <Icon icon={type.icon} className={cn("h-4 w-4")} />,
                label: type.label,
              })),
              separatorAfter: !dashboardProps,
            },
          ]),
      {
        key: "country",
        icon: FlagWavy,
        label: "Country",
        getOptionIcon: (value) => (
          <img
            alt={value}
            src={`https://flag.vercel.app/m/${value}.svg`}
            className="h-2.5 w-4"
          />
        ),
        getOptionLabel: (value) => COUNTRIES[value],
        options:
          countries?.map(({ country, count }) => ({
            value: country,
            label: COUNTRIES[country],
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "city",
        icon: OfficeBuilding,
        label: "City",
        options:
          cities?.map(({ city, country, count }) => ({
            value: city,
            label: city,
            icon: (
              <img
                alt={country}
                src={`https://flag.vercel.app/m/${country}.svg`}
                className="h-2.5 w-4"
              />
            ),
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "region",
        icon: LocationPin,
        label: "Region",
        options:
          regions?.map(({ region, country, count }) => ({
            value: region,
            label: REGIONS[region] || region.split("-")[1],
            icon: (
              <img
                alt={country}
                src={`https://flag.vercel.app/m/${country}.svg`}
                className="h-2.5 w-4"
              />
            ),
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "continent",
        icon: MapPosition,
        label: "Continent",
        getOptionIcon: (value) => null,
        getOptionLabel: (value) => CONTINENTS[value],
        options:
          continents?.map(({ continent, count }) => ({
            value: continent,
            label: CONTINENTS[continent],
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "device",
        icon: MobilePhone,
        label: "Device",
        getOptionIcon: (value) => (
          <DeviceIcon
            display={capitalize(value) ?? value}
            tab="devices"
            className="h-4 w-4"
          />
        ),
        options:
          devices?.map(({ device, count }) => ({
            value: device,
            label: device,
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "browser",
        icon: Window,
        label: "Browser",
        getOptionIcon: (value) => (
          <DeviceIcon display={value} tab="browsers" className="h-4 w-4" />
        ),
        options:
          browsers?.map(({ browser, count }) => ({
            value: browser,
            label: browser,
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "os",
        icon: Cube,
        label: "OS",
        getOptionIcon: (value) => (
          <DeviceIcon display={value} tab="os" className="h-4 w-4" />
        ),
        options:
          os?.map(({ os, count }) => ({
            value: os,
            label: os,
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
      {
        key: "url",
        icon: LinkBroken,
        label: "Destination URL",
        getOptionIcon: (_, props) => (
          <LinkLogo
            apexDomain={getApexDomain(props.option?.value)}
            className="size-4 sm:size-4"
          />
        ),
        options:
          urls?.map(({ url, count }) => ({
            value: url,
            label: url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
            right: nFormatter(count, { full: true }),
          })) ?? null,
      },
    ],
    [
      dashboardProps,
      links,
      countries,
      cities,
      regions,
      continents,
      devices,
      browsers,
      os,
      urls,
    ],
  );

  const onFilterSelect = (key: string, value: string) => {
    let del: string | string[] = "page";
    if (key === "qrType") {
      del = ["domain", "key", "page"];
    }
    if (key === "link") {
      del = ["qrType", "page"];
    }
    queryParams({
      set:
        key === "link"
          ? {
              domain: new URL(`https://${value}`).hostname,
              key: new URL(`https://${value}`).pathname.slice(1) || "_root",
            }
          : {
              [key]: value,
            },
      del,
      scroll: false,
    });
  };

  const onRemoveFilter = (key: string, value?: any) => {
    queryParams({
      del: key === "link" ? ["domain", "key"] : key,
      scroll: false,
    });
  };

  const onRemoveAll = () => {
    const filtersToDelete = activeFilters
      .map((f) => (f.key === "link" ? ["domain", "key"] : f.key))
      .flat();
    queryParams({
      del: filtersToDelete,
      scroll: false,
    });
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .analytics-filters-wrapper .border-neutral-200 {
            border-color: hsl(var(--chart-4)) !important;
          }
        `
      }} />
      <div className="mx-auto w-full mb-4">
        <div className={cn(
          "analytics-filters-wrapper flex w-full show-clear-filters flex-wrap items-start gap-4 sm:flex-nowrap",
        )}>
          <div className="flex grow flex-wrap gap-x-4 gap-y-2">
            <Filter.List
              filters={filters}
              activeFilters={activeFilters}
              onRemove={onRemoveFilter}
              onRemoveAll={onRemoveAll}
              onSelect={onFilterSelect}
              isOptionDropdown={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}

