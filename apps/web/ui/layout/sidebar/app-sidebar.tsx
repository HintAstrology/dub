"use client";

import type { ComponentType, CSSProperties } from "react";
import { QrCode, PlusCircle, BarChart3 } from "lucide-react";
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
import { SidebarUserDropdown } from "./sidebar-user-dropdown";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@dub/utils";
import { useTrialStatus } from "@/lib/contexts/trial-status-context";
import { useTrialExpiredModal } from "@/lib/hooks/use-trial-expired-modal";
import { MouseEvent, useMemo } from "react";
import { Icon } from "@iconify/react";

type MenuItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  exact?: boolean;
  badge?: string;
  onClick?: (e: MouseEvent) => void;
};

export function AppSidebar() {
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();
  const { isTrialOver } = useTrialStatus();
  const { setShowTrialExpiredModal, TrialExpiredModalCallback } = useTrialExpiredModal();

  const menuItems: MenuItem[] = useMemo(() => [
    {
      icon: ({ className }) => <Icon icon="mage:qr-code" className={className} />,
      label: "My QR Codes",
      href: `/${slug}`,
      exact: true,
    },
    {
      icon: ({ className }) => <Icon icon="streamline:graph" className={className} />,
      label: "Statistics",
      href: isTrialOver ? "#" : `/${slug}/analytics`,
      onClick: isTrialOver
        ? (e: MouseEvent) => {
            e.preventDefault();
            setShowTrialExpiredModal?.(true);
          }
        : undefined,
    },
  ], [slug, isTrialOver, setShowTrialExpiredModal]);

  const isActive = (item: MenuItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <TrialExpiredModalCallback />
      <Sidebar
        variant="floating"
        collapsible="icon"
        className="border-r-0 bg-card p-6 pr-0 [&>[data-slot=sidebar-inner]]:group-data-[variant=floating]:rounded-[20px] [&>[data-slot=sidebar-inner]]:bg-card [&>[data-slot=sidebar-inner]]:border [&>[data-slot=sidebar-inner]]:border-border [&>[data-slot=sidebar-inner]]:shadow-sm"
      >
        <SidebarHeader className="bg-white lg:rounded-[20px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="gap-2.5 !bg-transparent hover:bg-transparent [&>svg]:size-8" asChild>
                <Link href={`/${slug}`}>
                  <QrCode className="text-primary size-8" />
                  <span className="text-xl font-semibold">GetQR</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item)}
                      className={cn(
                        "transition-colors",
                        isActive(item) && "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                      )}
                      onClick={item.onClick}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-primary/10 rounded-full">{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
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

