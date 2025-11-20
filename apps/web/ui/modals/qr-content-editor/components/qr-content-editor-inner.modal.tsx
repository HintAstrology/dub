import { Session } from "@/lib/auth";
import { QrFormResolver } from "@/ui/qr-builder-new/components/qr-form-resolver/qr-form-resolver";
import { useQrBuilderContext } from "@/ui/qr-builder-new/contexts";
import { useNewQrOperations } from "@/ui/qr-builder-new/hooks/use-qr-operations";
import { TQRFormData } from "@/ui/qr-builder-new/types/context";
import { QRFormRef } from "@/ui/qr-builder-new/types/qr-form-ref";
import { X } from "@/ui/shared/icons";
import QRIcon from "@/ui/shared/icons/qr.tsx";
import { Button } from "@dub/ui";
import { LoaderCircle } from "lucide-react";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { getModalTitle } from "../helpers/get-modal-title";
import { getSaveButtonText } from "../helpers/get-save-button-text";

interface IQrContentEditorInnerModalProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  user: Session["user"];
}

export const QrContentEditorInnerModal: FC<
  Readonly<IQrContentEditorInnerModalProps>
> = ({ setShowModal, user }) => {
  const {
    isFileUploading,
    isFileProcessing,
    selectedQrType,
    formData,
    initialQrData,
  } = useQrBuilderContext();

  const { updateQRDestination } = useNewQrOperations({
    initialQrData: initialQrData!,
    user,
  });

  const formRef = useRef<QRFormRef>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };

  const isProcessing = isFileUploading || isFileProcessing || isSaving;

  const modalTitleText = useMemo(
    () => getModalTitle(selectedQrType),
    [selectedQrType],
  );

  const savingButtonText = useMemo(
    () => getSaveButtonText(isFileUploading, isFileProcessing, isSaving),
    [isFileUploading, isFileProcessing, isSaving],
  );

  // Custom form submit handler
  const handleFormSubmit = useCallback(
    async (data: TQRFormData) => {
      setIsSaving(true);
      try {
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

  return (
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
            {modalTitleText}
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
          qrType={selectedQrType!}
          onSubmit={handleFormSubmit}
          defaultValues={formData || undefined}
          contentOnly
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
            text={savingButtonText}
          />
        </div>
      </div>
    </div>
  );
};
