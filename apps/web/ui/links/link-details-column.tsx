import { useCheckFolderPermission } from "@/lib/swr/use-folder-permissions";
import useWorkspace from "@/lib/swr/use-workspace";
import { TagProps } from "@/lib/types";
import { LinkControls } from "@/ui/links/link-controls.tsx";
import {
  Button,
  CardList,
  CursorRays,
  InvoiceDollar,
  Tooltip,
  useMediaQuery,
  UserCheck,
  useRouterStuff,
} from "@dub/ui";
import { ReferredVia } from "@dub/ui/icons";
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
import { ResponseLink } from "./links-container";
import { LinksDisplayContext } from "./links-display-provider";
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

  const { displayProperties } = useContext(LinksDisplayContext);

  const ref = useRef<HTMLDivElement>(null);

  const { primaryTag, additionalTags } = useOrganizedTags(tags);

  const isLinkActive = !link.archived;

  return (
    <div
      ref={ref}
      className="flex shrink-0 items-center justify-end gap-[42px]"
    >
      {displayProperties.includes("tags") && primaryTag && (
        <TagsTooltip additionalTags={additionalTags}>
          <TagButton tag={primaryTag} plus={additionalTags.length} />
        </TagsTooltip>
      )}
      <div
        className={cn("rounded-lg border px-2.5 py-1 text-xs font-medium", {
          "border-[#30A46C99] bg-[#30A46C14] text-[#30A46C]": isLinkActive,
          "text-neutral border-neutral-300 bg-neutral-100": !isLinkActive,
        })}
      >
        {isLinkActive ? "Active" : "Archived"}
      </div>
      {displayProperties.includes("analytics") && (
        <AnalyticsBadge link={link} />
      )}
      {/*<div*/}
      {/*  className={cn("rounded-lg border px-2.5 py-1 text-xs font-medium", {*/}
      {/*    "border-[#30A46C99] bg-[#30A46C14] text-[#30A46C]": isLinkActive,*/}
      {/*    "text-neutral border-neutral-300 bg-neutral-100": !isLinkActive,*/}
      {/*  })}*/}
      {/*>*/}
      {/*  {isLinkActive ? "Active" : "Archived"}*/}
      {/*</div>*/}
      {/* @TODO: add download option */}
      <div className="hidden flex-row items-center justify-between gap-4 md:flex">
        <Button
          variant="secondary"
          className={cn(
            "text-neutral h-9 w-9 rounded-lg p-2 text-xl outline-none transition-all duration-200",
            "border-border-100 hover:border-primary hover:text-primary data-[state=open]:border-primary data-[state=open]:bg-primary-300 data-[state=open]:text-primary hover:bg-primary-300 data-[state=open]:ring-0",
          )}
          icon={<Icon icon="tabler:download" />}
          onClick={() => {}}
        />
        <LinkControls link={link} />
      </div>
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

function AnalyticsBadge({ link }: { link: ResponseLink }) {
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

  return isMobile ? (
    <Link
      href={`/${slug}/analytics?domain=${domain}&key=${key}&interval=${plan === "free" ? "30d" : plan === "pro" ? "1y" : "all"}`}
      className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-sm text-neutral-800"
    >
      <CursorRays className="h-4 w-4 text-neutral-600" />
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
          "border-border-100 text-neutral overflow-hidden rounded-md border bg-neutral-50 p-0.5 text-sm transition-colors",
          variant === "loose" ? "hover:bg-neutral-100" : "hover:bg-white",
        )}
      >
        <div className="hidden items-center gap-0.5 sm:flex">
          {stats.map(
            ({ id: tab, icon: Icon, value, className, iconClassName }) => (
              <div
                key={tab}
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap rounded-md px-1 py-px transition-colors",
                  className,
                )}
              >
                {Icon && (
                  <Icon
                    data-active={value > 0}
                    className={cn("h-4 w-4 shrink-0", iconClassName)}
                  />
                )}
                {/*<div className="flex flex-row-reverse items-center gap-1 md:flex-col">*/}
                {/*  <p className="text-neutral text-center text-xl font-semibold">*/}
                {/*    {tab === "sales"*/}
                {/*      ? currencyFormatter(value / 100)*/}
                {/*      : nFormatter(value)}*/}
                {/*  </p>*/}
                {/*  <p className="text-xs font-medium text-neutral-300">*/}
                {/*    {stats.length === 1 && " clicks"}*/}
                {/*  </p>*/}
                {/*</div>*/}
                <span>
                  {tab === "sales"
                    ? currencyFormatter(value / 100)
                    : nFormatter(value)}
                  {stats.length === 1 && " scans"}
                </span>
              </div>
            ),
          )}
          {link.dashboardId && (
            <div className="border-l border-neutral-200 px-1.5">
              <ReferredVia className="h-4 w-4 shrink-0 text-neutral-600" />
            </div>
          )}
        </div>
      </Link>
      {/*</Tooltip>*/}
    </>
  );
}
