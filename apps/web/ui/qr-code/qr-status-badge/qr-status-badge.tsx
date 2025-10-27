import { TQrStorageData } from "@/ui/qr-builder-new/types/database";
import { QRCardAnalyticsBadge } from "./qr-code-card-analytics-badge";
import { QRCardStatus } from "./qr-code-card-status";

interface IQRStatusBadge {
  qrCode: TQrStorageData;
  featuresAccess?: boolean;
  className?: string;
}

export function QRStatusBadge({
  qrCode,
  featuresAccess,
  className,
}: IQRStatusBadge) {
  return qrCode.archived || !featuresAccess ? (
    <QRCardStatus
      className={className}
      color={qrCode.archived ? "yellow" : "red"}
    >
      {qrCode.archived ? "Paused" : "Deactivated"}
    </QRCardStatus>
  ) : (
    <QRCardAnalyticsBadge className={className} qrCode={qrCode} />
  );
}
