import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { ConditionalDashboardHeader } from "@/ui/layout/conditional-dashboard-header";
import { ConditionalFooter } from "@/ui/layout/conditional-footer";
import { QRProviderWrapper } from "@/ui/layout/qr-provider-wrapper";
import { AppSidebar } from "@/ui/layout/sidebar/app-sidebar";
import { UserProvider } from "@/ui/contexts/user";
import { SubscriptionExpiredProvider } from "@/lib/contexts/subscription-expired-context";
import { constructMetadata } from "@dub/utils";
import { OauthTrackerComponent } from "core/integration/analytic/components/oauth-tracker.component.tsx";
import { ECookieArg } from "core/interfaces/cookie.interface.ts";
import { cookies } from "next/headers";
import { CSSProperties, ReactNode } from "react";

// export const dynamic = "force-static";
export const metadata = constructMetadata();

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const { user } = await getSession();

  const oauthFlowCookie = cookieStore.get(ECookieArg.OAUTH_FLOW)?.value;
  const parsedOauthFlowInfo = JSON.parse(oauthFlowCookie ?? "{}");

  return (
      <QRProviderWrapper>
        <UserProvider user={user!}>
          <SubscriptionExpiredProvider>
            <div className="before:bg-primary before:h-105 relative flex min-h-dvh w-full before:fixed before:inset-x-0 before:top-0">
              <SidebarProvider
                style={
                  {
                    "--sidebar": "var(--card)",
                    "--sidebar-width": "14rem",
                    "--sidebar-width-icon": "3rem",
                  } as CSSProperties
                }
              >
                <AppSidebar />
                <div className="z-1 mx-auto flex size-full flex-1 flex-col px-4 py-6 sm:px-4">
                  <ConditionalDashboardHeader user={user} />
                  <main className="size-full">{children}</main>
                  <ConditionalFooter />
                </div>
              </SidebarProvider>
            </div>
            {oauthFlowCookie && (
              <OauthTrackerComponent oauthData={parsedOauthFlowInfo} />
            )}
          </SubscriptionExpiredProvider>
        </UserProvider>
      </QRProviderWrapper>
  );
}
