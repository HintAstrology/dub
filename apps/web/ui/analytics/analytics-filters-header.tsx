"use client";

import {
  INTERVAL_DISPLAYS,
  VALID_ANALYTICS_FILTERS,
} from "@/lib/analytics/constants";
import { getStartEndDates } from "@/lib/analytics/utils/get-start-end-dates";
import useWorkspace from "@/lib/swr/use-workspace";
import { LinkProps } from "@/lib/types";
import {
  DateRangePicker,
  Filter,
  TooltipContent,
  useRouterStuff,
} from "@dub/ui";
import {
  APP_DOMAIN,
  capitalize,
  CONTINENTS,
  COUNTRIES,
  getApexDomain,
  getNextPlan,
  linkConstructor,
  nFormatter,
  REGIONS,
} from "@dub/utils";
import { Icon } from "@iconify/react";
import { Switch } from "@radix-ui/themes";
import {
  ComponentProps,
  useCallback,
  useMemo,
  useState,
} from "react";
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
import { LinkIcon } from "../links/link-icon";
import { ANALYTICS_QR_TYPES_DATA } from "../qr-builder/constants/get-qr-config";
import ContinentIcon from "./continent-icon";
import DeviceIcon from "./device-icon";
import { cn } from "@dub/utils";
import { LinkLogo } from "@dub/ui";
import useSWR from "swr";
import { editQueryString } from "@/lib/analytics/utils";
import { fetcher } from "@dub/utils";
import { AnalyticsGroupByOptions, EventType } from "@/lib/analytics/types";

/**
 * Standalone filter option hook that doesn't depend on AnalyticsContext
 */
function useStandaloneFilterOption(
  groupBy: AnalyticsGroupByOptions,
  options?: { cacheOnly?: boolean; filterKey?: string },
  workspaceId?: string,
  queryString?: string,
  selectedTab?: EventType,
) {
  const { slug } = useWorkspace() || {};
  
  const params = new URLSearchParams(
    editQueryString(queryString || "", {
      groupBy,
      event: selectedTab || "clicks",
    })
  );

  if (options?.filterKey) {
    params.delete(options.filterKey);
  }

  const baseApiPath = `/api/analytics/${slug}`;
  const path = `${baseApiPath}?${params.toString()}`;

  const { data, isLoading } = useSWR<any[]>(
    slug && !options?.cacheOnly ? path : null,
    fetcher,
    {
      shouldRetryOnError: true,
      revalidateOnFocus: false,
    }
  );

  return {
    data:
      data?.map((d: any) => ({
        ...d,
        count: d[selectedTab || "clicks"] as number,
      })) ?? null,
    loading: !data && isLoading,
  };
}

