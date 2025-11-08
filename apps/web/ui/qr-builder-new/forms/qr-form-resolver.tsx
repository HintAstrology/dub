"use client";

import { prepareFileDataForModal } from "@/ui/modals/qr-content-editor/helpers/prepare-file-data";
import { LoaderCircle } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { EQRType, FILE_QR_TYPES } from "../constants/get-qr-config";
import { useQrBuilderContext } from "../context";
import { TQRFormData } from "../types/context";
import {
  ImageForm,
  PdfForm,
  VideoForm,
  WebsiteForm,
  WhatsAppForm,
  WifiForm,
} from "./components";
import { QRFormRef } from "./types";

interface QRFormResolverProps {
  qrType: EQRType;
  onSubmit: (data: TQRFormData) => void;
  defaultValues?: Partial<TQRFormData>;
  contentOnly?: boolean;
  isEdit?: boolean;
}

export const QrFormResolver = forwardRef<QRFormRef, QRFormResolverProps>(
  ({ qrType, onSubmit, defaultValues, contentOnly, isEdit }, ref) => {
    const { initialQrData } = useQrBuilderContext();

    const [fileData, setFileData] = useState<
      Record<string, File[]> | undefined
    >();
    const [isLoadingFileData, setIsLoadingFileData] = useState(false);

    const isFileBasedQR = FILE_QR_TYPES.includes(qrType);

    // Load file data for file-based QR codes when in edit mode
    useEffect(() => {
      if (!isEdit || !isFileBasedQR) {
        setFileData(undefined);
        return;
      }

      const loadFileData = async () => {
        setIsLoadingFileData(true);
        try {
          const data = await prepareFileDataForModal(initialQrData!);

          setFileData(data);
        } catch (error) {
          console.error("QrFormResolver: Failed to load file data:", error);
          setFileData(undefined);
        } finally {
          setIsLoadingFileData(false);
        }
      };

      loadFileData();
    }, [isEdit, isFileBasedQR, initialQrData]);

    // Combine defaultValues with loaded fileData
    const combinedDefaultValues = useMemo(() => {
      const combined = { ...(defaultValues || {}), ...(fileData || {}) };
      return Object.keys(combined).length > 0 ? combined : undefined;
    }, [defaultValues, fileData]);

    // Show loading state while file data is being loaded
    if (isEdit && isFileBasedQR && isLoadingFileData) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoaderCircle className="text-secondary h-8 w-8 animate-spin" />
        </div>
      );
    }

    const formComponents = {
      [EQRType.WEBSITE]: (
        <WebsiteForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.WHATSAPP]: (
        <WhatsAppForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.WIFI]: (
        <WifiForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.PDF]: (
        <PdfForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={combinedDefaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.IMAGE]: (
        <ImageForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={combinedDefaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.VIDEO]: (
        <VideoForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={combinedDefaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.SOCIAL]: (
        <WebsiteForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.APP_LINK]: (
        <WebsiteForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.FEEDBACK]: (
        <WebsiteForm
          ref={ref}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
    };

    const selectedForm = formComponents[qrType] || (
      <div className="p-4 text-center text-gray-500">
        <p>Form not available for this QR type: {qrType}</p>
      </div>
    );

    return <div className="flex w-full flex-col">{selectedForm}</div>;
  },
);
