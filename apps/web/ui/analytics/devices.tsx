import {
  SINGULAR_ANALYTICS_ENDPOINTS,
  TRIGGER_DISPLAY,
} from "@/lib/analytics/constants";
import { DeviceTabs } from "@/lib/analytics/types";
import { Modal, useRouterStuff } from "@dub/ui";
import { Cube, CursorRays, MobilePhone, Window } from "@dub/ui/icons";
import { X } from "@/ui/shared/icons";
import { motion } from "framer-motion";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsLoadingSpinner } from "./analytics-loading-spinner";
import { AnalyticsContext } from "./analytics-provider";
import BarList from "./bar-list";
import DeviceIcon from "./device-icon";
import { useAnalyticsFilterOption } from "./utils";

const tabs = [
  { name: "Devices", value: "devices" as const, icon: MobilePhone },
  { name: "Browsers", value: "browsers" as const, icon: Window },
  { name: "OS", value: "os" as const, icon: Cube },
  { name: "Triggers", value: "triggers" as const, icon: CursorRays },
];

const EXPAND_LIMIT = 8;

export default function Devices() {
  const { queryParams, searchParams } = useRouterStuff();
  const { selectedTab, saleUnit } = useContext(AnalyticsContext);
  const dataKey = selectedTab === "sales" ? saleUnit : "count";

  const [tab, setTab] = useState<DeviceTabs>("devices");
  const [showModal, setShowModal] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const { data, loading } = useAnalyticsFilterOption(tab);
  const singularTabName = SINGULAR_ANALYTICS_ENDPOINTS[tab];
  
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

  const getBarListData = () => {
    return data
      ?.map((d) => ({
        icon: (
          <DeviceIcon
            display={d[singularTabName]}
            tab={tab}
            className="h-4 w-4"
          />
        ),
        title:
          tab === "triggers"
            ? TRIGGER_DISPLAY[d.trigger]
            : d[singularTabName],
        href: queryParams({
          ...(searchParams.has(singularTabName)
            ? { del: singularTabName }
            : {
                set: {
                  [singularTabName]: d[singularTabName],
                },
              }),
          getNewPath: true,
        }) as string,
        value: d[dataKey] || 0,
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
            tab={singularTabName}
            data={getBarListData()}
            unit={selectedTab}
            maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
            barBackground="bg-green-100"
            hoverBackground="hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent hover:border-green-500"
            setShowModal={setShowModal}
          />
        )}
      </Modal>

      <Card className="gap-4 pt-6">
        <CardContent className="relative">
          <Tabs value={tab} onValueChange={(v) => setTab(v as DeviceTabs)} className="w-full">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="relative w-full flex-1 overflow-x-auto scrollbar-hide">
                <TabsList className="relative flex w-max justify-start rounded-none border-b bg-transparent p-0">
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
                    layoutId="underline-devices"
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
              </div>
              <div className="flex shrink-0 items-center gap-1 text-neutral-500">
                <p className="whitespace-nowrap text-xs uppercase">
                  {selectedTab === "clicks" ? "scans" : selectedTab}
                </p>
              </div>
            </div>

            {tabs.map((tabItem) => (
              <TabsContent key={tabItem.value} value={tabItem.value}>
                {data ? (
                  data.length > 0 ? (
                    <BarList
                      tab={singularTabName}
                      data={getBarListData()}
                      unit={selectedTab}
                      maxValue={Math.max(...(data?.map((d) => d[dataKey] ?? 0) ?? [0]))}
                      barBackground="bg-green-100"
                      hoverBackground="hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent hover:border-green-500"
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

          <div className="px-6">
            {hasMore && (
              <div className="relative z-10 flex w-full items-end pb-4 pt-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="group relative flex w-full items-center justify-center"
                >
                  <div className="border-border-500 rounded-md border bg-white px-2.5 py-1 text-sm text-neutral-950 group-hover:bg-neutral-100 group-active:border-neutral-300">
                    View All
                  </div>
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
