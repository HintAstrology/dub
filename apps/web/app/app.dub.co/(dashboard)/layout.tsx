import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { TrialStatusProvider } from "@/lib/contexts/trial-status-context";
import { DashboardHeader } from "@/ui/layout/dashboard-header";
import { QRProviderWrapper } from "@/ui/layout/qr-provider-wrapper";
import { AppSidebar } from "@/ui/layout/sidebar/app-sidebar";
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
    <TrialStatusProvider>
      <QRProviderWrapper>
        <div className="before:bg-primary before:h-105 relative flex min-h-dvh w-full before:fixed before:inset-x-0 before:top-0">
          <SidebarProvider
            style={
              {
                "--sidebar": "var(--card)",
                "--sidebar-width": "17.5rem",
                "--sidebar-width-icon": "3.5rem",
              } as CSSProperties
            }
          >
            <AppSidebar />
            <div className="z-1 mx-auto flex size-full flex-1 flex-col px-4 py-6 sm:px-6">
              <DashboardHeader user={user} />
              <main className="mb-6 size-full flex-1">{children}</main>
              <footer className="bg-card border-border rounded-[20px] border p-3 shadow-sm">
                <div className="text-muted-foreground flex items-center justify-center text-sm">
                  © 2024 GetQR. All rights reserved.
                </div>
              </footer>
            </div>
          </SidebarProvider>
        </div>
        {oauthFlowCookie && (
          <OauthTrackerComponent oauthData={parsedOauthFlowInfo} />
        )}
      </QRProviderWrapper>
    </TrialStatusProvider>
  );
}
