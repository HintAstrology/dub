import { QRBuilderData } from "@/ui/modals/qr-builder";
import { EQRType } from "@/ui/qr-builder/constants/get-qr-config.ts";
import { getFiles } from "@/ui/qr-builder/helpers/file-store.ts";
import { Options } from "qr-code-styling";

export type ProcessQrDataOptions = {
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onError?: (error: string) => void;
};

export type TProcessedQRData = {
  title: string;
  styles: Options;
  frameOptions: {
    id: string;
    color?: string;
    textColor?: string;
    text?: string;
  };
  qrType: EQRType;
  file?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

export const processQrDataForServerAction = async (
  qrDataToCreate: QRBuilderData | null,
  options: ProcessQrDataOptions = {},
): Promise<TProcessedQRData | null> => {
  const { onUploadStart, onUploadEnd, onError } = options;

  if (!qrDataToCreate) return null;

  const files = getFiles();
  if (!files || files.length === 0) {
    return { ...qrDataToCreate, file: null };
  }

  try {
    onUploadStart?.();
    const firstFile = files[0];

    const formData = new FormData();
    formData.append("file", firstFile);

    const response = await fetch("/api/qrs/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const { fileId } = await response.json();
    return {
      ...qrDataToCreate,
      file: fileId,
      fileName: firstFile.name,
      fileSize: firstFile.size,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage = "Failed to upload file. Please try again.";
    onError?.(errorMessage);

    return { ...qrDataToCreate, file: null };
  } finally {
    onUploadEnd?.();
  }
};
