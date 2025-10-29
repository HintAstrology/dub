"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less";
import { Session } from "@/lib/auth/utils";
import useQrs from "@/lib/swr/use-qrs.ts";
import { UserProvider } from "@/ui/contexts/user";
import { CreateQRButton, QRBuilderModal } from "@/ui/modals/qr-builder-new";
import { useTrialOfferWithQRPreviewModal } from "@/ui/modals/trial-offer-with-qr-preview";
import { TQrStorageData } from "@/ui/qr-builder-new/types/database";
import QrCodeSort from "@/ui/qr-code/qr-code-sort.tsx";
import QrCodesContainer from "@/ui/qr-code/qr-codes-container.tsx";
import { QrCodesDisplayProvider } from "@/ui/qr-code/qr-codes-display-provider.tsx";
import { SearchBoxPersisted } from "@/ui/shared/search-box";
import { Button, MaxWidthWrapper } from "@dub/ui";
import { ShieldAlert } from "@dub/ui/icons";
import { ICustomerBody } from "core/integration/payment/config";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NewQrProvider } from "./helpers/new-qr-context";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { QRBuilderData } from '@/ui/qr-builder/types/types';

interface WorkspaceQRsClientProps {
  initialQrs: TQrStorageData[];
  qrDataFromLanding: QRBuilderData | null;
  featuresAccess: FeaturesAccess;
  user: Session["user"];
  cookieUser: ICustomerBody | null;
}

export default function WorkspaceQRsClient({
  initialQrs,
  featuresAccess,
  user,
}: WorkspaceQRsClientProps) {
  return (
    <UserProvider user={user}>
      <NewQrProvider>
        <QrCodesDisplayProvider>
          <WorkspaceQRs
            initialQrs={initialQrs}
            featuresAccess={featuresAccess}
            user={user}
          />
        </QrCodesDisplayProvider>
      </NewQrProvider>
    </UserProvider>
  );
}

function WorkspaceQRs({
  initialQrs,
  featuresAccess,
  user,
}: {
  initialQrs: TQrStorageData[];
  featuresAccess: FeaturesAccess;
  user: Session["user"];
}) {
  const router = useRouter();
  const { isValidating } = useQrs({}, {}, true); // listenOnly mode
  const [showQRBuilderModal, setShowQRBuilderModal] = useState(false);

  return (
    <>
      <QRBuilderModal
        showModal={showQRBuilderModal}
        setShowModal={setShowQRBuilderModal}
      />

      <div className="flex w-full items-center pt-2">
        <MaxWidthWrapper className="flex flex-col gap-y-3">
          {!featuresAccess.isSubscribed && (
            <div className="w-full rounded-lg border border-red-200 bg-red-100">
              <div className="px-3 py-3 md:px-4">
                <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-3">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      className="flex items-center justify-center"
                    >
                      <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 md:h-6 md:w-6" />
                    </motion.div>
                    <p className="text-center text-sm font-medium text-red-700 md:text-left">
                      Your dynamic QR codes are temporarily deactivated. To
                      restore them, please upgrade to one of our plans.
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full md:w-auto"
                  >
                    <Button
                      variant="primary"
                      className="bg-secondary hover:bg-secondary-800 w-full whitespace-nowrap text-sm font-medium text-white md:w-auto"
                      onClick={() => {
                        router.push(`/account/plans`);
                        router.refresh();
                      }}
                      text="Restore Access"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          )}
          {featuresAccess.isSubscribed && (
            <div className="flex flex-wrap items-center justify-between gap-2 lg:flex-nowrap">
              <div className="flex w-full grow gap-2 md:w-auto">
                <div className="grow basis-0 md:grow-0">
                  <QrCodeSort />
                </div>
              </div>
              <div className="flex gap-x-2 max-md:w-full">
                <div className="w-full md:w-56 lg:w-64">
                  <SearchBoxPersisted
                    loading={isValidating}
                    inputClassName="h-10"
                  />
                </div>

                <div className="grow-0">
                  <CreateQRButton onClick={() => setShowQRBuilderModal(true)} />
                </div>
              </div>
            </div>
          )}
        </MaxWidthWrapper>
      </div>

      <div className="mt-3">
        <QrCodesContainer
          CreateQrCodeButton={
            featuresAccess
              ? () => (
                  <CreateQRButton onClick={() => setShowQRBuilderModal(true)} />
                )
              : () => <></>
          }
          featuresAccess={featuresAccess.featuresAccess}
          initialQrs={initialQrs}
          user={user}
        />
      </div>
    </>
  );
}
function TrialOfferWithQRPreviewWrapper({
  initialQrs,
  featuresAccess,
  user,
}: {
  initialQrs: TQrStorageData[];
  featuresAccess: FeaturesAccess;
  user: ICustomerBody | null;
}) {
  const firstQr = initialQrs?.[0] || null;
  const { isSubscribed } = featuresAccess;

  const { TrialOfferWithQRPreviewModal, setShowTrialOfferModal } =
    useTrialOfferWithQRPreviewModal({
      user,
      firstQr,
    });

  useEffect(() => {
    if (!isSubscribed) {
      // TODO: uncomment this when we will prepare subscription for old users
      // && !featuresAccess.subscriptionId,

      setShowTrialOfferModal(true);
    } else {
      trackClientEvents({
        event: EAnalyticEvents.PAGE_VIEWED,
        params: {
          page_name: "dashboard",
          content_group: "my_qr_codes",
          event_category: "Authorized",
          email: user?.email,
        },
        sessionId: user?.id,
      });
    }
  }, [isSubscribed]);

  return <TrialOfferWithQRPreviewModal />;
}
