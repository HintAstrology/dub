"use client";

import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";

import { FILE_QR_TYPES } from "../../constants/get-qr-config";
import { useQrBuilderContext } from "../../context";
import { TQRFormData } from "../../types/context";
import { QRFormRef } from "../../types/qr-form-ref";
import { EQRType } from "../../types/qr-type";
import {
  ImageForm,
  PdfForm,
  VideoForm,
  WebsiteForm,
  WhatsAppForm,
  WifiForm,
} from "./components";

interface QRFormResolverProps {
  qrType: EQRType;
  onSubmit: (data: TQRFormData) => void;
  defaultValues?: Partial<TQRFormData>;
  contentOnly?: boolean;
}

export const QrFormResolver = forwardRef<QRFormRef, QRFormResolverProps>(
  ({ qrType, onSubmit, defaultValues, contentOnly }, ref) => {
    const { isInitializing, isEditMode } = useQrBuilderContext();
    const isFileBasedQR = FILE_QR_TYPES.includes(qrType);

    // Show loading state while initializing file-based QR codes in edit mode
    if (isInitializing && isEditMode && isFileBasedQR) {
      return (
        <div className="flex w-full items-center justify-center py-12">
          <LoaderCircle className="text-secondary h-8 w-8 animate-spin" />
        </div>
      );
    }
    const formComponents = {
      [EQRType.WEBSITE]: (
        <WebsiteForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.WHATSAPP]: (
        <WhatsAppForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.WIFI]: (
        <WifiForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.PDF]: (
        <PdfForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.IMAGE]: (
        <ImageForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.VIDEO]: (
        <VideoForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.SOCIAL]: (
        <WebsiteForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.APP_LINK]: (
        <WebsiteForm
          ref={ref as any}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          contentOnly={contentOnly}
        />
      ),
      [EQRType.FEEDBACK]: (
        <WebsiteForm
          ref={ref as any}
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
