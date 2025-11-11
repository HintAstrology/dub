import { NewQrProps, UpdateQrProps } from "@/lib/types";
import { Options } from "qr-code-styling";
import { FRAMES } from "../constants/customization/frames";
import { FILE_QR_TYPES } from "../constants/get-qr-config";
import { TQRFormData } from "../types/context";
import { IFrameData, IQRCustomizationData } from "../types/customization";
import { TNewQRBuilderData } from "../types/qr-builder-data";
import { TQrServerData } from "../types/qr-server-data";
import { EQRType } from "../types/qr-type";
import { TQRUpdateResult } from "../types/update";
import { encodeQRData, parseQRData } from "./qr-data-handlers";
import {
  getCornerDotType,
  getCornerSquareType,
  getDotsType,
  getSuggestedLogoSrc,
} from "./qr-style-mappers";

// ============================================================================
// HELPER FUNCTIONS - QR STYLING OPTIONS
// ============================================================================

const buildQRStylingOptions = (
  customizationData: IQRCustomizationData,
  qrData: string,
): Options => {
  const { style, shape, logo } = customizationData;

  const options: Options = {
    data: qrData,
    width: 300,
    height: 300,
    type: "svg",
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 10,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      color: style.foregroundColor || "#000000",
      type: getDotsType(style.dotsStyle),
    },
    backgroundOptions: {
      color: style.backgroundColor || "#ffffff",
    },
    cornersSquareOptions: {
      color: style.foregroundColor || "#000000",
      type: getCornerSquareType(shape.cornerSquareStyle),
    },
    cornersDotOptions: {
      color: style.foregroundColor || "#000000",
      type: getCornerDotType(shape.cornerDotStyle),
    },
  };

  if (logo.type === "uploaded") {
    if (logo.fileId) {
      // Use full URL for uploaded file (same pattern as QR content files)
      const storageBaseUrl =
        process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
        "https://dev-assets.getqr.com";
      options.image = `${storageBaseUrl}/qrs-content/${logo.fileId}`;
    }
  } else if (logo.type === "suggested" && logo.id && logo.id !== "logo-none") {
    // For suggested logos, always use iconSrc if available
    // If not available (old QRs), lookup from SUGGESTED_LOGOS
    if (logo.iconSrc) {
      options.image = logo.iconSrc;
    } else if (logo.id) {
      // Fallback: Get iconSrc from logo ID
      const logoSrc = getSuggestedLogoSrc(logo.id);
      options.image = logoSrc || logo.id;
    }
  }

  return options;
};

/**
 * Converts frame data to frame options object
 */
const buildFrameOptions = (frameData: IFrameData) => {
  // Find the frame by ID and get its TYPE for storage
  const frame = FRAMES.find((f) => f.id === frameData.id);
  const frameType = frame?.type || "none";

  const result = {
    id: frameType,
    color: frameData.color || "#000000",
    textColor: frameData.textColor || "#ffffff",
    text: frameData.text || "Scan Me",
  };

  return result;
};

/**
 * Converts logo data to logo options object
 */
const buildLogoOptions = (
  logoData: IQRCustomizationData["logo"],
): TQrServerData["logoOptions"] => {
  if (logoData.type === "none") {
    return undefined;
  }

  if (logoData.type === "suggested") {
    return {
      type: "suggested",
      id: logoData.id,
    };
  }

  if (logoData.type === "uploaded") {
    return {
      type: "uploaded",
      fileId: logoData.fileId,
    };
  }

  return undefined;
};

// ============================================================================
// HELPER FUNCTIONS - EXTRACT/PARSE DATA
// ============================================================================

