"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { cn } from "@dub/utils";

interface ConditionalDashboardHeaderProps {
  user: any;
}

export function ConditionalDashboardHeader({ user }: ConditionalDashboardHeaderProps) {
  const pathname = usePathname();
  const isAccountSettings = pathname?.startsWith("/account/settings");

  if (isAccountSettings) {
    return (
      <header className={cn(
        "bg-card rounded-[20px] border border-border px-4 shadow-sm sm:px-6 mb-4",
        "[&_*]:no-underline"
      )}>
        <div className="flex w-full min-h-16 items-center gap-3 md:h-16">
          <SidebarTrigger className="text-secondary hover:bg-secondary/10 [&_svg]:!size-5" />
          <h1 className="text-lg font-semibold text-neutral-900">
            Account Settings
          </h1>
        </div>
      </header>
    );
  }

  return <DashboardHeader user={user} />;
}

