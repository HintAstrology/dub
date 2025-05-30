import { useCheckFolderPermission } from "@/lib/swr/use-folder-permissions";
import useWorkspace from "@/lib/swr/use-workspace";
import { TagProps } from "@/lib/types";
import {
  CardList,
  CursorRays,
  InvoiceDollar,
  Tooltip,
  useMediaQuery,
  UserCheck,
  useRouterStuff,
} from "@dub/ui";
import { cn, currencyFormatter, nFormatter } from "@dub/utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShareDashboardModal } from "../modals/share-dashboard-modal";
import { LinkControls } from "./link-controls";
import { ResponseLink } from "./links-container";
import TagBadge from "./tag-badge";

function useOrganizedTags(tags: ResponseLink["tags"]) {
  const searchParams = useSearchParams();

  const [primaryTag, additionalTags] = useMemo(() => {
    const filteredTagIds =
      searchParams?.get("tagIds")?.split(",")?.filter(Boolean) ?? [];

    /*
      Sort tags so that the filtered tags are first. The most recently selected
      filtered tag (last in array) should be displayed first.
    */
    const sortedTags =
      filteredTagIds.length > 0
        ? [...tags].sort(
            (a, b) =>
              filteredTagIds.indexOf(b.id) - filteredTagIds.indexOf(a.id),
          )
        : tags;

    return [sortedTags?.[0], sortedTags.slice(1)];
  }, [tags, searchParams]);

  return { primaryTag, additionalTags };
}

export function LinkDetailsColumn({ link }: { link: ResponseLink }) {
  const { tags } = link;

  // const { displayProperties } = useContext(LinksDisplayContext);

  const ref = useRef<HTMLDivElement>(null);

  // const { primaryTag, additionalTags } = useOrganizedTags(tags);

  return (
    <div
      ref={ref}
      className="flex h-full items-start justify-end gap-6 md:items-center"
    >
      {/*{displayProperties.includes("tags") && primaryTag && (*/}
      {/*  <TagsTooltip additionalTags={additionalTags}>*/}
      {/*    <TagButton tag={primaryTag} plus={additionalTags.length} />*/}
      {/*  </TagsTooltip>*/}
      {/*)}*/}
      {/*{displayProperties.includes("analytics") && (*/}
      <div className="hidden md:flex">
        <AnalyticsBadge link={link} />
      </div>
      {/*)}*/}
      <LinkControls link={link} />
    </div>
  );
}

function TagsTooltip({
  additionalTags,
  children,
}: PropsWithChildren<{ additionalTags: TagProps[] }>) {
  return !!additionalTags.length ? (
    <Tooltip
      content={
        <div className="flex flex-wrap gap-1.5 p-3">
          {additionalTags.map((tag) => (
            <TagButton key={tag.id} tag={tag} />
          ))}
        </div>
      }
      side="top"
      align="end"
    >
      <div>{children}</div>
    </Tooltip>
  ) : (
    children
  );
}

function TagButton({ tag, plus }: { tag: TagProps; plus?: number }) {
  const { queryParams } = useRouterStuff();
  const searchParams = useSearchParams();

  const selectedTagIds =
    searchParams?.get("tagIds")?.split(",")?.filter(Boolean) ?? [];

  return (
    <button
      onClick={() => {
        let newTagIds = selectedTagIds.includes(tag.id)
          ? selectedTagIds.filter((id) => id !== tag.id)
          : [...selectedTagIds, tag.id];

        queryParams({
          set: {
            tagIds: newTagIds.join(","),
          },
          del: [...(newTagIds.length ? [] : ["tagIds"])],
        });
      }}
    >
      <TagBadge {...tag} withIcon plus={plus} />
    </button>
  );
}

