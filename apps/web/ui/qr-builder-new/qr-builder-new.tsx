import { QRBuilderWrapper } from "./components/qr-builder-wrapper.tsx";
import { FramePreloadProvider } from "./providers/frame-preload-provider.tsx";
import { QrBuilderProvider } from "./providers/qr-builder-provider.tsx";
import { TStepState } from "./types/context.ts";
import { TNewQRBuilderData } from "./types/qr-builder-data.ts";
import { TQrServerData } from "./types/qr-server-data.ts";
import { EQRType } from "./types/qr-type.ts";

interface QRBuilderNewProps {
  homepageDemo?: boolean;
  sessionId?: string;
  onSave?: (data: TNewQRBuilderData) => Promise<void>;
  initialQrData?: TQrServerData | null;
  isEdit?: boolean;
  typeToScrollTo?: EQRType | null;
  handleResetTypeToScrollTo?: () => void;
  initialStep?: TStepState;
  modalHeader?: React.ReactNode;
  onStepChange?: (step: TStepState) => void;
  onCancel?: () => void;
}

export const QRBuilderNew = ({
  homepageDemo = false,
  initialStep,
  sessionId,
  onSave,
  initialQrData,
  typeToScrollTo,
  handleResetTypeToScrollTo,
  modalHeader,
  onStepChange,
  onCancel,
}: QRBuilderNewProps) => {
  return (
    <QrBuilderProvider
      homepageDemo={homepageDemo}
      sessionId={sessionId}
      onSave={onSave}
      initialQrData={initialQrData}
      typeToScrollTo={typeToScrollTo}
      handleResetTypeToScrollTo={handleResetTypeToScrollTo}
      initialStep={initialStep}
      onStepChange={onStepChange}
      onCancel={onCancel}
    >
      <FramePreloadProvider>
        <QRBuilderWrapper modalHeader={modalHeader} />
      </FramePreloadProvider>
    </QrBuilderProvider>
  );
};
