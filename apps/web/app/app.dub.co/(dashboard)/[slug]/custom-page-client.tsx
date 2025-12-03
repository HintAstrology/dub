"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less";
import { Session } from "@/lib/auth/utils";
import { UserProvider } from "@/ui/contexts/user";
import { CreateQRButton } from "@/ui/modals/qr-builder-new";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import QrCodesContainer from "@/ui/qr-code/qr-codes-container.tsx";
import { Button } from "@dub/ui";
import { ShieldAlert } from "@dub/ui/icons";
import { ICustomerBody } from "core/integration/payment/config";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NewQrProvider } from "./helpers/new-qr-context";
import { useSession } from 'next-auth/react';

interface WorkspaceQRsClientProps {
  initialQrs: TQrServerData[];
  featuresAccess: FeaturesAccess;
  user: Session["user"];
  cookieUser: ICustomerBody | null;
  newQrId?: string | null;
}

export default function WorkspaceQRsClient({
  initialQrs,
  featuresAccess,
  user,
  newQrId,
}: WorkspaceQRsClientProps) {
  const { update: updateSession } = useSession();

  useEffect(() => {
    updateSession();
  }, []);
  
  return (
    <UserProvider user={user}>
      <NewQrProvider newQrId={newQrId}>
        <WorkspaceQRs
          initialQrs={initialQrs}
          featuresAccess={featuresAccess}
          user={user}
        />
      </NewQrProvider>
    </UserProvider>
  );
}

function WorkspaceQRs({
  initialQrs,
  featuresAccess,
  user,
}: {
  initialQrs: TQrServerData[];
  featuresAccess: FeaturesAccess;
  user: Session["user"];
}) {
  const router = useRouter();

  return (
    <>

      <div className="flex w-full flex-col gap-y-3">
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
      </div>

      <QrCodesContainer
        CreateQrCodeButton={
          featuresAccess
            ? () => (
                <CreateQRButton onClick={() => router.push("/constructor")} />
              )
            : () => <></>
        }
        featuresAccess={featuresAccess.featuresAccess}
        initialQrs={initialQrs}
        user={user}
      />
    </>
  );
}