export function AnalyticsBadge({ link }: { link: ResponseLink }) {
  const { slug, plan } = useWorkspace();
  const { domain, key, trackConversion, clicks, leads, saleAmount } = link;

  const { isMobile } = useMediaQuery();
  const { variant } = useContext(CardList.Context);

  const stats = useMemo(
    () => [
      {
        id: "clicks",
        icon: CursorRays,
        value: clicks,
        iconClassName: "data-[active=true]:text-blue-500",
      },
      // show leads and sales if:
      // 1. link has trackConversion enabled
      // 2. link has leads or sales
      ...(trackConversion || leads > 0 || saleAmount > 0
        ? [
            {
              id: "leads",
              icon: UserCheck,
              value: leads,
              className: "hidden sm:flex",
              iconClassName: "data-[active=true]:text-purple-500",
            },
            {
              id: "sales",
              icon: InvoiceDollar,
              value: saleAmount,
              className: "hidden sm:flex",
              iconClassName: "data-[active=true]:text-teal-500",
            },
          ]
        : []),
    ],
    [link],
  );

  const { ShareDashboardModal, setShowShareDashboardModal } =
    useShareDashboardModal({ domain, _key: key });

  // Hacky fix for making sure the tooltip closes (by rerendering) when the modal opens
  const [modalShowCount, setModalShowCount] = useState(0);

  const canManageLink = useCheckFolderPermission(
    link.folderId,
    "folders.links.write",
  );

  return (
    <div className="flex flex-col items-center gap-3 md:flex-row lg:gap-4 xl:gap-6">
      {!isMobile && (
        <div
          className={cn(
            "flex w-fit min-w-[58px] justify-center overflow-hidden rounded-md border border-neutral-200/10",
            "bg-neutral-50 p-0.5 px-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100",
            link.archived
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-neutral-600",
          )}
        >
          {link.archived ? "Deactivated" : "Active"}
        </div>
      )}
      {isMobile ? (
        <Link
          href={`/${slug}/analytics?domain=${domain}&key=${key}&interval=${plan === "free" ? "30d" : plan === "pro" ? "1y" : "all"}`}
          className="bg-secondary-100 text-secondary flex h-[26px] w-full min-w-[91.5px] items-center justify-center gap-2 rounded-md border px-2 py-0.5 text-sm md:h-full md:gap-1"
        >
          {/*<CursorRays className="h-4 w-4 text-neutral-600" />*/}
          <Icon
            icon="streamline:graph"
            className="text-secondary h-[14px] w-[14px]"
          />
          {nFormatter(link.clicks)} scans
        </Link>
      ) : (
        <>
          <ShareDashboardModal />
          {/*<Tooltip*/}
          {/*  key={modalShowCount}*/}
          {/*  side="top"*/}
          {/*  content={*/}
          {/*    <div className="flex flex-col gap-2.5 whitespace-nowrap p-3 text-neutral-600">*/}
          {/*      {stats.map(({ id: tab, value }) => (*/}
          {/*        <div key={tab} className="text-sm leading-none">*/}
          {/*          <span className="font-medium text-neutral-950">*/}
          {/*            {tab === "sales"*/}
          {/*              ? currencyFormatter(value / 100)*/}
          {/*              : nFormatter(value, { full: value < INFINITY_NUMBER })}*/}
          {/*          </span>{" "}*/}
          {/*          {tab === "sales" ? "total " : ""}*/}
          {/*          {pluralize(tab.slice(0, -1), value)}*/}
          {/*        </div>*/}
          {/*      ))}*/}
          {/*      <p className="text-xs leading-none text-neutral-400">*/}
          {/*        {link.lastClicked*/}
          {/*          ? `Last clicked ${timeAgo(link.lastClicked, {*/}
          {/*              withAgo: true,*/}
          {/*            })}`*/}
          {/*          : "No clicks yet"}*/}
          {/*      </p>*/}

          {/*      <div className="inline-flex items-start justify-start gap-2">*/}
          {/*        <Button*/}
          {/*          text={link.dashboardId ? "Edit sharing" : "Share dashboard"}*/}
          {/*          className="h-7 w-full px-2"*/}
          {/*          onClick={() => {*/}
          {/*            setShowShareDashboardModal(true);*/}
          {/*            setModalShowCount((c) => c + 1);*/}
          {/*          }}*/}
          {/*          disabled={!canManageLink}*/}
          {/*        />*/}

          {/*        {link.dashboardId && (*/}
          {/*          <CopyButton*/}
          {/*            value={`${APP_DOMAIN}/share/${link.dashboardId}`}*/}
          {/*            variant="neutral"*/}
          {/*            className="h-7 items-center justify-center rounded-md border border-neutral-300 bg-white p-1.5 hover:bg-neutral-50 active:bg-neutral-100"*/}
          {/*          />*/}
          {/*        )}*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  }*/}
          {/*>*/}
          <Link
            href={`/${slug}/analytics?domain=${domain}&key=${key}&interval=${plan === "free" ? "30d" : plan === "pro" ? "1y" : "all"}`}
            className={cn(
              "bg-secondary-100 text-secondary w-fit overflow-hidden rounded-md border border-neutral-200/10 p-0.5 text-sm transition-colors",
              variant === "loose" ? "hover:bg-neutral-100" : "hover:bg-white",
            )}
          >
            <div className="hidden items-center gap-0.5 sm:flex">
              {stats.map(
                ({
                  id: tab,
                  // icon: Icon,
                  value,
                  className,
                  iconClassName,
                }) => (
                  <div
                    key={tab}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-md px-1 py-px transition-colors",
                      className,
                    )}
                  >
                    {/*<Icon*/}
                    {/*  data-active={value > 0}*/}
                    {/*  className={cn("h-4 w-4 shrink-0", iconClassName)}*/}
                    {/*/>*/}
                    <Icon
                      icon="streamline:graph"
                      className="text-secondary h-[14px] w-[14px]"
                    />
                    <span>
                      {tab === "sales"
                        ? currencyFormatter(value / 100)
                        : nFormatter(value)}
                      {stats.length === 1 && " scans"}
                    </span>
                  </div>
                ),
              )}
              {/*{link.dashboardId && (*/}
              {/*  <div className="border-l border-neutral-200/10 px-1.5">*/}
              {/*    <ReferredVia className="h-4 w-4 shrink-0 text-neutral-600" />*/}
              {/*  </div>*/}
              {/*)}*/}
            </div>
          </Link>
          {/*</Tooltip>*/}
        </>
      )}
    </div>
  );
}
