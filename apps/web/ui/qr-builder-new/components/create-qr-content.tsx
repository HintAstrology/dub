"use client";

import { Session } from "@/lib/auth";
import { useNewQrOperations } from "@/ui/qr-builder-new/hooks/use-qr-operations";
import { TNewQRBuilderData } from "@/ui/qr-builder-new/types/qr-builder-data";
import { TStepState } from "@/ui/qr-builder-new/types/context";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { QRBuilderNew } from "@/ui/qr-builder-new";
import { useRouter } from "next/navigation";
import { FC, useCallback, useMemo } from "react";

interface CreateQRContentProps {
  user: Session["user"];
  qrCode?: TQrServerData | null;
  initialStep?: number;
}

export const CreateQRContent: FC<CreateQRContentProps> = ({ 
  user, 
  qrCode,
  initialStep 
}) => {
  const router = useRouter();
  const { createQr, updateQR } = useNewQrOperations({ 
    user, 
    initialQrData: qrCode || null 
  });

  // Convert number to TStepState (1 | 2 | 3 | null)
  const stepState: TStepState = useMemo(() => {
    if (initialStep === undefined || initialStep === null) return null;
    if (initialStep >= 1 && initialStep <= 3) {
      return initialStep as TStepState;
    }
    return null;
  }, [initialStep]);

  const handleSaveQR = useCallback(
    async (data: TNewQRBuilderData) => {
      try {
        if (qrCode) {
          await updateQR(data);
          router.push(`/?qrId=${qrCode.id}`);
        } else {
          const result = await createQr(data, undefined, user);
          if (result && result.createdQr) {
            router.push(`/?qrId=${result.createdQr.id}`);
          }
        }
      } catch (error) {
        console.error("Error saving QR:", error);
      }
    },
    [createQr, updateQR, user, router, qrCode],
  );

  return (
    <div className="flex h-[calc(100vh-85px)] border border-border-500 rounded-[20px] overflow-hidden  w-full flex-col">
      <QRBuilderNew
        homepageDemo={false}
        sessionId={user.id!}
        onSave={handleSaveQR}
        initialQrData={qrCode || null}
        initialStep={stepState}
      />
    </div>
  );
};
