import { Session } from "@/lib/auth";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type";
import { FC, useMemo } from "react";
import { QR_TYPES } from "../../qr-builder-new/constants/get-qr-config";
import { extractCustomizationData } from "../../qr-builder-new/helpers/data-converters";
import { useQRCodeStyling } from "../../qr-builder-new/hooks/use-qr-code-styling";
import { QrCodeDetailsColumn } from "./qr-code-details-column";
import { QrCodeTitleColumn } from "./qr-code-title-column";

interface IQrCodeCardInnerProps {
  qrCode: TQrServerData;
  user: Session["user"];
  featuresAccess: boolean;
  setShowSubscriptionExpiredModal?: (show: boolean) => void;
}

export const QrCodeCardInner: FC<Readonly<IQrCodeCardInnerProps>> = ({
  qrCode,
  user,
  featuresAccess,
  setShowSubscriptionExpiredModal,
}) => {
  const currentQrTypeInfo = useMemo(() => {
    return QR_TYPES.find((item) => item.id === qrCode.qrType)!;
  }, [qrCode]);

  const customizationData = useMemo(() => {
    return extractCustomizationData(
      qrCode.styles,
      qrCode.frameOptions,
      qrCode.logoOptions,
    );
  }, [qrCode]);

  const { qrCode: qrCodeStylingInstance, svgString } = useQRCodeStyling({
    customizationData,
    defaultData:
      qrCode.qrType === EQRType.WIFI ? qrCode.data : qrCode.link.shortLink,
  });

  return (
    <>
      <div className="h-full min-w-0 grow">
        <QrCodeTitleColumn
          user={user}
          qrCode={qrCode}
          qrCodeStylingInstance={qrCodeStylingInstance}
          svgString={svgString}
          currentQrTypeInfo={currentQrTypeInfo}
          featuresAccess={featuresAccess}
          setShowSubscriptionExpiredModal={setShowSubscriptionExpiredModal}
        />
      </div>
      <QrCodeDetailsColumn
        user={user}
        qrCode={qrCode}
        qrCodeStylingInstance={qrCodeStylingInstance}
        svgString={svgString}
        currentQrTypeInfo={currentQrTypeInfo}
        featuresAccess={featuresAccess}
        setShowSubscriptionExpiredModal={setShowSubscriptionExpiredModal}
      />
    </>
  );
};
