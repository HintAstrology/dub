import { QRBuilderWrapper } from "./components/qr-builder-wrapper.tsx";
import { QrBuilderProvider } from "./context/index.ts";
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
