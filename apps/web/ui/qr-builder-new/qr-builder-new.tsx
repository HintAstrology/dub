import { QRBuilderWrapper } from "./components/qr-builder-wrapper.tsx";
import { EQRType } from "./constants/get-qr-config.ts";
import { QrBuilderProvider } from "./context/index.ts";
import { TNewQRBuilderData, TQrServerData } from "./helpers/data-converters.ts";
import { TStepState } from "./types/context.ts";

interface QRBuilderNewProps {
  homepageDemo?: boolean;
  sessionId?: string;
  onSave?: (data: TNewQRBuilderData) => Promise<void>;
  initialQrData?: TQrServerData | null;
  isEdit?: boolean;
  typeToScrollTo?: EQRType | null;
  handleResetTypeToScrollTo?: () => void;
  initialStep: TStepState;
}

export const QRBuilderNew = ({
  homepageDemo = false,
  initialStep,
  sessionId,
  onSave,
  initialQrData,
  typeToScrollTo,
  handleResetTypeToScrollTo,
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
    >
      <QRBuilderWrapper />
    </QrBuilderProvider>
  );
};
