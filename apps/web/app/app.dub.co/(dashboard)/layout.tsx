import { SubscriptionExpiredProvider } from "@/lib/contexts/subscription-expired-context";
import { MainNav } from "@/ui/layout/main-nav";
import { AppSidebarNav } from "@/ui/layout/sidebar/app-sidebar-nav";
import { constructMetadata } from "@dub/utils";
import { OauthTrackerComponent } from "core/integration/analytic/components/oauth-tracker.component.tsx";
import { ECookieArg } from "core/interfaces/cookie.interface.ts";
import { cookies } from "next/headers";
import { ReactNode } from "react";

// export const dynamic = "force-static";
export const metadata = constructMetadata();

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();

  const oauthFlowCookie = cookieStore.get(ECookieArg.OAUTH_FLOW)?.value;
  const parsedOauthFlowInfo = JSON.parse(oauthFlowCookie ?? "{}");

  return (
    <SubscriptionExpiredProvider>
      <div className="min-h-screen w-full bg-white">
        <MainNav
          sidebar={AppSidebarNav}
          //* @USEFUL_FEATURE: navbar config *//
          // toolContent={
          //   <HelpButtonRSC />
          //   //   <>
          //   //     <ReferButton />
          //   //   </>
          // }
          // newsContent={<NewsRSC />}
        >
          {children}
        </MainNav>
      </div>
      {oauthFlowCookie && (
        <OauthTrackerComponent oauthData={parsedOauthFlowInfo} />
      )}
    </SubscriptionExpiredProvider>
  );
}
