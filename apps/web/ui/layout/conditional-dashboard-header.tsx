"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { cn } from "@dub/utils";
import { UserIcon, WalletIcon, CreditCardIcon, PanelLeftOpen, PanelLeftClose } from "lucide-react";

interface ConditionalDashboardHeaderProps {
  user: any;
}

export function ConditionalDashboardHeader({ user }: ConditionalDashboardHeaderProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
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
    return "My Account";
  };

  if (isAccountSettings || isAccountPlans || isAccountBilling) {
    const AccountIcon = getAccountIcon();
    
    return (
      <header className={cn(
        "bg-card rounded-[20px",
        "[&_*]:no-underline"
      )}>
        <div className="flex w-full items-center gap-3 pb-4">
          {/* Mobile: Toggle button | Desktop: Account icon */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors text-secondary"
          >
            {state === "expanded" ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
          <div className="hidden md:flex p-2 text-secondary">
            <AccountIcon className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">
            {getAccountTitle()}
          </h1>
        </div>
      </header>
    );
  }

  return <DashboardHeader user={user} />;
}