const extractLogoData = (
  logoOptions?: TQrServerData["logoOptions"] | NewQrProps["logoOptions"],
  styles?: Options,
): {
  type: "none" | "suggested" | "uploaded";
  id?: string;
  iconSrc?: string;
  fileId?: string;
} => {
  // Prioritize logoOptions if available (new format)
  if (logoOptions) {
    console.log("Using logoOptions");
    if (logoOptions.type === "suggested") {
      const iconSrc = logoOptions.id
        ? getSuggestedLogoSrc(logoOptions.id)
        : undefined;
      return {
        type: "suggested",
        id: logoOptions.id,
        iconSrc,
      };
    } else if (logoOptions.type === "uploaded") {
      return {
        type: "uploaded",
        fileId: logoOptions.fileId,
      };
    }
  }

  // Fallback to styles.image for backward compatibility with old QRs
  if (!styles?.image) {
    return { type: "none" };
  }

  const imageStr = typeof styles.image === "string" ? styles.image : "";

  if (imageStr.includes("/files/") || imageStr.includes("/qrs-content/")) {
    const match = imageStr.match(/\/(files|qrs-content)\/([^/]+)$/);
    return {
      type: "uploaded",
      fileId: match?.[2],
    };
  }

  // Check if it's a suggested logo (path to /logos/ - legacy format)
  if (imageStr.includes("/logos/")) {
    const match = imageStr.match(/\/logos\/([^.]+)\.png$/);
    const logoId = match?.[1];
    // Lookup the actual iconSrc for old QRs
    const iconSrc = logoId ? getSuggestedLogoSrc(logoId) : undefined;
    return {
      type: "suggested",
      id: logoId,
      iconSrc: iconSrc,
    };
  }

  // Check if it's a Next.js static import path (/_next/static/...)
  if (imageStr.startsWith("/_next/")) {
    const logoIdMatch = imageStr.match(/logo-([^/.]+)/);
    return {
      type: "suggested",
      id: logoIdMatch ? `logo-${logoIdMatch[1]}` : undefined,
      iconSrc: imageStr,
    };
  }

  // Check if it's just a logo ID (starts with "logo-")
  if (imageStr.startsWith("logo-")) {
    return {
      type: "suggested",
      id: imageStr,
    };
  }

  // Otherwise it's an uploaded logo (legacy or blob URL)
  return { type: "uploaded" };
};

/**
 * Get style ID from QRCodeStyling type
 */
const getDotsStyleId = (type: any): string => {
  const typeMap: Record<string, string> = {
    square: "dots-square",
    dots: "dots-dots",
    rounded: "dots-rounded",
    classy: "dots-classy",
    "classy-rounded": "dots-classy-rounded",
    "extra-rounded": "dots-extra-rounded",
  };
  return typeMap[type] || "dots-square";
};

const getCornerSquareStyleId = (type: any): string => {
  const typeMap: Record<string, string> = {
    square: "corner-square-square",
    rounded: "corner-square-rounded",
    dot: "corner-square-dot",
    "classy-rounded": "corner-square-classy-rounded",
  };
  return typeMap[type] || "corner-square-square";
};

const getCornerDotStyleId = (type: any): string => {
  const typeMap: Record<string, string> = {
    square: "corner-dot-square",
    dot: "corner-dot-dot",
    dots: "corner-dot-dots",
    rounded: "corner-dot-rounded",
    classy: "corner-dot-classy",
  };
  return typeMap[type] || "corner-dot-square";
};

/**
 * Extract customization data from server styles, frame options, and logo options
 * IMPORTANT: Storage has frame TYPE (e.g., "card"), but we need ID (e.g., "frame-card")
 */
