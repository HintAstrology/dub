import { Session } from "@/lib/auth/utils";
import { useTrialExpiredModal } from "@/lib/hooks/use-trial-expired-modal.tsx";
import { QR_TYPES } from "@/ui/qr-builder-new/constants/get-qr-config";
import { TQrStorageData } from "@/ui/qr-builder-new/types/database";
import { CardList } from "@dub/ui";
import { convertServerQRToNewBuilder } from "../qr-builder-new/helpers/data-converters.ts";
import { useQRCodeStyling } from "../qr-builder-new/hooks/use-qr-code-styling.ts";
import { QrCodeTitleColumn } from "./qr-code-title-column.tsx";

export function QrCodeCard({
  qrCode,
  featuresAccess,
  user,
}: {
  qrCode: TQrStorageData;
  featuresAccess: boolean;
  user: Session["user"];
}) {
  const { setShowTrialExpiredModal, TrialExpiredModalCallback } =
    useTrialExpiredModal();

  const currentQrTypeInfo = QR_TYPES.find((item) => item.id === qrCode.qrType)!;

  const clientQrCode = convertServerQRToNewBuilder(qrCode);

  const { qrCode: qrCodeInstance, svgString } = useQRCodeStyling({
    customizationData: clientQrCode.customizationData,
    defaultData: qrCode.link?.shortLink,
  });

  return (
    <>
      <TrialExpiredModalCallback />
      <CardList.Card
        key={qrCode.id}
        innerClassName="h-full flex items-center gap-5 sm:gap-8 text-sm"
      >
        <div className="h-full min-w-0 grow">
          <QrCodeTitleColumn
            user={user}
            qrCode={qrCode}
            qrCodeStylingInstance={qrCodeInstance}
            svgString={svgString}
            currentQrTypeInfo={currentQrTypeInfo}
            featuresAccess={featuresAccess}
            setShowTrialExpiredModal={setShowTrialExpiredModal}
          />
        </div>
        {/* <QrCodeDetailsColumn
          user={user}
          qrCode={qrCode}
          canvasRef={canvasRef}
          builtQrCodeObject={builtQrCodeObject}
          currentQrTypeInfo={currentQrTypeInfo}
          featuresAccess={featuresAccess}
          setShowTrialExpiredModal={setShowTrialExpiredModal}
        /> */}
      </CardList.Card>
    </>
  );
}
