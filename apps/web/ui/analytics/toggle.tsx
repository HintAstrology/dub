import useWorkspace from "@/lib/swr/use-workspace";
import {
  BlurImage,
  ExpandingArrow,
  TooltipContent,
  useScroll,
} from "@dub/ui";
import {
  APP_DOMAIN,
  cn,
  DUB_LOGO,
  getApexDomain,
  getNextPlan,
  GOOGLE_FAVICON_URL,
  linkConstructor,
} from "@dub/utils";
import { useContext } from "react";
import { AnalyticsContext } from "./analytics-provider";

export default function   Toggle({
  page = "analytics",
}: {
  page?: "analytics" | "events";
}) {
  const {
    domain,
    key,
    url,
    adminPage,
    demoPage,
    dashboardProps,
  } = useContext(AnalyticsContext);

  const scrolled = useScroll(120);

  return (
    <>
      <div
        className={cn({
          "sticky top-14 z-10 bg-neutral-50": dashboardProps,
          "sticky top-16 z-10 bg-neutral-50": adminPage || demoPage,
          "shadow-md": scrolled && dashboardProps,
        })}
      >
        <div>
          <div
            className={cn(
              "flex w-full flex-col items-center justify-between gap-2 flex-nowrap md:flex-row",
              {
                "flex-col md:flex-row": !key,
                "items-center": key,
              },
            )}
          >
            {dashboardProps && (
              <a
                className="group flex items-center text-lg font-semibold text-neutral-800"
                href={linkConstructor({ domain, key })}
                target="_blank"
                rel="noreferrer"
              >
                <BlurImage
                  alt={url || "Dub.co"}
                  src={
                    url
                      ? `${GOOGLE_FAVICON_URL}${getApexDomain(url)}`
                      : DUB_LOGO
                  }
                  className="mr-2 h-6 w-6 flex-shrink-0 overflow-hidden rounded-full"
                  width={48}
                  height={48}
                />
                <p className="max-w-[192px] truncate sm:max-w-[400px]">
                  {linkConstructor({
                    domain,
                    key,
                    pretty: true,
                  })}
                </p>
                <ExpandingArrow className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
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
