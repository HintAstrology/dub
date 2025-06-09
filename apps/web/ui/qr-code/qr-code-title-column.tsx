"use client";

import { QRType } from "@/ui/qr-builder/constants/get-qr-config.ts";
import { QRCanvas } from "@/ui/qr-builder/qr-canvas.tsx";
import { QRCardAnalyticsBadge } from "@/ui/qr-code/qr-code-card-analytics-badge.tsx";
import { QRCardDetails } from "@/ui/qr-code/qr-code-card-details.tsx";
import { QRCardStatus } from "@/ui/qr-code/qr-code-card-status.tsx";
import { QRCardTitle } from "@/ui/qr-code/qr-code-card-title.tsx";
import { QrCardType } from "@/ui/qr-code/qr-code-card-type.tsx";
import { Tooltip, useMediaQuery } from "@dub/ui";
import { cn, formatDateTime, timeAgo } from "@dub/utils";
import { Text } from "@radix-ui/themes";
import QRCodeStyling from "qr-code-styling";
import { RefObject, useRef } from "react";
import { ResponseQrCode } from "./qr-codes-container";

interface QrCodeTitleColumnProps {
  qrCode: ResponseQrCode;
  canvasRef: RefObject<HTMLCanvasElement>;
  builtQrCodeObject: QRCodeStyling | null;
  currentQrTypeInfo: QRType;
  isTrialOver?: boolean;
}

export function QrCodeTitleColumn({
  qrCode,
  canvasRef,
  builtQrCodeObject,
  currentQrTypeInfo,
  isTrialOver,
}: QrCodeTitleColumnProps) {
  const { domain, key, createdAt, shortLink, archived, title } =
    qrCode?.link ?? {};
  const { width } = useMediaQuery();

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="flex h-full min-w-0 flex-row items-start gap-4"
    >
      <div className="flex flex-col gap-2">
        <QRCanvas
          ref={canvasRef}
          qrCode={builtQrCodeObject}
          width={width! < 1024 ? 90 : 64}
          height={width! < 1024 ? 90 : 64}
        />
        {archived || isTrialOver ? (
          <QRCardStatus className="lg:hidden" archived />
        ) : (
          <QRCardAnalyticsBadge className="lg:hidden" qrCode={qrCode} />
        )}
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
          <QRCardTitle qrCode={qrCode} />
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
          <QRCardDetails qrCode={qrCode} />
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-col items-start justify-center gap-1",
            "lg:hidden",
            "xl:flex xl:flex-1 xl:shrink-0",
          )}
        >
          {!isTrialOver && (
            <>
              <Text
                as="span"
                size="2"
                weight="bold"
                className="hidden whitespace-nowrap lg:block"
              >
                Created
              </Text>
              <Tooltip content={formatDateTime(createdAt)} delayDuration={150}>
                <span className="text-neutral-500">{timeAgo(createdAt)}</span>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
