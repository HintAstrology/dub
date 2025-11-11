import { checkFeaturesAccessAuthLess } from "@/lib/actions/check-features-access-auth-less";
import { getQrs } from "@/lib/api/qrs/get-qrs";
import { getSession } from "@/lib/auth";
import { redis } from "@/lib/upstash";
import { PageContent } from "@/ui/layout/page-content";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { PageViewedTrackerComponent } from "core/integration/analytic/components/page-viewed-tracker";
import { ERedisArg } from "core/interfaces/redis.interface";
import { getUserCookieService } from "core/services/cookie/user-session.service";
import { Viewport } from "next";
import WorkspaceQRsClient from "./custom-page-client";

export const viewport: Viewport = {
  themeColor: "#f6f6f7",
};

const WorkspaceQRsPage = async () => {
  const { user: authUser } = await getSession();
  const { sessionId, user } = await getUserCookieService();

  const qrs = await getQrs(
    {
      userId: authUser.id,
      sort: "createdAt",
      sortBy: "createdAt",
      sortOrder: "desc",
      showArchived: true,
      withTags: false,
      page: 1,
      pageSize: 100,
    },
    {
      includeFile: true,
    },
  );

  const featuresAccess = await checkFeaturesAccessAuthLess(authUser.id);

  const newQrId: string | null = await redis.get(
    `${ERedisArg.NEW_QR_ID_REG}:${authUser.id}`,
  );
  await redis.del(`${ERedisArg.NEW_QR_ID_REG}:${authUser.id}`);

  return (
    <>
      <PageContent>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            My QR Codes
          </h1>
        </div>
        <WorkspaceQRsClient
          initialQrs={qrs as unknown as TQrServerData[]}
          featuresAccess={featuresAccess}
          user={authUser}
          cookieUser={user}
          newQrId={newQrId}
        />
      </PageContent>

      <PageViewedTrackerComponent
        sessionId={sessionId!}
        pageName="dashboard"
        params={{
          event_category: "Authorized",
          email: user?.email!,
          content_group: "my_qr_codes",
        }}
      />
    </>
  );
};

export default WorkspaceQRsPage;
