import { QRBuilderInner } from "@/ui/qr-builder-new/components/qr-builder-inner.tsx";
import { useQrBuilderContext } from "@/ui/qr-builder-new/contexts";
import { useMediaQuery } from "@dub/ui";
import { cn } from "@dub/utils/src";
import { motion } from "framer-motion";
import { useQRCodeStyling } from "../hooks/use-qr-code-styling";
import { QrBuilderButtons } from "./qr-builder-buttons";

interface QRBuilderWrapperProps {
  modalHeader?: React.ReactNode;
}

export const QRBuilderWrapper = ({ modalHeader }: QRBuilderWrapperProps) => {
  const {
    builderStep,
    isTypeStep,
    isContentStep,
    isCustomizationStep,
    qrBuilderContentWrapperRef,
    handleBack,
    handleContinue,
    isEditMode,
    isProcessing,
    isFileUploading,
    isFileProcessing,
    homepageDemo,
    currentFormValues,
    customizationData,
    isFormValid,
    isGoingBack,
  } = useQrBuilderContext();

  const { isMobile } = useMediaQuery();

  // Show decorative border and blobs only on steps 2 and 3
  const showDecorations = isContentStep || isCustomizationStep;

  // QR code instance for mobile download button on step 2
  const { qrCode } = useQRCodeStyling({
    customizationData,
    defaultData: "https://getqr.com/qr-complete-setup",
  });

  if (!homepageDemo && !isMobile && !modalHeader) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Fixed stepper at top */}
        <div className="flex-shrink-0 border-b border-border-500 rounded-t-[20px] px-6 py-4 w-full">
          <QRBuilderInner showOnlyStepper disableStepNavigation={isTypeStep} />
        </div>

        <div className={cn(
          "flex-1 overflow-y-auto min-h-0",
          isTypeStep && "flex items-center justify-center"
        )}>
          <motion.div
            ref={qrBuilderContentWrapperRef}
            key={`builder-step-${builderStep}`}
            initial={
              isGoingBack
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 0, scale: 1 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              isGoingBack
                ? { duration: 0 }
                : {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 },
                  }
            }
            className={cn(
              "mx-auto flex w-full flex-col p-4",
              isTypeStep && "pb-10 justify-center",
              !isTypeStep && " rounded-[20px] bg-white ",
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  "flex w-full flex-col items-stretch justify-between gap-4 p-6 md:gap-6",
                  isTypeStep && "p-0",
                )}
              >
                <QRBuilderInner hideStepper={true} disableStepNavigation={isTypeStep} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fixed buttons at bottom */}
        <div className="flex-shrink-0 border-t border-border-500 rounded-b-[20px] px-6 py-4 w-full">
          <QrBuilderButtons
            step={builderStep || 1}
            onBack={handleBack}
            onContinue={isTypeStep ? async () => {} : handleContinue}
            isEdit={isEditMode}
            isProcessing={isProcessing}
            isFileUploading={isFileUploading}
            isFileProcessing={isFileProcessing}
            homepageDemo={homepageDemo}
            logoData={customizationData.logo}
            isFormValid={isFormValid}
            qrCode={qrCode}
            isMobile={isMobile}
            disableContinue={isTypeStep}
          />
        </div>
      </div>
    );
  }

  // For modal mode (homepageDemo = false) and desktop only, use fixed layout
  // Mobile always uses the original layout below
  if (!homepageDemo && !isMobile && modalHeader) {
    return (
      <div className={cn(
        "flex flex-col",
        isCustomizationStep && "h-full max-h-[calc(90vh-140px)]"
      )}>
        {/* Fixed header - always visible */}
        {modalHeader}

        {/* Fixed stepper for steps 2 and 3 */}
        {!isTypeStep && (
          <div className="flex-shrink-0 bg-white px-6 py-4 mx-auto w-[90%]">
            <QRBuilderInner showOnlyStepper />
          </div>
        )}

        {/* Content area */}
        <div className={cn(
          "overflow-y-auto relative",
          isCustomizationStep && "flex-1 min-h-0"
        )}>
          <motion.div
            ref={qrBuilderContentWrapperRef}
            key={`builder-step-${builderStep}`}
            initial={
              isGoingBack
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 0, scale: 1 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              isGoingBack
                ? { duration: 0 }
                : {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 },
                  }
            }
            className={cn(
              "mx-auto flex w-full flex-col p-4",
              (!homepageDemo && isTypeStep )&& "pb-10",
              !isTypeStep && " rounded-[20px] bg-white ",
              !homepageDemo || isMobile ? "shadow-none" : "shadow",
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  "flex w-full flex-col items-stretch justify-between gap-4 p-6 md:gap-6",
                  isTypeStep && "p-0",
                )}
              >
                <QRBuilderInner hideStepper={!isTypeStep} />
              </div>
            </div>
          </motion.div>

          {/* Fixed buttons at bottom left for modal case only */}
          {!isTypeStep && (
            <div className="sticky bottom-0 left-0 z-50 w-fit p-4 bg-transparent pointer-events-none">
              <div className="pointer-events-auto">
                <QrBuilderButtons
                  step={builderStep || 1}
                  onBack={handleBack}
                  onContinue={handleContinue}
                  isEdit={isEditMode}
                  isProcessing={isProcessing}
                  isFileUploading={isFileUploading}
                  isFileProcessing={isFileProcessing}
                  homepageDemo={homepageDemo}
                  logoData={customizationData.logo}
                  isFormValid={isFormValid}
                  qrCode={qrCode}
                  isMobile={isMobile}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original layout for homepage demo
  return (
    <motion.div
      ref={qrBuilderContentWrapperRef}
      key={`builder-step-${builderStep}`}
      initial={
        isGoingBack
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 0, scale: 1 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        isGoingBack
          ? { duration: 0 }
          : {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 },
            }
      }
      className={cn(
        "mx-auto flex w-full flex-col",
        isTypeStep && homepageDemo ? "justify-center" : "justify-between",
        !isTypeStep && " rounded-[20px] bg-white ",
        !homepageDemo || isMobile ? "shadow-none" : "",
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "flex w-full flex-col items-stretch justify-between gap-4 p-6 md:gap-6",
            isTypeStep && "p-0",
          )}
        >
          <QRBuilderInner />
        </div>
      </div>

      {showDecorations && isMobile && !homepageDemo && (
        <div className="border-border-500 relative sticky bottom-0 z-10 mt-auto w-full border-t bg-white px-6 py-3">
          <QrBuilderButtons
            step={builderStep || 1}
            onBack={handleBack}
            onContinue={handleContinue}
            isEdit={isEditMode}
            isProcessing={isProcessing}
            isFileUploading={isFileUploading}
            isFileProcessing={isFileProcessing}
            homepageDemo={homepageDemo}
            logoData={customizationData.logo}
            isFormValid={isFormValid}
            qrCode={qrCode}
            isMobile={isMobile}
          />
        </div>
      )}
    </motion.div>
  );
};