export const extractCustomizationData = (
  styles: Options,
  frameOptions: any,
  logoOptions?: TQrServerData["logoOptions"] | NewQrProps["logoOptions"],
): IQRCustomizationData => {
  // Convert frame TYPE to ID by finding the frame in FRAMES array
  const frameType = frameOptions?.id || "none";
  const frame = FRAMES.find((f) => f.type === frameType);
  const frameId = frame?.id || "frame-none";

  return {
    frame: {
      id: frameId, // Convert TYPE to ID (e.g., "card" -> "frame-card")
      color: frameOptions?.color,
      textColor: frameOptions?.textColor,
      text: frameOptions?.text,
    },
    style: {
      dotsStyle: getDotsStyleId(styles.dotsOptions?.type),
      foregroundColor: styles.dotsOptions?.color || "#000000",
      backgroundColor: styles.backgroundOptions?.color || "#ffffff",
    },
    shape: {
      cornerSquareStyle: getCornerSquareStyleId(
        styles.cornersSquareOptions?.type,
      ),
      cornerDotStyle: getCornerDotStyleId(styles.cornersDotOptions?.type),
    },
    logo: extractLogoData(logoOptions, styles),
  };
};

// ============================================================================
// MAIN CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert new QR builder data to server API format
 */
export const convertNewQRBuilderDataToServer = async (
  builderData: TNewQRBuilderData,
  options: { domain: string },
): Promise<NewQrProps> => {
  const { qrType, formData, customizationData, title, fileId } = builderData;
  const { domain } = options;

  const data = encodeQRData(qrType, formData, fileId);

  const styles = buildQRStylingOptions(customizationData, data);

  const frameOptions = buildFrameOptions(customizationData.frame);

  const logoOptions = buildLogoOptions(customizationData.logo);

  const qrTitle =
    title || `${qrType.charAt(0).toUpperCase() + qrType.slice(1)} QR Code`;

  // Use the encoded data directly
  const linkUrl = data;

  const result = {
    data,
    qrType,
    title: qrTitle,
    styles,
    frameOptions,
    logoOptions,
    fileId: fileId || undefined,
    link: {
      url: linkUrl,
      domain,
      tagId: null,
      webhookIds: [],
    },
  };

  return result;
};

/**
 * Convert server QR data back to new builder format
 */
export const convertServerQRToNewBuilder = (
  serverData: TQrServerData,
): TNewQRBuilderData => {
  // Parse QR data to form data using qr-data-handlers
  const sourceData = serverData.link?.url || serverData.data;
  const formData = parseQRData(
    serverData.qrType as EQRType,
    sourceData,
  ) as TQRFormData;

  // Add qrName from title to formData
  if (serverData.title) {
    (formData as any).qrName = serverData.title;
  }

  // Extract customization data from styles, frame options, and logo options
  const customizationData = extractCustomizationData(
    (serverData.styles || {}) as Options,
    serverData.frameOptions,
    serverData.logoOptions || undefined,
  );

  return {
    qrType: serverData.qrType as EQRType,
    formData,
    customizationData,
    title: serverData.title ?? "",
    fileId: serverData.fileId ?? undefined,
  };
};

/**
 * Compare original QR data with new builder data and generate update payload
 * Used for determining what changed and building the update request
 */
