import { initRedis } from "@/lib/actions/init-redis.ts";
import { LandingSectionsClient } from "@/ui/landing/landing-sections-client.tsx";
import { PageViewedTrackerComponent } from "core/integration/analytic/components/page-viewed-tracker";
import { getUserCookieService } from "core/services/cookie/user-session.service.ts";
import { NextPage } from "next";

const MainPage: NextPage = async () => {
  const { sessionId } = await getUserCookieService();

  initRedis();

  return (
    <main className="relative mx-auto min-h-screen w-full pb-6">
      <LandingSectionsClient sessionId={sessionId!} />

      <PageViewedTrackerComponent
        sessionId={sessionId!}
        pageName="landing"
        params={{ event_category: "nonAuthorized" }}
      />
    </main>
  );
};

export default MainPage;
