import { useQrBuilderContext } from "@/ui/qr-builder-new/contexts";
import { useMediaQuery } from "@dub/ui";
import { Edit3Icon, LayoutGridIcon, PaletteIcon } from "lucide-react";
import Stepper from "./stepper";

interface QRBuilderStepsProps {
  disableStepNavigation?: boolean;
}

export const QRBuilderSteps = ({ disableStepNavigation = false }: QRBuilderStepsProps = {}) => {
  const { builderStep, handleChangeStep, isFileUploading, isFileProcessing, homepageDemo } =
    useQrBuilderContext();

  const { isMobile } = useMediaQuery();

  // Disable step navigation while files are uploading or processing, or if explicitly disabled
  const isDisabled = isFileUploading || isFileProcessing || disableStepNavigation;

  return (
    <Stepper
      currentStep={builderStep || 1}
      steps={[
        {
          number: 1,
          label: isMobile ? "Step 1" : "Choose type",
          icon: LayoutGridIcon,
        },
        {
          number: 2,
          label: isMobile ? "Step 2" : "Complete Content",
          icon: Edit3Icon,
        },
        {
          number: 3,
          label: isMobile ? "Step 3" : "Customize QR",
          icon: PaletteIcon,
        },
      ]}
      onStepClick={disableStepNavigation ? undefined : handleChangeStep}
      disabled={isDisabled}
    />
  );
};
