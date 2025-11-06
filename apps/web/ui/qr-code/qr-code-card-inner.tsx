import { Session } from "@/lib/auth";
import { FC } from "react";
import { QR_TYPES } from "../qr-builder-new/constants/get-qr-config";
import { useQrBuilderContext } from "../qr-builder-new/context";
import { TQrServerData } from "../qr-builder-new/helpers/data-converters";
import { useQRCodeStyling } from "../qr-builder-new/hooks/use-qr-code-styling";
import { QrCodeDetailsColumn } from "./qr-code-details-column";
import { QrCodeTitleColumn } from "./qr-code-title-column";

interface IQrCodeCardInnerProps {
  qrCode: TQrServerData;
  user: Session["user"];
  featuresAccess: boolean;
  setShowTrialExpiredModal?: (show: boolean) => void;
}

export const QrCodeCardInner: FC<Readonly<IQrCodeCardInnerProps>> = ({
  qrCode,
  user,
  featuresAccess,
  setShowTrialExpiredModal,
}) => {
  const { customizationData, shortLink, selectedQrType } =
    useQrBuilderContext();

  const currentQrTypeInfo = QR_TYPES.find(
    (item) => item.id === selectedQrType,
  )!;

  const { qrCode: qrCodeStylingInstance, svgString } = useQRCodeStyling({
    customizationData,
    defaultData: shortLink,
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
          setShowTrialExpiredModal={setShowTrialExpiredModal}
        />
      </div>
      <QrCodeDetailsColumn
        user={user}
        qrCode={qrCode}
        qrCodeStylingInstance={qrCodeStylingInstance}
        svgString={svgString}
        currentQrTypeInfo={currentQrTypeInfo}
        featuresAccess={featuresAccess}
        setShowTrialExpiredModal={setShowTrialExpiredModal}
      />
    </>
  );
};
