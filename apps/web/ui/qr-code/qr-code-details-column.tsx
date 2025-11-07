import { Session } from "@/lib/auth/utils";
import { QRType } from "@/ui/qr-builder-new/constants/get-qr-config";
import { QrCardType } from "@/ui/qr-code/qr-code-card-type.tsx";
import { QrCodeControls } from "@/ui/qr-code/qr-code-controls.tsx";
import QRCodeStyling from "qr-code-styling";
import { TQrServerData } from "../qr-builder-new/helpers/data-converters";
import { QRStatusBadge } from "./qr-status-badge/qr-status-badge";

interface IQrCodeDetailsColumnProps {
  qrCode: TQrServerData;
  qrCodeStylingInstance: QRCodeStyling | null;
  svgString: string;
  currentQrTypeInfo: QRType;
  featuresAccess?: boolean;
  setShowTrialExpiredModal?: (show: boolean) => void;
  user: Session["user"];
}

export function QrCodeDetailsColumn({
  user,
  qrCode,
  qrCodeStylingInstance,
  svgString,
  currentQrTypeInfo,
  featuresAccess,
  setShowTrialExpiredModal,
}: IQrCodeDetailsColumnProps) {
  return (
    <div className="flex h-full flex-col items-start justify-start gap-6 lg:flex-row lg:items-center lg:justify-end">
      <div className="hidden gap-3 lg:flex lg:gap-6">
        <QrCardType currentQrTypeInfo={currentQrTypeInfo} />
        <QRStatusBadge qrCode={qrCode} featuresAccess={featuresAccess} />
      </div>

      <QrCodeControls
        user={user}
        qrCode={qrCode}
        qrCodeStylingInstance={qrCodeStylingInstance}
        svgString={svgString}
        featuresAccess={featuresAccess}
        setShowTrialExpiredModal={setShowTrialExpiredModal}
      />
    </div>
  );
}
