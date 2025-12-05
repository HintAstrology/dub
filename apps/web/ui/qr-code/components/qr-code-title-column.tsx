"use client";

import { Session } from "@/lib/auth";
import { useQRPreviewModal } from "@/ui/modals/qr-preview-modal";
import { QRCanvas } from "@/ui/qr-builder-new/components/qr-canvas";
import { QRType } from "@/ui/qr-builder-new/constants/get-qr-config";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { QRCardDetails } from "@/ui/qr-code/components/qr-code-card-details";
import { QRCardTitle } from "@/ui/qr-code/components/qr-code-card-title";
import { QrCardType } from "@/ui/qr-code/components/qr-code-card-type";
import { Tooltip, useRouterStuff } from "@dub/ui";
import { cn, formatDateTime, timeAgo } from "@dub/utils";
import { Text } from "@radix-ui/themes";
import { useNewQrContext } from "app/app.dub.co/(dashboard)/[slug]/helpers/new-qr-context";
import { useSearchParams } from "next/navigation";
import QRCodeStyling from "qr-code-styling";
import { useCallback, useEffect } from "react";
import { QRStatusBadge } from "./qr-status-badge/qr-status-badge";

interface IQrCodeTitleColumnProps {
  user: Session["user"];
  qrCode: TQrServerData;
  qrCodeStylingInstance: QRCodeStyling | null;
  svgString: string;
  currentQrTypeInfo: QRType;
  featuresAccess?: boolean;
  setShowSubscriptionExpiredModal?: (show: boolean) => void;
}

export function QrCodeTitleColumn({
  user,
  qrCode,
  qrCodeStylingInstance,
  svgString,
  currentQrTypeInfo,
  featuresAccess,
  setShowSubscriptionExpiredModal,
}: IQrCodeTitleColumnProps) {
  const { createdAt } = qrCode ?? {};

  const { newQrId, setNewQrId, triggerCloseEditModal } = useNewQrContext();
  const searchParams = useSearchParams();
  const { queryParams } = useRouterStuff();

  const handlePreviewModalClose = useCallback(() => {
    triggerCloseEditModal?.();
  }, [qrCode.id, triggerCloseEditModal]);

  const { QRPreviewModal, setShowQRPreviewModal, handleOpenNewQr } =
    useQRPreviewModal({
      qrCodeStylingInstance,
      svgString,
      qrCodeId: qrCode.id,
      user,
      onClose: handlePreviewModalClose,
    });

  useEffect(() => {
    if (searchParams.get("onboarded")) {
      handleOpenNewQr();
      queryParams({
        del: ["onboarded"],
      });
    }
  }, [searchParams.get("onboarded"), handleOpenNewQr, queryParams]);

  useEffect(() => {
    if (qrCode.id === searchParams.get("qrId")) {
      handleOpenNewQr();
      queryParams({
        del: ["qrId"],
      });
    }
  }, [qrCode.id, searchParams.get("qrId"), handleOpenNewQr, queryParams]);

  useEffect(() => {
    if (qrCode.id === newQrId) {
      setTimeout(() => {
        handleOpenNewQr();
        setNewQrId?.(null);
      }, 100);
    }
  }, [qrCode.id, newQrId, setNewQrId, handleOpenNewQr]);

  return (
    <>
      <QRPreviewModal />

      <div className="flex h-full min-w-0 flex-row items-start gap-4">
        <div className="flex flex-col gap-2">
          <div
            className="h-[100px] w-[100px] cursor-pointer"
            onClick={() => setShowQRPreviewModal(true)}
          >
            <QRCanvas
              svgString={svgString}
              width={100}
              height={100}
              className="p-1"
            />
          </div>
          <QRStatusBadge
            qrCode={qrCode}
            featuresAccess={featuresAccess}
            className="lg:hidden"
          />
        </div>

        <div className="flex h-full w-full min-w-0 flex-col gap-1.5 lg:flex-row lg:justify-start lg:gap-8 xl:gap-12">
          <QrCardType
            className="flex lg:hidden"
            currentQrTypeInfo={currentQrTypeInfo}
          />

          <div className="flex min-w-0 flex-col justify-center gap-1 whitespace-nowrap lg:w-[120px] lg:shrink-0">
            <Text
              as="span"
              size="2"
              weight="bold"
              className="hidden whitespace-nowrap lg:block"
            >
              QR Name
            </Text>
            <QRCardTitle
              user={user}
              qrCode={qrCode}
              featuresAccess={featuresAccess}
              setShowSubscriptionExpiredModal={setShowSubscriptionExpiredModal}
            />
          </div>

          <div className="order-last flex min-w-0 flex-col justify-center gap-1 lg:order-none lg:flex-1 lg:shrink-0">
            <Text
              as="span"
              size="2"
              weight="bold"
              className="hidden whitespace-nowrap lg:block"
            >
              {currentQrTypeInfo.yourContentColumnTitle}
            </Text>
            <QRCardDetails
              user={user}
              qrCode={qrCode}
              featuresAccess={featuresAccess}
              setShowSubscriptionExpiredModal={setShowSubscriptionExpiredModal}
            />
          </div>

          <div
            className={cn(
              "flex min-w-0 flex-col items-start justify-center gap-1",
              "lg:hidden",
              "xl:flex xl:flex-1 xl:shrink-0",
            )}
          >
            <>
              <Text
                as="span"
                size="2"
                weight="bold"
                className="hidden whitespace-nowrap lg:block"
              >
                Created
              </Text>
              {createdAt && (
                <Tooltip
                  content={formatDateTime(createdAt)}
                  delayDuration={150}
                >
                  <span className="text-neutral-500">
                    {timeAgo(new Date(createdAt))}
                  </span>
                </Tooltip>
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
}
