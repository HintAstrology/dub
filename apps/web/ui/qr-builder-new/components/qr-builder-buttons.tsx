import { Button } from "@/components/ui/button";
import { cn } from "@dub/utils";
import { Flex, Responsive } from "@radix-ui/themes";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { FC, useCallback } from "react";
import { DownloadButton } from "./download-button";

interface IQrBuilderButtonsProps {
  step: number;
  onBack: () => void;
  onContinue: () => Promise<void>;
  maxStep?: number;
  minStep?: number;
  className?: string;
  display?: Responsive<"none" | "inline-flex" | "flex"> | undefined;
  isEdit?: boolean;
  isProcessing?: boolean;
  isFileUploading?: boolean;
  isFileProcessing?: boolean;
  homepageDemo?: boolean;
  logoData?: { type: string; fileId?: string; file?: File };
  isFormValid?: boolean;
  qrCode?: QRCodeStyling | null;
  isMobile?: boolean;
  disableContinue?: boolean;
}

export const QrBuilderButtons: FC<IQrBuilderButtonsProps> = ({
  step,
  onBack,
  onContinue,
  maxStep = 3,
  minStep = 1,
  className,
  display = "flex",
  isEdit = false,
  isProcessing = false,
  isFileUploading = false,
  isFileProcessing = false,
  homepageDemo = false,
  logoData,
  qrCode = null,
  isMobile = false,
  disableContinue = false,
  isFormValid = false,
}) => {
  const isLastStep = step === maxStep;
  const isContentStep = step === 2;
  const isCustomizationStep = step === 3;

  // Check if logo upload is incomplete (on customization step)
  const hasUploadedLogoWithoutFileId =
    isCustomizationStep && logoData?.type === "uploaded" && !logoData?.fileId;

  const getButtonText = useCallback(() => {
    if (isFileUploading) return "Uploading...";
    if (isFileProcessing) return "Processing...";
    if (homepageDemo || isContentStep || isEdit) return "Customize QR";

    return "Create QR Code";
  }, [
    isFileUploading,
    isFileProcessing,
    isEdit,
    isLastStep,
    homepageDemo,
    isContentStep,
  ]);

  const buttonText = getButtonText();

  const isLoading = isProcessing || isFileUploading || isFileProcessing;

  // Show download button on customization step (step 3) on mobile
  const showDownloadOnCustomizationStep =
    isCustomizationStep && isMobile && qrCode;

  // For constructor page (not mobile, not homepageDemo), use new layout
  const useConstructorLayout = !isMobile && !homepageDemo;

  // Customize button text
  const customizeButtonText = useCallback(() => {
    if (isFileUploading) return "Uploading...";
    if (isFileProcessing) return "Processing...";
    return "Customize QR";
  }, [isFileUploading, isFileProcessing]);

  if (useConstructorLayout) {
    return (
      <Flex
        justify="between"
        display={display}
        className={cn("w-full gap-2", className)}
      >
        {/* Left side: Back and Customize buttons */}
        <Flex gap="2" className="flex-1">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "border-secondary text-secondary hover:bg-secondary/10 flex min-w-0 shrink gap-1 bg-white md:gap-2",
              {
                "border-neutral-400 text-neutral-400": isProcessing,
              },
            )}
            disabled={step <= minStep || isProcessing}
            onClick={onBack}
          >
            <ChevronLeft
              className={cn("h-4 w-4", {
                "text-neutral-400": isProcessing,
              })}
            />
            <span className="hidden md:inline">Back</span>
          </Button>

          {/* Show Customize button on content step */}
          {isContentStep && (
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className={cn(
                "border-secondary text-secondary hover:bg-secondary/10 bg-white",
                {
                  "border-neutral-400 text-neutral-400": isProcessing,
                },
              )}
              onClick={onContinue}
              disabled={
                disableContinue ||
                isProcessing ||
                isFileUploading ||
                isFileProcessing
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customizeButtonText()}
            </Button>
          )}
        </Flex>

        {/* Right side: Create/Download button */}
        <div className="flex-1 flex justify-end">
          {isCustomizationStep ? (
            <div className="w-full max-w-[200px]">
              <DownloadButton />
            </div>
          ) : (
            <Button
              type="submit"
              variant="default"
              size="lg"
              className={cn(
                "bg-secondary hover:bg-secondary/90 text-white w-full max-w-[200px]",
                {
                  "opacity-50 cursor-not-allowed": isProcessing,
                },
              )}
              onClick={onContinue}
              disabled={
                disableContinue ||
                isProcessing ||
                isFileUploading ||
                isFileProcessing ||
                hasUploadedLogoWithoutFileId ||
                isCustomizationStep
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create QR Code
            </Button>
          )}
        </div>
      </Flex>
    );
  }

  // Original layout for mobile and homepageDemo
  return (
    <Flex
      justify="between"
      display={display}
      className={cn("w-full gap-2", className)}
    >
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "border-secondary text-secondary hover:bg-secondary/10 flex min-w-0 shrink gap-1 bg-white md:gap-2",
          {
            "border-neutral-400 text-neutral-400": isProcessing,
            "w-full": isLastStep && !showDownloadOnCustomizationStep,
            "basis-1/4": showDownloadOnCustomizationStep || !isLastStep,
          },
        )}
        disabled={step <= minStep || isProcessing}
        onClick={onBack}
      >
        <ChevronLeft
          className={cn("h-4 w-4", {
            "text-neutral-400": isProcessing,
          })}
        />
        <span className="hidden md:inline">Back</span>
      </Button>

      {showDownloadOnCustomizationStep && (
        <div className="flex-[3]">
          <DownloadButton />
        </div>
      )}

      {!isLastStep ? (
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className={cn(
            "border-secondary text-secondary hover:bg-secondary/10 w-full shrink bg-white",
            {
              "border-neutral-400 text-neutral-400": isProcessing,
              "bg-secondary hover:bg-secondary/90 border-secondary text-white":
                isMobile && isContentStep,
            },
          )}
          onClick={onContinue}
          disabled={
            disableContinue ||
            isProcessing ||
            isFileUploading ||
            isFileProcessing ||
            hasUploadedLogoWithoutFileId ||
            isCustomizationStep
          }
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      ) : null}
    </Flex>
  );
};
