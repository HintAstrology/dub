"use client";

import usePrograms from "@/lib/swr/use-programs";
import { useRouterStuff } from "@dub/ui";
import {
  Books2,
  CircleInfo,
  ConnectedDots,
  ConnectedDots4,
  CubeSettings,
  Gear2,
  Gift,
  Globe,
  Key,
  Receipt2,
  ShieldCheck,
  Users6,
  Webhook,
} from "@dub/ui/icons";
import { Icon } from "@iconify/react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { LinesY } from "./icons/lines-y";
import { SidebarNav, SidebarNavAreas } from "./sidebar-nav";
import { WorkspaceDropdown } from "./workspace-dropdown";

const NAV_AREAS: SidebarNavAreas<{
  slug: string;
  pathname: string;
  queryString: string;
  programs?: { id: string }[];
  session?: Session | null;
  showNews?: boolean;
}> = {
  // Top-level
  default: ({ slug, pathname, queryString, programs, showNews }) => ({
    showSwitcher: false,
    showNews,
    direction: "left",
    content: [
      {
        items: [
          // {
          //   name: "Links",
          //   icon: Hyperlink,
          //   href: `/${slug}${pathname === `/${slug}` ? "" : queryString}`,
          //   exact: true,
          // },
          // {
          //   name: "Analytics",
          //   icon: LinesY,
          //   href: `/${slug}/analytics${pathname === `/${slug}/analytics` ? "" : queryString}`,
          // },
          // {
          //   name: "Events",
          //   icon: CursorRays,
          //   href: `/${slug}/events${pathname === `/${slug}/events` ? "" : queryString}`,
          // },
          // {
          //   name: "Settings",
          //   icon: Gear,
          //   href: `/${slug}/settings`,
          // },
          {
            name: "My QR Codes",
            icon: () => <Icon icon="mage:qr-code" className="h-5 w-5" />,
            href: `/${slug}`,
            exact: true,
            // href: "/", // @TODO: Add my QR codes page
          },
          {
            name: "Statistics",
            icon: () => <Icon icon="streamline:graph" className="h-5 w-5" />,
            // href: "/statistics", // @TODO: Add statistics page`,
            href: `/${slug}/analytics${pathname === `/${slug}/analytics` ? "" : queryString}`,
          },
          // {
          //   name: "Plans and Payments",
          //   icon: () => <Icon icon="ion:card-outline" className="h-5 w-5" />,
          //   href: "/plans", // @TODO: Add plans and payments page
          // },
          // {
          //   name: "Account",
          //   icon: () => (
          //     <Icon
          //       className="h-5 w-5 text-neutral-200"
          //       icon="iconoir:profile-circle"
          //     />
          //   ),
          //   // href: "/account/settings",
          //   href: `/${slug}/settings`,
          // },
          // {
          //   name: "FAQ",
          //   icon: () => (
          //     <Icon
          //       className="h-5 w-5 text-neutral-200"
          //       icon="iconoir:question-mark-circle"
          //     />
          //   ),
          //   href: "/faq", // @TODO: Add FAQ page
          // },
        ],
      },
      ...(programs?.length
        ? [
            {
              name: "Programs",
              items: [
                {
                  name: "Affiliate",
                  icon: ConnectedDots4,
                  href: `/${slug}/programs/${programs[0].id}`,
                  items: [
                    {
                      name: "Overview",
                      href: `/${slug}/programs/${programs[0].id}`,
                      exact: true,
                    },
                    {
                      name: "Partners",
                      href: `/${slug}/programs/${programs[0].id}/partners`,
                    },
                    {
                      name: "Sales",
                      href: `/${slug}/programs/${programs[0].id}/sales`,
                    },
                    {
                      name: "Payouts",
                      href: `/${slug}/programs/${programs[0].id}/payouts`,
                    },
                    {
                      name: "Resources",
                      href: `/${slug}/programs/${programs[0].id}/resources`,
                    },
                    {
                      name: "Configuration",
                      href: `/${slug}/programs/${programs[0].id}/settings`,
                    },
                  ],
                },
              ],
            },
          ]
        : []),
    ],
  }),

  // Workspace settings
  workspaceSettings: ({ slug }) => ({
    title: "Settings",
    backHref: `/${slug}`,
    content: [
      {
        name: "Workspace",
        items: [
          {
            name: "General",
            icon: Gear2,
            href: `/${slug}/settings`,
            exact: true,
          },
          {
            name: "Billing",
            icon: Receipt2,
            href: `/${slug}/settings/billing`,
          },
          {
            name: "Domains",
            icon: Globe,
            href: `/${slug}/settings/domains`,
          },
          {
            name: "Library",
            icon: Books2,
            href: `/${slug}/settings/library`,
          },
          {
            name: "People",
            icon: Users6,
            href: `/${slug}/settings/people`,
          },
          {
            name: "Integrations",
            icon: ConnectedDots,
            href: `/${slug}/settings/integrations`,
          },
          {
            name: "Analytics",
            icon: LinesY,
            href: `/${slug}/settings/analytics`,
          },
          {
            name: "Security",
            icon: ShieldCheck,
            href: `/${slug}/settings/security`,
          },
        ],
      },
      {
        name: "Developer",
        items: [
          {
            name: "API Keys",
            icon: Key,
            href: `/${slug}/settings/tokens`,
          },
          {
            name: "OAuth Apps",
            icon: CubeSettings,
            href: `/${slug}/settings/oauth-apps`,
          },
          {
            name: "Webhooks",
            icon: Webhook,
            href: `/${slug}/settings/webhooks`,
          },
        ],
      },
      {
        name: "Account",
        items: [
          {
            name: "Notifications",
            icon: CircleInfo,
            href: `/${slug}/settings/notifications`,
          },
        ],
      },
    ],
  }),

  // User settings
  userSettings: ({ session, slug }) => ({
    title: "Settings",
    backHref: `/${slug}`,
    content: [
      {
        name: "Account",
        items: [
          {
            name: "General",
            icon: Gear2,
            href: "/account/settings",
            exact: true,
          },
          {
            name: "Security",
            icon: ShieldCheck,
            href: "/account/settings/security",
          },
          ...(session?.user?.["dubPartnerId"]
            ? [
                {
                  name: "Referrals",
                  icon: Gift,
                  href: "/account/settings/referrals",
                },
              ]
            : []),
        ],
      },
    ],
  }),
};

