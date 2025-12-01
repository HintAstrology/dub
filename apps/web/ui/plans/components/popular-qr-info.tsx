"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less";
import { PlansFeatures } from "@/ui/plans/components/plans-features.tsx";
import { QRCanvas } from "@/ui/qr-builder-new/components/qr-canvas";
import { QR_TYPES } from "@/ui/qr-builder-new/constants/get-qr-config";
import { extractCustomizationData } from "@/ui/qr-builder-new/helpers/data-converters";
import { useQRCodeStyling } from "@/ui/qr-builder-new/hooks/use-qr-code-styling";
import { IQRCustomizationData } from "@/ui/qr-builder-new/types/customization";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type";
import { Heading, Text } from "@radix-ui/themes";
import { Options } from "qr-code-styling/lib/types";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { QrInfoBadge } from "./qr-info-badge";

interface IPopularQrInfo {
  mostScannedQR: (TQrServerData & { svgString?: string | null }) | null;
  featuresAccess: FeaturesAccess;
  handleScroll: () => void;
}

export const PopularQrInfo: FC<IPopularQrInfo> = ({
  mostScannedQR,
  featuresAccess,
}) => {
  // Use SVG string from service if available, otherwise fallback to client-side generation
  const svgStringFromService = mostScannedQR?.svgString;

  const defaultCustomizationData = useMemo<IQRCustomizationData>(
    () => ({
      frame: {
        id: "frame-none",
        color: "#000000",
        textColor: "#000000",
        text: "SCAN ME",
      },
      style: {
        dotsStyle: "dots-square",
        foregroundColor: "#000000",
        backgroundColor: "#ffffff",
      },
      shape: {
        cornerSquareStyle: "corner-square-square",
        cornerDotStyle: "corner-dot-square",
      },
      logo: { type: "none" as const },
    }),
    [],
  );

  const customizationData = useMemo(() => {
    if (!mostScannedQR) return defaultCustomizationData;
    try {
      return extractCustomizationData(
        (mostScannedQR.styles || {}) as Options,
        mostScannedQR.frameOptions || null,
        mostScannedQR.logoOptions || undefined,
      );
    } catch (error) {
      console.error("Error extracting customization data:", error);
      return defaultCustomizationData;
    }
  }, [mostScannedQR, defaultCustomizationData]);

  const qrData = useMemo(() => {
    if (!mostScannedQR) return "https://getqr.com/qr-complete-setup";

    // For WiFi QR codes, use the data field directly
    if (mostScannedQR.qrType === EQRType.WIFI) {
      return mostScannedQR.data;
    }

    // For other QR types, use the data field (contains short link like 'https://link-dev.getqr.com/E3FlKdj')
    return (
      mostScannedQR.data ||
      mostScannedQR.link?.shortLink ||
      (mostScannedQR.link?.domain && mostScannedQR.link?.key
        ? `https://${mostScannedQR.link.domain}/${mostScannedQR.link.key}`
        : mostScannedQR.link?.url) ||
      "https://getqr.com/qr-complete-setup"
    );
  }, [mostScannedQR]);

  // Only use client-side generation if SVG from service is not available
  const { svgString: svgStringFromClient } = useQRCodeStyling({
    customizationData,
    defaultData: qrData,
  });

  // Prefer SVG from service, fallback to client-side generated
  const svgString = svgStringFromService || svgStringFromClient;

  // Measure container height to make QR canvas square
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(140);

  useEffect(() => {
    const updateSize = () => {
      if (qrContainerRef.current) {
        const height = qrContainerRef.current.clientHeight;
        if (height > 0) {
          // Subtract padding (p-3 = 12px on each side = 24px total)
          setQrSize(Math.max(100, height - 24));
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [mostScannedQR]);

  return (
    <div className="border-border-500 flex flex-col gap-4 rounded-xl border bg-white px-4 py-3 shadow-sm lg:h-full lg:flex-1 lg:gap-6 lg:p-6">
      <div>
        <Heading
          as="h2"
          align="left"
          size={{ initial: "3", lg: "5" }}
          className="text-foreground font-semibold"
        >
          {!featuresAccess.featuresAccess
            ? "Your most popular QR code is now deactivated"
            : "Your Top Performing QR"}
        </Heading>
      </div>

      {mostScannedQR ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
          {/* QR Code Display */}
          <div ref={qrContainerRef} className="flex flex-shrink-0 items-center">
            {svgString ? (
              <div className="flex h-full w-max items-center justify-center rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200">
                <QRCanvas
                  svgString={svgString}
                  width={qrSize}
                  height={qrSize}
                  className="p-1"
                />
              </div>
            ) : (
              <div className="flex h-full w-[140px] items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-200">
                <Text size="2" className="text-muted-foreground">
                  Loading...
                </Text>
              </div>
            )}
          </div>

          {/* QR Code Info */}
          <div className="flex flex-1 flex-col justify-between gap-3">
            <div>
              <Text
                as="p"
                size="1"
                className="text-muted-foreground mb-1 font-medium uppercase tracking-wide"
              >
                QR Name
              </Text>
              <Text
                as="p"
                size="1"
                className="text-muted-foreground mb-1 font-medium uppercase tracking-wide"
              >
                {mostScannedQR.title || "Untitled QR Code"}
              </Text>
            </div>

            <div>
              <Text
                as="p"
                size="1"
                className="text-muted-foreground mb-1 font-medium uppercase tracking-wide"
              >
                Type
              </Text>
              <Text as="p" size="2" weight="bold" className="text-foreground">
                {QR_TYPES.find(
                  (item) => (mostScannedQR.qrType || "website") === item.id,
                )?.label || "Website"}
              </Text>
            </div>

            <div>
              <Text
                as="p"
                size="1"
                className="text-muted-foreground mb-1 font-medium uppercase tracking-wide"
              >
                Scans
              </Text>
              <Text as="p" size="2" weight="bold" className="text-foreground">
                {(mostScannedQR.link?.clicks ?? 0).toLocaleString()}
              </Text>
            </div>

            <div>
              <Text
                as="p"
                size="1"
                className="text-muted-foreground mb-1 font-medium uppercase tracking-wide"
              >
                Status
              </Text>
              <QrInfoBadge
                mostScannedQR={mostScannedQR}
                featuresAccess={featuresAccess}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[140px] items-center justify-center rounded-lg bg-gray-50">
          <Text size="2" className="text-muted-foreground">
            No QR Code available
          </Text>
        </div>
      )}

      <div className="hidden lg:block">
        <PlansFeatures />
      </div>
    </div>
  );
};
