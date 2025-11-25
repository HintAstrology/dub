"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { cn } from "@dub/utils";
import { UserIcon, WalletIcon, CreditCardIcon } from "lucide-react";

interface ConditionalDashboardHeaderProps {
  user: any;
}

export function ConditionalDashboardHeader({ user }: ConditionalDashboardHeaderProps) {
  const pathname = usePathname();
  const isAccountSettings = pathname?.startsWith("/account/settings");
  const isAccountPlans = pathname?.startsWith("/account/plans");
  const isAccountBilling = pathname?.startsWith("/account/billing");

  // Determine icon for account pages
  const getAccountIcon = () => {
    if (isAccountPlans) return WalletIcon;
    if (isAccountBilling) return CreditCardIcon;
    return UserIcon; // Default for account/settings
  };

  // Determine title for account pages
  const getAccountTitle = () => {
    if (isAccountPlans) return "Plans & Payments";
    if (isAccountBilling) return "Billing";
    return "Account Settings";
  };

  if (isAccountSettings || isAccountPlans || isAccountBilling) {
    return (
      <header className={cn(
        "bg-card rounded-[20px",
        "[&_*]:no-underline"
      )}>
        <div className="flex w-full items-center gap-3 pb-4">
          <SidebarTrigger 
            icon={getAccountIcon()}
            asPageIcon={true}
            className="text-secondary [&_svg]:!size-5" 
          />
          <h1 className="text-lg font-semibold text-neutral-900">
            {getAccountTitle()}
          </h1>
        </div>
      </header>
    );
  }

  return <DashboardHeader user={user} />;
}

