import { TQRFormData } from "./context";
import { IQRCustomizationData } from "./customization";
import { EQRType } from "./qr-type";

/**
 * New builder internal data format - used throughout the builder
 */
export type TNewQRBuilderData = {
  qrType: EQRType;
  formData: TQRFormData;
  customizationData: IQRCustomizationData;
  title?: string;
  fileId?: string;
};
