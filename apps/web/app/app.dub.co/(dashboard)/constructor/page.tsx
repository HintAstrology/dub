import { getSession } from "@/lib/auth";
import { getQr } from "@/lib/api/qrs/get-qr";
import { PageContent } from "@/ui/layout/page-content";
import { CreateQRContent } from "@/ui/qr-builder-new/components/create-qr-content";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { MaxWidthWrapper } from "@dub/ui";
import { PageViewedTrackerComponent } from "core/integration/analytic/components/page-viewed-tracker/page-viewed-tracker.component";
import { NextPage } from "next";
import { PreventScroll } from "@/ui/shared/prevent-scroll";

interface ConstructorPageProps {
  searchParams: {
    qrId?: string;
    step?: string;
  };
}

const ConstructorPage: NextPage<ConstructorPageProps> = async ({ searchParams }) => {
  const { user: sessionUser } = await getSession();

  if (!sessionUser) {
    return null;
  }

  let qrCode: TQrServerData | null = null;
  if (searchParams.qrId) {
    try {
      qrCode = (await getQr({ qrId: searchParams.qrId })) as unknown as TQrServerData;
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  }

  const initialStep = searchParams.step ? parseInt(searchParams.step) : undefined;

  return (
    <>
      <PreventScroll />
      <PageContent>
        <CreateQRContent 
          user={sessionUser} 
          qrCode={qrCode}
          initialStep={initialStep}
        />
      </PageContent>
      <PageViewedTrackerComponent
        sessionId={sessionUser.id!}
        pageName="constructor"
        params={{
          event_category: "Authorized",
          email: sessionUser?.email,
          content_group: "qr_builder",
        }}
      />
    </>
  );
};

export default ConstructorPage;

