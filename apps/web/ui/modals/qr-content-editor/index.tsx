"use client";

import { useQrBuilderContext } from "@/ui/qr-builder-new/context";
import { QrFormResolver } from "@/ui/qr-builder-new/forms/qr-form-resolver.tsx";
import { QRFormRef } from "@/ui/qr-builder-new/forms/types";
import { useNewQrOperations } from "@/ui/qr-builder-new/hooks/use-qr-operations";
import { TQRFormData, TQrType } from "@/ui/qr-builder-new/types/context";
import { EQRType } from "@/ui/qr-builder/constants/get-qr-config.ts";
import { X } from "@/ui/shared/icons";
import QRIcon from "@/ui/shared/icons/qr.tsx";
import { Button, Modal } from "@dub/ui";
import { Theme } from "@radix-ui/themes";
import { LoaderCircle } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

const getModalTitle = (qrType: TQrType): string => {
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

export type QRContentEditorData = Record<string, string | File[] | undefined>;

type QRContentEditorModalProps = {
  showQRContentEditorModal: boolean;
  setShowQRContentEditorModal: Dispatch<SetStateAction<boolean>>;
};

export function QRContentEditorModal({
  showQRContentEditorModal,
  setShowQRContentEditorModal,
}: QRContentEditorModalProps) {
  const {
    isFileUploading,
    isFileProcessing,
    selectedQrType,
    formData,
    initialQrData,
  } = useQrBuilderContext();

  const { updateQRDestination } = useNewQrOperations();

  const formRef = useRef<QRFormRef>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom form submit handler
  const handleFormSubmit = useCallback(
    async (data: TQRFormData) => {
      setIsSaving(true);
      try {
        console.log("Form submitted with data:", data);
        console.log("QR Code:", initialQrData);

        await updateQRDestination(
          data as TQRFormData & { encodedData: string; fileId?: string },
        );

        handleClose();
      } catch (error) {
        console.error("Error saving QR content:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [selectedQrType, initialQrData],
  );

  const getSaveButtonText = () => {
    if (isFileUploading) {
      return "Uploading...";
    }

    if (isFileProcessing) {
      return "Processing...";
    }

    if (isSaving) {
      return "Saving...";
    }

    return "Save Changes";
  };

  const isProcessing = isFileUploading || isFileProcessing || isSaving;

  const handleClose = () => {
    setShowQRContentEditorModal(false);
  };

  const handleSaveClick = useCallback(async () => {
    if (formRef.current) {
      try {
        // validate() will call onSubmit (handleFormSubmit) if valid
        await formRef.current.validate();
      } catch (error) {
        console.error("Error validating form:", error);
      }
    }
  }, []);

  if (!selectedQrType) {
    return null;
  }

  return (
    <Modal
      showModal={showQRContentEditorModal}
      setShowModal={setShowQRContentEditorModal}
      drawerRootProps={{
        dismissible: false,
      }}
      className="border-border-500 h-fit transition-[height] duration-[300ms]"
    >
      <Theme>
        <div className="flex flex-col gap-2">
          {isProcessing && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
              <LoaderCircle className="text-secondary h-8 w-8 animate-spin" />
            </div>
          )}
          {/* Header */}
          <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
            <div className="flex items-center gap-2">
              <QRIcon className="text-primary h-5 w-5" />
              <h3 className="!mt-0 max-w-xs truncate text-lg font-medium">
                {getModalTitle(selectedQrType)}
              </h3>
            </div>
            <button
              disabled={isProcessing}
              type="button"
              onClick={handleClose}
              className="active:bg-border-500 group relative -right-2 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:right-0 md:block"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <QrFormResolver
              ref={formRef}
              qrType={selectedQrType}
              onSubmit={handleFormSubmit}
              defaultValues={formData || undefined}
              contentOnly
              isEdit={!!initialQrData}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                text="Cancel"
              />
              <Button
                type="button"
                onClick={handleSaveClick}
                loading={isProcessing}
                text={getSaveButtonText()}
              />
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}

export function useQRContentEditor() {
  const [showQRContentEditorModal, setShowQRContentEditorModal] =
    useState(false);

  const QRContentEditorModalCallback = useCallback(() => {
    return (
      <QRContentEditorModal
        showQRContentEditorModal={showQRContentEditorModal}
        setShowQRContentEditorModal={setShowQRContentEditorModal}
      />
    );
  }, [showQRContentEditorModal, setShowQRContentEditorModal]);

  return useMemo(
    () => ({
      QRContentEditorModal: QRContentEditorModalCallback,
      setShowQRContentEditorModal,
    }),
    [QRContentEditorModalCallback, setShowQRContentEditorModal],
  );
}
