"use client";

import {
  INTERVAL_DISPLAYS,
  VALID_ANALYTICS_FILTERS,
} from "@/lib/analytics/constants";
import { AnalyticsGroupByOptions, EventType } from "@/lib/analytics/types";
import { editQueryString } from "@/lib/analytics/utils";
import { getStartEndDates } from "@/lib/analytics/utils/get-start-end-dates";
import useWorkspace from "@/lib/swr/use-workspace";
import { LinkProps } from "@/lib/types";
import {
  Button,
  DateRangePicker,
  Filter,
  LinkLogo,
  TooltipContent,
  useRouterStuff,
} from "@dub/ui";
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
  Xmark,
} from "@dub/ui/icons";
import {
  APP_DOMAIN,
  capitalize,
  cn,
  CONTINENTS,
  COUNTRIES,
  fetcher,
  getApexDomain,
  getNextPlan,
  linkConstructor,
  nFormatter,
  REGIONS,
} from "@dub/utils";
import { Icon } from "@iconify/react";
import { Switch } from "@radix-ui/themes";
import { ComponentProps, useMemo } from "react";
import useSWR from "swr";
import { LinkIcon } from "../links/link-icon";
import ContinentIcon from "./continent-icon";
import DeviceIcon from "./device-icon";
import { ANALYTICS_QR_TYPES_DATA } from "../qr-builder-new/constants/get-qr-config";

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

export function AnalyticsFiltersHeader() {
  const workspace = useWorkspace();
  const { queryParams, searchParamsObj } = useRouterStuff();

  const { createdAt, plan, id: workspaceId, slug } = workspace || {};

  const start = searchParamsObj.start
    ? new Date(searchParamsObj.start)
    : undefined;
  const end = searchParamsObj.end ? new Date(searchParamsObj.end) : undefined;
  const interval = start || end ? undefined : searchParamsObj.interval ?? "30d";
  const dashboardProps = undefined; // Only used in shared dashboards

  const selectedTab = (searchParamsObj.event || "clicks") as EventType;

  const queryString = new URLSearchParams(searchParamsObj as any).toString();

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

  if (!workspace) {
    return null;
  }

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

  const hasActiveFilters = activeFilters.length > 0;

  const clearAllFilters = () => {
    const filtersToDelete = activeFilters
      .map((f) => (f.key === "link" ? ["domain", "key"] : f.key))
      .flat();
    queryParams({
      del: filtersToDelete,
      scroll: false,
    });
  };

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:items-center lg:flex-nowrap lg:gap-2">
      <Filter.Select
        className={cn(
          "w-full text-secondary [&_svg]:text-secondary md:w-auto md:min-w-[140px]",
          hasActiveFilters && "border-secondary"
        )}
        filters={filters}
        activeFilters={activeFilters}
        onSelect={onFilterSelect}
        onRemove={(key) =>
          queryParams({
            del: key === "link" ? ["domain", "key"] : key,
            scroll: false,
          })
        }
      />
      <DateRangePicker
        className={cn(
          "w-full text-secondary [&_svg]:text-secondary md:w-auto md:min-w-[200px]",
          (start || end || interval) && "border-secondary"
        )}
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

      <div className="flex items-center gap-2 md:ml-auto">
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
        <label
          htmlFor="unique"
          className="cursor-pointer whitespace-nowrap text-sm font-medium text-neutral-700"
        >
          Unique Scans
        </label>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="h-10 w-full gap-2 md:w-auto"
          icon={<Xmark className="h-4 w-4" />}
          onClick={clearAllFilters}
          text="Clear"
        />
      )}
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
