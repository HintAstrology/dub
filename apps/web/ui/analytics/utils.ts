import { AnalyticsGroupByOptions } from "@/lib/analytics/types";
import { editQueryString } from "@/lib/analytics/utils";
import { fetcher } from "@dub/utils";
import { useContext, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { AnalyticsContext } from "./analytics-provider";

type AnalyticsFilterResult = {
  data: ({ count?: number } & Record<string, any>)[] | null;
  loading: boolean;
  path?:string;
};

/**
 * Fetches event counts grouped by the specified filter
 *
 * @param groupByOrParams Either a groupBy option or a query parameter object including groupBy
 * @param options Additional options
 */
export function useAnalyticsFilterOption(
  groupByOrParams:
    | AnalyticsGroupByOptions
    | ({ groupBy: AnalyticsGroupByOptions } & Record<string, any>),
  options?: { cacheOnly?: boolean, filterKey?: string },
): AnalyticsFilterResult {
  const { cache } = useSWRConfig();
  const { baseApiPath, queryString, selectedTab, requiresUpgrade } =
    useContext(AnalyticsContext);

  const params = new URLSearchParams(editQueryString(queryString, {
    ...(typeof groupByOrParams === "string"
      ? { groupBy: groupByOrParams }
      : groupByOrParams),
  }));
  
  if (options?.filterKey) {
    params.delete(options.filterKey);
  }

  const cachePath = `${baseApiPath}?${params.toString()}`;

  const enabled = !options?.cacheOnly || [...cache.keys()].includes(cachePath);

  const groupBy = typeof groupByOrParams === "string" 
    ? groupByOrParams 
    : groupByOrParams.groupBy;

  const { data, isLoading } = useSWR<Record<string, any>[] | Record<string, any>>(
  enabled ? cachePath : null,
    fetcher,
    {
      shouldRetryOnError: !requiresUpgrade,
    },
  );

  // When groupBy is "count", the backend returns a single object, not an array
  const normalizedData = useMemo(() => {
    if (!data) return null;
    
    if (groupBy === "count") {
      // Wrap single object in array
      const singleObject = data as Record<string, any>;
      return [{
        ...singleObject,
        count: singleObject[selectedTab] as number | undefined,
        saleAmount: singleObject.saleAmount as number | undefined,
      }];
    }
    
    // For other groupBy options, data is already an array
    const arrayData = data as Record<string, any>[];
    return arrayData.map((d) => ({
      ...d,
      count: d[selectedTab] as number | undefined,
      saleAmount: d.saleAmount as number | undefined,
    }));
  }, [data, groupBy, selectedTab]);

  return {
    data: normalizedData,
    loading: !data || isLoading,
  };
}

export function useDownloadAnalyticsFiltered() {
  const { cache } = useSWRConfig();
  const { baseApiPath, queryString } =
    useContext(AnalyticsContext);

  const download = async (
    fileFormat: 'csv' | 'xlsx',
    options?: { cacheOnly?: boolean; filterKey?: string },
  ): Promise<void> => {
    const params = new URLSearchParams(
      editQueryString(queryString, { groupBy: 'download' }),
    );

    if (options?.filterKey) {
      params.delete(options.filterKey);
    }

    const cachePath = `${baseApiPath}/export_v2?${params.toString()}`;
    const enabled = !options?.cacheOnly || [...cache.keys()].includes(cachePath);

    if (!enabled) return;

    const url = `${cachePath}&format=${fileFormat}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `analytics.${fileFormat}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return { download };
}
