import { DEFAULT_QR_CUSTOMIZATION } from "../constants/default-qr-customization.constants";
import { TQRFormData, TQrType } from "../types/context";
import { IQRCustomizationData } from "../types/customization";
import { TQrServerData } from "../types/qr-server-data";
import { convertServerQRToNewBuilder } from "./data-converters";

export interface InitializedProps {
  qrTitle: string;
  selectedQrType: TQrType;
  formData: TQRFormData | null;
  customizationData: IQRCustomizationData;
  fileId?: string;
}

/**
 * Get initialized props from initialQrData or return default values
 */
export function getInitializedProps(
  initialQrData?: TQrServerData | null,
): InitializedProps {
  if (initialQrData) {
    const builderData = convertServerQRToNewBuilder(initialQrData);

    return {
      qrTitle: builderData.title || "",
      selectedQrType: builderData.qrType,
      formData: builderData.formData,
      customizationData: builderData.customizationData,
      fileId: builderData.fileId,
    };
  }

  return {
    qrTitle: "",
    selectedQrType: null,
    formData: null,
    customizationData: DEFAULT_QR_CUSTOMIZATION,
    fileId: undefined,
  };
}
