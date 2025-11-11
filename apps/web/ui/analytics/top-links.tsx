import { LinkLogo, Modal, useRouterStuff } from "@dub/ui";
import { Globe, Hyperlink } from "@dub/ui/icons";
import { X } from "@/ui/shared/icons";
import { cn, getApexDomain } from "@dub/utils";
import { motion } from "framer-motion";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import BarList from "./bar-list";
import { useAnalyticsFilterOption } from "./utils";

const tabs = [
  {
    name: "QR Name",
    value: "links",
    icon: Globe,
  },
  {
    name: "Destination URLs",
    value: "urls",
    icon: Hyperlink,
  },
];

const EXPAND_LIMIT = 8;

export default function TopLinks() {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [tab, setTab] = useState<"links" | "urls">("links");
  const [showModal, setShowModal] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  
  const { data } = useAnalyticsFilterOption({
    groupBy: `top_${tab}`,
  });
  
  const selectedTabData = tabs.find(t => t.value === tab) || tabs[0];
  const hasMore = (data?.length ?? 0) > EXPAND_LIMIT;

  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex(t => t.value === tab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [tab]);

  const getBarListData = (tabValue: string) => {
    return data
      ?.map((d) => ({
        icon: (
          <LinkLogo
            apexDomain={getApexDomain(d.url)}
            className="size-5 sm:size-5"
          />
        ),
        title:
          (tabValue === "links" && d["shortLink"]
            ? d["shortLink"]
            : d.url) ?? "Unknown",
        href: queryParams({
          ...((tabValue === "links" &&
            searchParams.has("domain") &&
            searchParams.has("key")) ||
          (tabValue === "urls" && searchParams.has("url"))
            ? {
                del:
                  tabValue === "links"
                    ? ["domain", "key"]
                    : "url",
              }
            : {
                set: {
                  ...(tabValue === "links"
                    ? { domain: d.domain, key: d.key || "_root" }
                    : {
                        url: d.url,
                      }),
                },
              }),
          getNewPath: true,
        }) as string,
        value: d[dataKey] || 0,
        ...(tabValue === "links" && { linkData: d }),
      }))
      ?.sort((a, b) => b.value - a.value) || [];
  };

  return (
    <>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        className="max-w-lg px-0"
      >
        <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
          <h1 className="text-lg font-semibold">{selectedTabData.name}</h1>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="active:bg-border-500 group relative -right-2 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:right-0 md:block"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {data && data.length > 0 && (
          <BarList
            tab={tab}
            data={getBarListData(tab)}
            unit={selectedTab}
            maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
            barBackground="bg-orange-100"
            hoverBackground="hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent hover:border-orange-500"
            setShowModal={setShowModal}
          />
        )}
      </Modal>

      <Card className="md:col-span-2 pt-6">
        <CardContent className="relative">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "links" | "urls")} className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <TabsList className="relative w-max justify-start rounded-none border-b bg-transparent p-0">
                {tabs.map(({ icon: Icon, name, value }, index) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    className="relative z-10 flex items-center gap-1.5 rounded-none border-0 bg-transparent px-3 data-[state=active]:bg-transparent data-[state=active]:text-secondary data-[state=active]:shadow-none"
                  >
                    <Icon className="h-4 w-4" />
                    {name}
                  </TabsTrigger>
                ))}
                <motion.div
                  className="absolute bottom-0 z-20 h-0.5 bg-secondary"
                  layoutId="underline"
                  style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                  }}
                />
              </TabsList>
              <div className="flex items-center gap-1 text-neutral-500">
                <p className="text-xs uppercase">
                  {selectedTab === "clicks" ? "scans" : selectedTab}
                </p>
              </div>
            </div>

            {tabs.map((tabItem) => (
              <TabsContent key={tabItem.value} value={tabItem.value}>
                {data ? (
                  data.length > 0 ? (
                    <BarList
                      tab={tabItem.value as "links" | "urls"}
                      data={getBarListData(tabItem.value)}
                      unit={selectedTab}
                      maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                      barBackground="bg-orange-100"
                      hoverBackground="hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent hover:border-orange-500"
                      setShowModal={setShowModal}
                      limit={EXPAND_LIMIT}
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center">
                      <p className="text-sm text-neutral-600">No data available</p>
                    </div>
                  )
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <AnalyticsLoadingSpinner />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {hasMore && (
            <div className="absolute bottom-0 left-0 z-10 flex w-full items-end">
              <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-white" />
              <button
                onClick={() => setShowModal(true)}
                className="group relative flex w-full items-center justify-center py-4"
              >
                <div className="border-border-500 rounded-md border bg-white px-2.5 py-1 text-sm text-neutral-950 group-hover:bg-neutral-100 group-active:border-neutral-300">
                  View All
                </div>
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
