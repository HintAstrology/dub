import { useCallback, useRef, useState } from "react";
import { FILE_QR_TYPES } from "../constants/get-qr-config";
import { convertServerQRToNewBuilder } from "../helpers/data-converters";
import {
  fetchExistingFileData,
  fetchExistingLogoFileData,
} from "../helpers/prepare-file-data";
import { TQRFormData } from "../types/context";
import { IQRCustomizationData } from "../types/customization";
import { TQrServerData } from "../types/qr-server-data";
import { EQRType } from "../types/qr-type";

interface UseInitializeQrDataParams {
  initialQrData?: TQrServerData | null;
  onInitialized: (params: {
    qrType: EQRType;
    formData: TQRFormData;
    customizationData: IQRCustomizationData;
    currentFormValues: Record<string, any>;
  }) => void;
}

interface UseInitializeQrDataReturn {
  isInitializing: boolean;
  initialize: () => Promise<void>;
  hasInitializedRef: React.MutableRefObject<string | null>;
}

/**
 * Hook for initializing QR builder data from server data in edit mode
 * Handles loading files and logo files asynchronously
 */
export function useInitializeQrData({
  initialQrData,
  onInitialized,
}: UseInitializeQrDataParams): UseInitializeQrDataReturn {
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const hasInitializedRef = useRef<string | null>(null);

  const initialize = useCallback(async () => {
    if (!initialQrData) {
      return;
    }

    // Check if we've already initialized for this QR data
    const qrId = initialQrData.id;
    if (hasInitializedRef.current === qrId) {
      return;
    }

    hasInitializedRef.current = qrId;
    setIsInitializing(true);

    try {
      // Convert server data to builder format
      const builderData = convertServerQRToNewBuilder(initialQrData);
      const isFileBasedQR = FILE_QR_TYPES.includes(builderData.qrType);

      // Load files in parallel
      const [fileDataResult, logoFileResult] = await Promise.allSettled([
        // Load file for file-based QR codes
        isFileBasedQR && initialQrData.fileId
          ? fetchExistingFileData(initialQrData)
          : Promise.resolve(undefined),
        // Load logo file if exists
        builderData.customizationData.logo.type === "uploaded" &&
        builderData.customizationData.logo.fileId
          ? fetchExistingLogoFileData(builderData.customizationData.logo)
          : Promise.resolve(undefined),
      ]);

      // Update formData with loaded files
      let updatedFormData = builderData.formData;
      if (fileDataResult.status === "fulfilled" && fileDataResult.value) {
        updatedFormData = {
          ...updatedFormData,
          ...fileDataResult.value,
        } as TQRFormData;
      }

      // Update customizationData with loaded logo file
      let updatedCustomizationData = builderData.customizationData;
      if (logoFileResult.status === "fulfilled" && logoFileResult.value) {
        updatedCustomizationData = {
          ...updatedCustomizationData,
          logo: {
            ...updatedCustomizationData.logo,
            file: logoFileResult.value,
          },
        };
      }

      // Update currentFormValues
      const initialValues: Record<string, any> = {};
      if (builderData.title) {
        initialValues.qrName = builderData.title;
      }
      if (updatedFormData) {
        Object.assign(initialValues, updatedFormData);
      }

      // Call callback with initialized data
      onInitialized({
        qrType: builderData.qrType,
        formData: updatedFormData,
        customizationData: updatedCustomizationData,
        currentFormValues: initialValues,
      });
    } catch (error) {
      console.error(
        "Failed to initialize QR builder from initialQrData:",
        error,
      );
    } finally {
      setIsInitializing(false);
    }
  }, [initialQrData, onInitialized]);

  return {
    isInitializing,
    initialize,
    hasInitializedRef,
  };
}
