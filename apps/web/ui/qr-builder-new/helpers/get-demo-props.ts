import { QRCodeDemoConfig } from "../components/qr-code-demos/qr-code-demo-map";
import { FILE_QR_TYPES } from "../constants/get-qr-config";
import { TQRFormData } from "../types/context";
import { TQrServerData } from "../types/qr-server-data";
import { EQRType } from "../types/qr-type";

interface GetDemoPropsParams {
  qrCodeDemo: QRCodeDemoConfig | null;
  currentQRType: EQRType | null;
  currentFormValues: Record<string, any>;
  isEditMode: boolean;
  initialQrData?: TQrServerData | null;
  formData: TQRFormData | null;
}

/**
 * Get demo props for QR code demo components
 * Handles file-based QR types in edit mode by using server URLs or new files
 */
export function getDemoProps({
  qrCodeDemo,
  currentQRType,
  currentFormValues,
  isEditMode,
  initialQrData,
  formData,
}: GetDemoPropsParams): Record<string, any> {
  if (!qrCodeDemo || !currentQRType) return {};

  const props = qrCodeDemo.propsKeys.reduce(
    (acc: Record<string, any>, key: string) => {
      acc[key] = currentFormValues[key];
      return acc;
    },
    {},
  );

  // In edit mode, for file-based QR types, use server URL as fallback
  // But prioritize new files from form (user uploaded/removed files)
  if (isEditMode && FILE_QR_TYPES.includes(currentQRType)) {
    // Only use fileId if it matches the current QR type (from initialQrData)
    // This prevents showing files from previous QR type when switching types
    const fileId =
      initialQrData?.qrType === currentQRType
        ? initialQrData?.fileId || (formData as any)?.fileId
        : undefined;

    // Check if user has uploaded a new file
    // Also check that it's not a placeholder file (has actual content)
    const hasNewFile =
      (currentQRType === EQRType.IMAGE &&
        props.filesImage &&
        Array.isArray(props.filesImage) &&
        props.filesImage.length > 0 &&
        props.filesImage[0] instanceof File &&
        props.filesImage[0].size > 0 &&
        !(props.filesImage[0] as any).isThumbnail) ||
      (currentQRType === EQRType.PDF &&
        props.filesPDF &&
        Array.isArray(props.filesPDF) &&
        props.filesPDF.length > 0 &&
        props.filesPDF[0] instanceof File &&
        props.filesPDF[0].size > 0 &&
        !(props.filesPDF[0] as any).isThumbnail) ||
      (currentQRType === EQRType.VIDEO &&
        props.filesVideo &&
        Array.isArray(props.filesVideo) &&
        props.filesVideo.length > 0 &&
        props.filesVideo[0] instanceof File &&
        props.filesVideo[0].size > 0 &&
        !(props.filesVideo[0] as any).isThumbnail);

    // Check if user has removed the file (empty array)
    const fileRemoved =
      (currentQRType === EQRType.IMAGE &&
        Array.isArray(props.filesImage) &&
        props.filesImage.length === 0) ||
      (currentQRType === EQRType.PDF &&
        Array.isArray(props.filesPDF) &&
        props.filesPDF.length === 0) ||
      (currentQRType === EQRType.VIDEO &&
        Array.isArray(props.filesVideo) &&
        props.filesVideo.length === 0);

    if (fileRemoved) {
      // User removed the file - clear props to show placeholder
      if (currentQRType === EQRType.IMAGE) {
        props.filesImage = undefined;
      } else if (currentQRType === EQRType.PDF) {
        props.filesPDF = undefined;
      } else if (currentQRType === EQRType.VIDEO) {
        props.filesVideo = undefined;
      }
    } else if (!hasNewFile && fileId) {
      // No new file and file wasn't removed - use server URL for better quality/preview
      // Only if fileId matches current QR type
      const fileUrl = `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/qrs-content/${fileId}`;

      if (currentQRType === EQRType.IMAGE) {
        props.filesImage = fileUrl;
      } else if (currentQRType === EQRType.PDF) {
        props.filesPDF = fileUrl;
      } else if (currentQRType === EQRType.VIDEO) {
        props.filesVideo = fileUrl;
      }
    }
    // If hasNewFile is true, props already contain the new file from currentFormValues
  }

  return props;
}
