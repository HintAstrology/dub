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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTrialStatus } from "@/lib/contexts/trial-status-context";
import { useTrialExpiredModal } from "@/lib/hooks/use-trial-expired-modal";
import { useUser } from "@/ui/contexts/user";
import { QRBuilderNewModal } from "@/ui/modals/qr-builder-new/qr-builder-modal";
import { Logo } from "@/ui/shared/logo";
import QRIcon from "@/ui/shared/icons/qr";
import { cn } from "@dub/utils";
import { QrCode, Plus, BarChart3, CirclePlus, PanelLeft, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MouseEvent, useMemo, useState } from "react";
import { SidebarUserDropdown } from "./sidebar-user-dropdown";
import type { LucideIcon } from "lucide-react";

type MenuItem = {
  icon: LucideIcon;
  label: string;
  shortLabel: string;
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
  const { toggleSidebar, state } = useSidebar();

  // Use slug from params, or fall back to user's default workspace
  const workspaceSlug = slug || user?.defaultWorkspace;

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: CirclePlus,
        label: "Create QR",
        shortLabel: "Create",
        onClick: (e: MouseEvent) => {
          e.preventDefault();
          setShowQRBuilderModal(true);
        },
      },
      {
        icon: QrCode,
        label: "My QR Codes",
        shortLabel: "My QRs",
        href: workspaceSlug ? `/${workspaceSlug}` : '#',
        exact: true,
      },
      {
        icon: BarChart3,
        label: "Statistics",
        shortLabel: "Stats",
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
      <div
        style={
          state === "collapsed"
            ? ({
                "--sidebar-width-icon": "75px",
              } as React.CSSProperties)
            : undefined
        }
      >
        <Sidebar
          variant="floating"
          collapsible="icon"
          className={cn(
            "bg-card [&>[data-slot=sidebar-inner]]:bg-card [&>[data-slot=sidebar-inner]]:shadow border-r-0 p-4 pr-0 [&>[data-slot=sidebar-inner]]:group-data-[variant=floating]:rounded-[20px]"
          )}
        >
        <SidebarHeader className="bg-white lg:rounded-[20px] relative group/header">
          {state === "collapsed" ? (
            <>
              {/* Desktop collapsed state - toggle icon on top, QR icon below */}
              <div className="hidden md:flex flex-col items-center gap-2 py-2">
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="h-5 w-5 text-gray-600" />
                </button>
                <Link href={workspaceSlug ? `/${workspaceSlug}` : '#'} className="flex items-center">
                  <QRIcon className="text-primary h-7 w-7" />
                </Link>
              </div>
              {/* Mobile collapsed state - only logo */}
              <SidebarMenu className="md:hidden">
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
            </>
          ) : (
            /* Expanded state - logo with toggle buttons */
            <>
              {/* Desktop toggle button - shows on hover */}
              <button
                onClick={toggleSidebar}
                className="hidden md:flex absolute right-2 top-4 z-10 p-1.5 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out opacity-0 group-hover/header:opacity-100 focus:opacity-100"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-5 w-5 text-gray-600" />
              </button>
              {/* Mobile close button - always visible */}
              <button
                onClick={toggleSidebar}
                className="md:hidden absolute right-2 top-2 z-10 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title="Close sidebar"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
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
            </>
          )}
        </SidebarHeader>
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupContent>
              {state === "collapsed" ? (
                <div className="hidden md:flex flex-col items-center gap-1.5 py-2">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item);
                    const content = (
                      <div
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-md transition-colors cursor-pointer w-full",
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-gray-100 text-gray-700",
                        )}
                      >
                        <IconComponent className="size-5" />
                        <span className="text-xs font-medium text-center">
                          {item.shortLabel}
                        </span>
                      </div>
                    );

                    return (
                      <div key={item.label} className="w-full flex justify-center">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="w-full flex justify-center"
                            onClick={item.onClick}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div onClick={item.onClick} className="w-full flex justify-center">
                            {content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
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
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-white w-full  lg:rounded-[20px]">
          <SidebarUserDropdown />
        </SidebarFooter>
      </Sidebar>
      </div>
    </>
  );
}
