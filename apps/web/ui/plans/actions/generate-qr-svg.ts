"use server";

import { extractCustomizationData } from "@/ui/qr-builder-new/helpers/data-converters";
import { mapCustomizationToQROptions } from "@/ui/qr-builder-new/helpers/qr-style-mappers";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type";
import QRCodeStyling, { Options } from "qr-code-styling";

/**
 * Generate QR code SVG string from QR data
 * This function uses qr-code-styling to generate the SVG on the server
 */
export async function generateQRSVG(
  qrData: TQrServerData | null,
): Promise<string | null> {
  if (!qrData) return null;

  try {
    // Extract customization data from styles
    const customizationData = extractCustomizationData(
      (qrData.styles || {}) as Options,
      qrData.frameOptions || null,
      qrData.logoOptions || undefined,
    );

    // Get QR data (short link)
    const qrDataString =
      qrData.qrType === EQRType.WIFI
        ? qrData.data
        : qrData.data ||
          qrData.link?.shortLink ||
          (qrData.link?.domain && qrData.link?.key
            ? `https://${qrData.link.domain}/${qrData.link.key}`
            : qrData.link?.url) ||
          "https://getqr.com/qr-complete-setup";

    // Build QR styling options using the mapper
    const mappedOptions = mapCustomizationToQROptions(
      customizationData,
      qrDataString,
    );

    // Create QR code options
    const qrOptions: Options = {
      ...mappedOptions,
      width: qrData.styles?.width || 300,
      height: qrData.styles?.height || 300,
      type: "svg" as const,
      margin: qrData.styles?.margin || 10,
      qrOptions: qrData.styles?.qrOptions || {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "Q",
      },
      imageOptions: qrData.styles?.imageOptions || {
        imageSize: 0.4,
        hideBackgroundDots: true,
        crossOrigin: "anonymous",
        margin: 10,
      },
    };

    // Handle logo if present
    if (customizationData.logo.type === "uploaded" && customizationData.logo.fileId) {
      qrOptions.image = `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/qrs-content/${customizationData.logo.fileId}`;
    } else if (customizationData.logo.type === "suggested" && customizationData.logo.id && customizationData.logo.id !== "logo-none") {
      if (customizationData.logo.iconSrc) {
        qrOptions.image = customizationData.logo.iconSrc;
      }
    }

    // Create QR code instance
    const qrCode = new QRCodeStyling(qrOptions);

    // Generate SVG string
    const svgBlob = await qrCode.getRawData("svg");
    
    if (!svgBlob) return null;

    // Convert Blob to string
    if (svgBlob instanceof Blob) {
      const text = await svgBlob.text();
      return text;
    } else if (typeof svgBlob === "string") {
      return svgBlob;
    }

    return null;
  } catch (error) {
    console.error("Error generating QR SVG:", error);
    return null;
  }
}