export function AnalyticsFiltersHeader() {
  const workspace = useWorkspace();
  const { queryParams, searchParamsObj } = useRouterStuff();
  
  // Wait for workspace to load
  if (!workspace) {
    return null;
  }
  
  const { createdAt, plan, id: workspaceId, slug } = workspace;
  
  // Compute start, end, interval directly from URL params
  const start = searchParamsObj.start ? new Date(searchParamsObj.start) : undefined;
  const end = searchParamsObj.end ? new Date(searchParamsObj.end) : undefined;
  const interval = start || end ? undefined : searchParamsObj.interval ?? "30d";
  const dashboardProps = undefined; // Only used in shared dashboards
  
  // Get selected tab from URL
  const selectedTab = (searchParamsObj.event || "clicks") as EventType;
  
  // Build query string from URL params
  const queryString = new URLSearchParams(searchParamsObj as any).toString();

  const [requestedFilters, setRequestedFilters] = useState<string[]>([]);

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
      if (["interval", "start", "end", "qr"].includes(filter)) return;

      const value = params[filter];
      if (value) {
        filters.push({ key: filter, value });
      }
    });

    return filters;
  }, [searchParamsObj]);

  const isRequested = useCallback(
    (key: string) =>
      requestedFilters.includes(key) ||
      activeFilters.some((af) => af.key === key),
    [requestedFilters, activeFilters]
  );

  const { data: links } = useStandaloneFilterOption(
    "top_links",
    { cacheOnly: !isRequested("link"), filterKey: "domain" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: countries } = useStandaloneFilterOption(
    "countries",
    { cacheOnly: !isRequested("country"), filterKey: "country" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: regions } = useStandaloneFilterOption(
    "regions",
    { cacheOnly: !isRequested("region"), filterKey: "region" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: cities } = useStandaloneFilterOption(
    "cities",
    { cacheOnly: !isRequested("city"), filterKey: "city" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: continents } = useStandaloneFilterOption(
    "continents",
    { cacheOnly: !isRequested("continent"), filterKey: "continent" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: devices } = useStandaloneFilterOption(
    "devices",
    { cacheOnly: !isRequested("device"), filterKey: "device" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: browsers } = useStandaloneFilterOption(
    "browsers",
    { cacheOnly: !isRequested("browser"), filterKey: "browser" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: os } = useStandaloneFilterOption(
    "os",
    { cacheOnly: !isRequested("os"), filterKey: "os" },
    workspaceId,
    queryString,
    selectedTab
  );
  const { data: urls } = useStandaloneFilterOption(
    "top_urls",
    { cacheOnly: !isRequested("url"), filterKey: "url" },
    workspaceId,
    queryString,
    selectedTab
  );

  const filters: ComponentProps<typeof Filter.Select>["filters"] = useMemo(
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
                  })
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
        getOptionIcon: (value) => (
          <ContinentIcon display={value} className="size-2.5" />
        ),
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
    ]
  );

  const onFilterSelect = async (key, value) => {
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

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center md:flex-nowrap lg:gap-2">
      <Filter.Select
        className="w-full sm:w-auto sm:min-w-[140px]"
        filters={filters}
        activeFilters={activeFilters}
        onSelect={onFilterSelect}
        onRemove={(key) =>
          queryParams({
            del: key === "link" ? ["domain", "key"] : key,
            scroll: false,
          })
        }
        onOpenFilter={(key) =>
          setRequestedFilters((rf) => (rf.includes(key) ? rf : [...rf, key]))
        }
      />
      <DateRangePicker
        className="w-full sm:w-auto sm:min-w-[200px]"
        align="end"
        value={
          start && end
            ? {
                from: start,
                to: end,
              }
            : undefined
        }
        presetId={start && end ? undefined : interval ?? "30d"}
        onChange={(range, preset) => {
          if (preset) {
            queryParams({
              del: ["start", "end"],
              set: {
                interval: preset.id,
              },
              scroll: false,
            });
            return;
          }

          if (!range || !range.from || !range.to) return;

          queryParams({
            del: "preset",
            set: {
              start: range.from.toISOString(),
              end: range.to.toISOString(),
            },
            scroll: false,
          });
        }}
        presets={INTERVAL_DISPLAYS.map(({ display, value, shortcut }) => {
          const requiresUpgrade = false;
          const { startDate, endDate } = getStartEndDates({
            interval: value,
            dataAvailableFrom: createdAt,
          });

          return {
            id: value,
            label: display,
            dateRange: {
              from: startDate,
              to: endDate,
            },
            requiresUpgrade,
            tooltipContent: requiresUpgrade ? (
              <UpgradeTooltip rangeLabel={display} plan={plan} />
            ) : undefined,
            shortcut,
          };
        })}
      />
      <div className="flex items-center gap-2 sm:ml-auto">
        <Switch
          id="unique"
          size="1"
          checked={!!searchParamsObj.unique}
          onCheckedChange={(checked: boolean) => {
            if (checked) {
              queryParams({
                set: { unique: "true" },
                scroll: false,
              });
            } else {
              queryParams({
                del: "unique",
                scroll: false,
              });
            }
          }}
        />
        <label htmlFor="unique" className="cursor-pointer whitespace-nowrap text-sm font-medium text-neutral-700">
          Unique Scans
        </label>
      </div>
    </div>
  );
}

function UpgradeTooltip({
  rangeLabel,
  plan,
}: {
  rangeLabel: string;
  plan?: string;
}) {
  const { slug } = useWorkspace();
  const isAllTime = rangeLabel === "All Time";

  return (
    <TooltipContent
      title={`${rangeLabel} can only be viewed on a ${isAllTime ? "Business" : getNextPlan(plan).name} plan or higher. Upgrade now to view more stats.`}
      cta={`Upgrade to ${isAllTime ? "Business" : getNextPlan(plan).name}`}
      href={slug ? `/${slug}/upgrade` : APP_DOMAIN}
    />
  );
}