export function AppSidebarNav({
  toolContent,
  newsContent,
}: {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
}) {
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();
  const { getQueryString } = useRouterStuff();
  const { data: session } = useSession();
  const { programs } = usePrograms();

  const currentArea = useMemo(() => {
    return pathname.startsWith("/account/settings")
      ? "userSettings"
      : pathname.startsWith(`/${slug}/settings`)
        ? "workspaceSettings"
        : "default";
  }, [slug, pathname]);

  return (
    <SidebarNav
      areas={NAV_AREAS}
      currentArea={currentArea}
      data={{
        slug: slug || "",
        pathname,
        queryString: getQueryString(undefined, {
          include: ["folderId", "tagIds", "domain"],
        }),
        programs,
        session: session || undefined,
        showNews: pathname.startsWith(`/${slug}/programs/`) ? false : true,
      }}
      toolContent={toolContent}
      newsContent={newsContent}
      switcher={<WorkspaceDropdown />}
      // bottom={
      //   <div className="p-3">
      //     <Link
      //       className="text-content-inverted hover:bg-inverted hover:ring-border-subtle bordbg-secondary bg-secondary flex h-9 items-center justify-center rounded-md border px-4 text-sm text-white transition-all hover:ring-4 dark:border-white dark:bg-white"
      //       href={"/upgrade"} // @TODO: Add upgrade page
      //     >
      //       Upgrade
      //     </Link>
      //     {/*<UserSurveyButton />*/}
      //     {/*<Usage />*/}
      //   </div>
      // }
    />
  );
}
