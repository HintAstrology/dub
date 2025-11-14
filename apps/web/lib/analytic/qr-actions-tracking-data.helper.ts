import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";

type QROperation = "create" | "update" | "activate" | "deactivate" | "delete";

const QR_ERROR_FALLBACKS: Record<
  QROperation,
  { errorCode: string; errorMessage: string }
> = {
  create: {
    errorCode: "qr_creation_error",
    errorMessage: "Failed to create QR",
  },
  update: {
    errorCode: "qr_update_error",
    errorMessage: "Failed to update QR",
  },
  activate: {
    errorCode: "qr_activation_error",
    errorMessage: "Failed to activate QR",
  },
  deactivate: {
    errorCode: "qr_deactivation_error",
    errorMessage: "Failed to deactivate QR",
  },
  delete: {
    errorCode: "qr_deletion_error",
    errorMessage: "Failed to delete QR",
  },
};

export const qrActionsTrackingParams = (qrCode: TQrServerData) => {
  const frameOptions = qrCode.frameOptions;

  return {
    qrId: qrCode.id,
    qrType: qrCode.qrType,
    qrFrame: frameOptions?.id !== "none" ? frameOptions?.id : undefined,
    qrText: frameOptions?.text,
    qrFrameColour: frameOptions?.color,
    qrTextColour: frameOptions?.textColor,
    qrStyle: qrCode.styles?.dotsOptions?.type,
    qrBorderColour: qrCode.styles?.cornersSquareOptions?.color,
    qrBorderStyle: qrCode.styles?.cornersSquareOptions?.type,
    qrCenterStyle: qrCode.styles?.cornersDotOptions?.type,
    qrLogo:
      qrCode.logoOptions?.type === "uploaded"
        ? "upload"
        : qrCode.logoOptions?.id || "logo-none",

    link_url: qrCode.link?.shortLink,
    link_id: qrCode.link?.id,
    target_url: qrCode.link?.url,
  };
};

export const qrActionsTrackingParamsError = (
  qrCode: TQrServerData,
  operation: QROperation,
  errorResponse: any,
) => {
  const fallback = QR_ERROR_FALLBACKS[operation];

  return {
    qrId: qrCode.id,

    link_url: qrCode.link?.shortLink ?? null,
    link_id: qrCode.link?.id ?? null,
    target_url: qrCode.link?.url ?? null,

    error_code: errorResponse?.error?.code ?? fallback.errorCode,
    error_message: errorResponse?.error?.message ?? fallback.errorMessage,
  };
};
