import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useQrBuilderContext } from "../contexts";
import { getSession } from 'next-auth/react';
import { Session } from '@/lib/auth';
import { useNewQrOperations } from '../hooks/use-qr-operations';
import { TNewQRBuilderData } from '../types/qr-builder-data';
import { TQRFormData } from '../types/context';
import { EQRType } from '../types/qr-type';
import { useRouter } from 'next/navigation';

export const DownloadButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const {
    homepageDemo,
    isEditMode,
    isFileUploading,
    isFileProcessing,
    isProcessing,
    customizationData,
    onSave,
    isContentStep,
    contentStepRef,
    setFormData,
    formData,
    selectedQrType,
  } = useQrBuilderContext();
  const { createQr } = useNewQrOperations();
  const router = useRouter();
  // Check if logo upload is incomplete
  const hasUploadedLogoWithoutFileId =
    customizationData.logo?.type === "uploaded" &&
    !customizationData.logo?.fileId;

  const handleSave = useCallback(async () => {
    const checkSessionAndCreateQr = async (formValues?: TQRFormData) => {
      const existingSession = await getSession();
      const user = existingSession?.user as Session['user'] || undefined;
      console.log("existingSession", existingSession);

      if (existingSession?.user) {
        setIsCreating(true);
        const data = formValues || formData as any;
        const builderData: TNewQRBuilderData = {
          qrType: selectedQrType as EQRType,
          formData: data,
          customizationData,
          title: data?.qrName || `${selectedQrType} QR Code`,
          fileId: data?.fileId,
        };
        const { createdQr } = await createQr(builderData, user?.defaultWorkspace, user);
        console.log("createdQrId", createdQr);
        router.push(`/?qrId=${createdQr.id}`);
        return true;
      }
      setIsCreating(false);
    };
    // If on content step, validate and get form data without changing step
    if (isContentStep && contentStepRef.current) {
      const isValid = await contentStepRef.current.form.trigger();
      if (!isValid) {
        toast.error("Please fill in all required fields correctly");
        return;
      }

      const formValues = contentStepRef.current.getValues();
      setFormData(formValues as any);
      
      if (await checkSessionAndCreateQr(formValues)) {
        return;
      }
      await onSave(formValues as any);
      return;
    }

    if (await checkSessionAndCreateQr()) {
      return;
    }
    // Directly save/create the QR code without navigating steps
    await onSave();
  }, [isContentStep, contentStepRef, setFormData, onSave, formData, selectedQrType, customizationData]);

  const getButtonText = useCallback(() => {
    if (isFileUploading) return "Uploading...";
    if (isFileProcessing) return "Processing...";
    if (isEditMode) return "Save changes";
    if (isCreating) return "Creating QR Code...";
    if (homepageDemo) return "Download QR Code";
    return "Create QR Code";
  }, [isFileUploading, isFileProcessing, isEditMode, homepageDemo, isCreating]);

  const buttonText = getButtonText();
  const isDisabled =
    isProcessing ||
    isFileUploading ||
    isFileProcessing ||
    hasUploadedLogoWithoutFileId ||
    isCreating;

  const isLoading = isProcessing || isFileUploading || isFileProcessing || isCreating;

  return (
    <Button
      type="submit"
      size="lg"
      variant="default"
      className="bg-secondary hover:bg-secondary/90 w-full"
      onClick={handleSave}
      disabled={isDisabled}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  );
};
