"use client";

import { LinkProps } from "@/lib/types";
import { LinkifyTooltipContent, Tooltip, useMediaQuery } from "@dub/ui";
import { cn, getPrettyUrl } from "@dub/utils";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  ComponentProps,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { areEqual, FixedSizeList } from "react-window";
import { AnalyticsContext } from "./analytics-provider";
import LinkPreviewTooltip from "./link-preview";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

export default function BarList({
  tab,
  unit,
  data,
  barBackground,
  hoverBackground,
  maxValue,
  setShowModal,
  limit,
}: {
  tab: string;
  unit: string;
  data: {
    icon: ReactNode;
    title: string;
    href?: string;
    value: number;
    linkId?: string;
  }[];
  maxValue: number;
  barBackground: string;
  hoverBackground: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  limit?: number;
}) {
  const [search, setSearch] = useState("");

  // TODO: mock pagination for better perf in React
  const filteredData = useMemo(() => {
    if (limit) {
      return data.slice(0, limit);
    } else {
      return search
        ? data.filter((d) =>
            d.title.toLowerCase().includes(search.toLowerCase()),
          )
        : data;
    }
  }, [data, limit, search]);

  const { isMobile } = useMediaQuery();

  const virtualize = filteredData.length > 100;

  const itemProps = filteredData.map((data, index) => ({
    ...data,
    maxValue,
    tab,
    unit,
    setShowModal,
    barBackground,
    hoverBackground,
    barColor: chartColors[index % chartColors.length],
  }));

  const bars = (
    <NumberFlowGroup>
      <div className="relative grid h-full auto-rows-min grid-cols-1">
        {virtualize ? (
          <AutoSizer>
            {({ width, height }) => (
              <FixedSizeList
                width={width}
                height={height}
                itemCount={filteredData.length}
                itemSize={48}
                itemData={itemProps}
              >
                {VirtualLineItem}
              </FixedSizeList>
            )}
          </AutoSizer>
        ) : (
          filteredData.map((data, idx) => (
            <LineItem key={idx} {...itemProps[idx]} />
          ))
        )}
      </div>
    </NumberFlowGroup>
  );

  if (limit) {
    return bars;
  } else {
    return (
      <>
        <div className="relative px-4 py-3">
          <div className="pointer-events-none absolute inset-y-0 left-7 flex items-center">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            autoFocus={!isMobile}
            className="w-full rounded-md border border-neutral-300 py-2 pl-10 text-black placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-4 focus:ring-neutral-200 sm:text-sm"
            placeholder={`Search ${tab}...`}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="h-[50vh] overflow-auto pb-4 md:h-[40vh]">{bars}</div>
      </>
    );
  }
}

export function LineItem({
  icon,
  title,
  href,
  value,
  maxValue,
  tab,
  unit,
  setShowModal,
  barBackground,
  hoverBackground,
  linkData,
  barColor,
}: {
  icon: ReactNode;
  title: string;
  href?: string;
  value: number;
  maxValue: number;
  tab: string;
  unit: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  barBackground: string;
  hoverBackground: string;
  linkData?: LinkProps;
  barColor?: string;
}) {
  const displayTitle = useMemo(() => {
    const text = linkData?.qr?.title || getPrettyUrl(title);
    return text.length > 30 ? `${text.slice(0, 30)}...` : text;
  }, [title, linkData]);

  const { saleUnit } = useContext(AnalyticsContext);

  const As = href ? Link : "div";

  const barWidth = `${(value / (maxValue || 0)) * 100}%`;

  return (
    // @ts-ignore - we know if it's a Link it'll get its href
    <As
      {...(href && {
        href,
        scroll: false,
        onClick: () => setShowModal(false),
      })}
      className={cn(
        `block min-w-0 border-l-2 border-transparent py-1.5 transition-all`,
        href && "hover:bg-muted/50",
      )}
    >
      <div className="group flex items-center justify-between gap-4">
        <div className="relative flex h-9 min-w-0 flex-1 items-center">
          <motion.div
            style={{
              width: barWidth,
              backgroundColor: barColor,
            }}
            className="absolute left-0 h-full origin-left rounded-[0_10px_10px_0]"
            transition={{ ease: "easeOut", duration: 0.3 }}
            initial={{ transform: "scaleX(0)" }}
            animate={{ transform: "scaleX(1)" }}
          />
          <div className="relative z-10 flex items-center gap-3 px-3">
            {icon}
            <span className="truncate text-sm font-medium text-white mix-blend-difference">
              {displayTitle}
            </span>
          </div>
        </div>
        <NumberFlow
          value={
            unit === "sales" && saleUnit === "saleAmount" ? value / 100 : value
          }
          className="z-10 shrink-0 text-sm font-medium text-neutral-600"
          format={
            unit === "sales" && saleUnit === "saleAmount"
              ? {
                  style: "currency",
                  currency: "USD",
                  // @ts-ignore – trailingZeroDisplay is a valid option but TS is outdated
                  trailingZeroDisplay: "stripIfInteger",
                }
              : {
                  notation: value > 999999 ? "compact" : "standard",
                }
          }
        />
      </div>
    </As>
  );
}

const VirtualLineItem = memo(
  ({
    data,
    index,
    style,
  }: {
    data: ComponentProps<typeof LineItem>[];
    index: number;
    style: any;
  }) => {
    const props = data[index];

    return (
      <div style={style}>
        <LineItem {...props} />
      </div>
    );
  },
  areEqual,
);