// TODO: REMOVE THIS FUNCTION
export const prepareQRUpdates = async (
  originalQR: TQrServerData,
  newBuilderData: TNewQRBuilderData,
  options: {
    domain: string;
  },
): Promise<TQRUpdateResult> => {
  const { domain } = options;

  // Convert new builder data to server format
  const newServerData = await convertNewQRBuilderDataToServer(
    newBuilderData,
    options,
  );

  // Check what changed
  const titleChanged = newBuilderData.title !== originalQR.title;
  const qrTypeChanged = newBuilderData.qrType !== originalQR.qrType;

  // Check if QR types are file-based
  const originalQrHasFileQrType = FILE_QR_TYPES.includes(
    originalQR.qrType as EQRType,
  );
  const newQrDataHasFileQrType = FILE_QR_TYPES.includes(
    newBuilderData.qrType as EQRType,
  );

  // Check frame options changes
  const frameOptionsChanged = (() => {
    const originalFrame = originalQR.frameOptions as any;
    const newFrame = newServerData.frameOptions;

    const fieldsToCheck = ["id", "color", "text", "textColor"] as const;

    return fieldsToCheck.some(
      (field) => newFrame?.[field] !== originalFrame?.[field],
    );
  })();

  // Check logo options changes - need special handling for uploaded -> suggested transition
  const originalLogoWasUploaded = originalQR.logoOptions?.type === "uploaded";
  const newLogoIsSuggested = newServerData.logoOptions?.type === "suggested";
  const logoTypeChanged = originalLogoWasUploaded && newLogoIsSuggested;

  // Build logo options without fileId when transitioning from uploaded to suggested
  // When serialized to JSON, undefined fields are omitted, which signals removal to the API
  let finalLogoOptions = newServerData.logoOptions;
  if (logoTypeChanged && finalLogoOptions) {
    const { fileId, ...rest } = finalLogoOptions as any;
    finalLogoOptions = rest;
  }

  // Normalize null/undefined for comparison
  const normalizedOriginalLogo = originalQR.logoOptions ?? undefined;
  const normalizedFinalLogo = finalLogoOptions ?? undefined;

  const logoOptionsChanged =
    JSON.stringify(normalizedOriginalLogo) !==
    JSON.stringify(normalizedFinalLogo);

  // Check data changes
  const originalData = originalQR?.link?.url || originalQR.data || "";
  const newData = newServerData.data || "";
  const dataChanged = newData !== originalData;

  // Check styles changes (excluding data field)
  const originalStyles = { ...(originalQR.styles as Options) };
  const newStyles = { ...newServerData.styles };

  delete originalStyles.data;
  delete newStyles.data;

  // Deep comparison helper for objects (handles different key orders and nested objects)
  const deepEqual = (obj1: any, obj2: any): boolean => {
    // Sort keys recursively for nested objects
    const sortKeys = (obj: any): any => {
      if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
      }
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => {
          result[key] = sortKeys(obj[key]);
          return result;
        }, {});
    };

    return JSON.stringify(sortKeys(obj1)) === JSON.stringify(sortKeys(obj2));
  };

  const stylesChanged = !deepEqual(originalStyles, newStyles);

  // Check files changes - detect both adding and removing files
  // Normalize null/undefined for comparison
  const normalizedOriginalFileId = originalQR.fileId ?? undefined;
  const normalizedNewFileId = newBuilderData.fileId ?? undefined;
  const filesChanged = normalizedNewFileId !== normalizedOriginalFileId;

  // Determine fileId value:
  // - If new QR type is not file-based, don't include fileId (undefined)
  // - If new QR type is file-based, use the provided fileId
  // When fileId is undefined, it will be omitted from JSON serialization
  const finalFileId = newQrDataHasFileQrType
    ? newBuilderData.fileId
    : undefined;

  const hasChanges =
    titleChanged ||
    dataChanged ||
    qrTypeChanged ||
    frameOptionsChanged ||
    logoOptionsChanged ||
    stylesChanged ||
    filesChanged;

  // // For file-based QRs, link.url should be empty; otherwise use the new destination
  // const linkUrl = newQrDataHasFileQrType ? "" : newData;

  const updateData: UpdateQrProps = {
    data: newData,
    qrType: newBuilderData.qrType,
    title: newBuilderData.title,
    styles: newServerData.styles,
    frameOptions: newServerData.frameOptions,
    logoOptions: finalLogoOptions,
    fileId: finalFileId,
    link: {
      url: newData,
      domain,
      tagId: null,
      webhookIds: [],
    },
  };

  console.log("changes", {
    title: titleChanged,
    data: dataChanged,
    qrType: qrTypeChanged,
    frameOptions: frameOptionsChanged,
    styles: stylesChanged,
    logoOptions: logoOptionsChanged,
    files: filesChanged,
  });

  return {
    hasChanges,
    changes: {
      title: titleChanged,
      data: dataChanged,
      qrType: qrTypeChanged,
      frameOptions: frameOptionsChanged,
      styles: stylesChanged,
      logoOptions: logoOptionsChanged,
      files: filesChanged,
    },
    updateData,
  };
};
