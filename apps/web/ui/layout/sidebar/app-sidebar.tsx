"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTrialStatus } from "@/lib/contexts/trial-status-context";
import { useTrialExpiredModal } from "@/lib/hooks/use-trial-expired-modal";
import { useUser } from "@/ui/contexts/user";
import { QRBuilderNewModal } from "@/ui/modals/qr-builder-new/qr-builder-modal";
import { Logo } from "@/ui/shared/logo";
import { cn } from "@dub/utils";
import { QrCode, Plus, BarChart3, CirclePlus } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MouseEvent, useMemo, useState } from "react";
import { SidebarUserDropdown } from "./sidebar-user-dropdown";
import type { LucideIcon } from "lucide-react";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  href?: string;
  exact?: boolean;
  badge?: string;
  onClick?: (e: MouseEvent) => void;
};

export function AppSidebar() {
  const user = useUser();
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();
  const { isTrialOver } = useTrialStatus();
  const { setShowTrialExpiredModal, TrialExpiredModalCallback } =
    useTrialExpiredModal();
  const [showQRBuilderModal, setShowQRBuilderModal] = useState(false);

  // Use slug from params, or fall back to user's default workspace
  const workspaceSlug = slug || user?.defaultWorkspace;

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: CirclePlus,
        label: "Create QR",
        onClick: (e: MouseEvent) => {
          e.preventDefault();
          setShowQRBuilderModal(true);
        },
      },
      {
        icon: QrCode,
        label: "My QR Codes",
        href: workspaceSlug ? `/${workspaceSlug}` : '#',
        exact: true,
      },
      {
        icon: BarChart3,
        label: "Statistics",
        href: isTrialOver ? "#" : (workspaceSlug ? `/${workspaceSlug}/analytics` : '#'),
        onClick: isTrialOver
          ? (e: MouseEvent) => {
              e.preventDefault();
              setShowTrialExpiredModal?.(true);
            }
          : undefined,
      },
    ],
    [workspaceSlug, isTrialOver, setShowTrialExpiredModal],
  );

  const isActive = (item: MenuItem) => {
    if (!item.href) {
      return false;
    }
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <TrialExpiredModalCallback />
      <QRBuilderNewModal
        showModal={showQRBuilderModal}
        onClose={() => setShowQRBuilderModal(false)}
        user={user!}
      />
      <Sidebar
        variant="floating"
        collapsible="icon"
        className="bg-card [&>[data-slot=sidebar-inner]]:bg-card [&>[data-slot=sidebar-inner]]:shadow border-r-0 p-4 pr-0 [&>[data-slot=sidebar-inner]]:group-data-[variant=floating]:rounded-[20px]"
      >
        <SidebarHeader className="bg-white lg:rounded-[20px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="!bg-transparent hover:bg-transparent"
                asChild
              >
                <Link href={workspaceSlug ? `/${workspaceSlug}` : '#'}>
                  <Logo />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild={!!item.href}
                        isActive={isActive(item)}
                        className={cn(
                          "transition-colors",
                          isActive(item) &&
                            "bg-primary/10 text-primary hover:bg-primary/15 font-medium",
                        )}
                        onClick={item.onClick}
                        tooltip={item.label}
                      >
                        {item.href ? (
                          <Link href={item.href}>
                            <IconComponent className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        ) : (
                          <>
                            <IconComponent className="size-4" />
                            <span>{item.label}</span>
                          </>
                        )}
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="bg-primary/10 rounded-full">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-white lg:rounded-[20px]">
          <SidebarUserDropdown />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
