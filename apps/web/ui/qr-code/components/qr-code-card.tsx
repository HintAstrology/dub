import { Session } from "@/lib/auth/utils";
import { CardList } from "@dub/ui";
import { FC } from "react";
import { TQrServerData } from "../../qr-builder-new/helpers/data-converters.ts";
import { QrCodeCardInner } from "./qr-code-card-inner.tsx";

interface IQrCodeCardProps {
  qrCode: TQrServerData;
  featuresAccess: boolean;
  user: Session["user"];
  setShowTrialExpiredModal: (show: boolean) => void;
}

export const QrCodeCard: FC<Readonly<IQrCodeCardProps>> = ({
  qrCode,
  featuresAccess,
  user,
  setShowTrialExpiredModal,
}) => {
  return (
    <>
      <CardList.Card
        key={qrCode.id}
        innerClassName="h-full flex items-center gap-5 sm:gap-8 text-sm"
      >
        <QrCodeCardInner
          user={user}
          qrCode={qrCode}
          featuresAccess={featuresAccess}
          setShowTrialExpiredModal={setShowTrialExpiredModal}
        />
      </CardList.Card>
    </>
  );
};
