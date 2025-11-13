import { getFileContent } from "@/lib/actions/get-file-content.ts";
import { ILogoData } from "@/ui/qr-builder-new/types/customization";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import {
  compressImage,
  createCompressedImageFile,
} from "@/ui/utils/compress-image.ts";

/**
 * Prepares image file with compression
 */
const prepareImageFile = async (
  qr: TQrServerData,
): Promise<{ filesImage: File[] } | undefined> => {
  try {
    const result = await getFileContent(qr.fileId!);
    if (!result.success) {
      console.log("prepareImageFile: getFileContent failed");
      return undefined;
    }

    const compressedBlob = await compressImage(result.data);
    const compressedFile = createCompressedImageFile(
      compressedBlob,
      qr.file?.name!,
      qr.fileId!,
      qr.file?.size || 0,
    );

    return { filesImage: [compressedFile] };
  } catch (error) {
    console.warn(`Failed to prepare image file:`, error);
    return undefined;
  }
};

/**
 * Prepares PDF placeholder file
 */
const preparePdfFile = (
  qr: TQrServerData,
): { filesPDF: File[] } | undefined => {
  if (!qr.file?.name) {
    console.log("preparePdfFile: missing file.name");
    return undefined;
  }

  const placeholderFile = new File([""], qr.file.name, {
    type: "application/pdf",
  });

  Object.assign(placeholderFile, {
    isThumbnail: true,
    fileId: qr.fileId,
    originalFileName: qr.file.name,
    originalFileSize: qr.file.size,
  });

  return { filesPDF: [placeholderFile] };
};

/**
 * Prepares Video placeholder file
 */
const prepareVideoFile = (
  qr: TQrServerData,
): { filesVideo: File[] } | undefined => {
  if (!qr.file?.name) {
    console.log("prepareVideoFile: missing file.name");
    return undefined;
  }

  console.log("prepareVideoFile: creating placeholder for", qr.file.name);
  const placeholderFile = new File([""], qr.file.name, {
    type: "video/mp4",
  });

  Object.assign(placeholderFile, {
    isThumbnail: true,
    fileId: qr.fileId,
    originalFileName: qr.file.name,
    originalFileSize: qr.file.size,
  });

  console.log("prepareVideoFile: created placeholder", placeholderFile);
  return { filesVideo: [placeholderFile] };
};

/**
 * Prepares file data for QR content editor modal
 * Creates File objects with metadata for file upload fields
 */
export const fetchExistingFileData = async (
  qr: TQrServerData,
): Promise<Record<string, File[]> | undefined> => {
  const { qrType, fileId, file } = qr;

  if (!fileId || !file?.name) {
    return undefined;
  }

  try {
    let result;
    switch (qrType) {
      case "image":
        result = await prepareImageFile(qr);
        break;
      case "pdf":
        result = preparePdfFile(qr);
        break;
      case "video":
        result = prepareVideoFile(qr);
        break;
      default:
        return undefined;
    }

    return result;
  } catch (error) {
    console.error(`Failed to prepare file data for QR ${qr.id}:`, error);
    return undefined;
  }
};

/**
 * Prepares existing logo file from fileId
 */
export const fetchExistingLogoFileData = async (
  logoData: ILogoData,
): Promise<File | undefined> => {
  if (!logoData.fileId) {
    return undefined;
  }

  // Use default values if file metadata is not available
  const fileName = logoData.file?.name || "logo.png";
  const fileSize = logoData.file?.size || 0;

  try {
    const result = await getFileContent(logoData.fileId);

    if (!result.success) {
      console.log("prepareLogoFile: getFileContent failed", result);
      return undefined;
    }

    const compressedBlob = await compressImage(result.data);

    const compressedFile = createCompressedImageFile(
      compressedBlob,
      fileName,
      logoData.fileId,
      fileSize,
    );

    return compressedFile;
  } catch (error) {
    console.warn("prepareLogoFile: Failed", error);
    return undefined;
  }
};
