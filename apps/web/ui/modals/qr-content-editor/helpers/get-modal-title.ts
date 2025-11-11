import { TQrType } from "@/ui/qr-builder-new/types/context";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type";

export const getModalTitle = (qrType: TQrType): string => {
  switch (qrType) {
    case EQRType.WEBSITE:
      return "Edit Website URL";
    case EQRType.APP_LINK:
    case EQRType.SOCIAL:
    case EQRType.FEEDBACK:
      return "Edit URL";
    case EQRType.PDF:
      return "Update PDF";
    case EQRType.IMAGE:
      return "Update Image";
    case EQRType.VIDEO:
      return "Update Video";
    case EQRType.WHATSAPP:
      return "Edit Whatsapp Number";
    case EQRType.WIFI:
      return "Change Wifi settings";
    default:
      return "Edit QR Content";
  }
};
