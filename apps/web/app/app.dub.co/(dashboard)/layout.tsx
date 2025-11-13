import { TrialStatusProvider } from "@/lib/contexts/trial-status-context";
import { AppSidebar } from "@/ui/layout/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { constructMetadata } from "@dub/utils";
import { OauthTrackerComponent } from "core/integration/analytic/components/oauth-tracker.component.tsx";
import { ECookieArg } from "core/interfaces/cookie.interface.ts";
import { cookies } from "next/headers";
import { ReactNode, CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/ui/layout/dashboard-header";
import { QRProviderWrapper } from "@/ui/layout/qr-provider-wrapper";
import { getSession } from "@/lib/auth";

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
        <div className="before:bg-primary relative flex min-h-dvh w-full before:fixed before:inset-x-0 before:top-0 before:h-105">
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
              <main className="mb-6 size-full flex-1">
                <Card className="h-full rounded-[20px] border-border shadow-sm">
                  {children}
                </Card>
              </main>
              <footer className="bg-card rounded-[20px] border border-border p-3 shadow-sm">
                <div className="flex items-center justify-center text-sm text-muted-foreground">
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
