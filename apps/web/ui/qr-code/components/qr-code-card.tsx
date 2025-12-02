import { Session } from "@/lib/auth/utils";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { CardList } from "@dub/ui";
import { FC } from "react";
import { QrCodeCardInner } from "./qr-code-card-inner.tsx";

interface IQrCodeCardProps {
  qrCode: TQrServerData;
  featuresAccess: boolean;
  user: Session["user"];
  setShowSubscriptionExpiredModal: (show: boolean) => void;
}

export const QrCodeCard: FC<Readonly<IQrCodeCardProps>> = ({
  qrCode,
  featuresAccess,
  user,
  setShowSubscriptionExpiredModal,
}) => {
  return (
    <>
      <CardList.Card
        key={qrCode.id}
        outerClassName="rounded-[20px]"
        innerClassName="h-full flex items-center gap-5 sm:gap-8 text-sm "
      >
        <QrCodeCardInner
          user={user}
          qrCode={qrCode}
          featuresAccess={featuresAccess}
          setShowSubscriptionExpiredModal={setShowSubscriptionExpiredModal}
        />
      </CardList.Card>
    </>
  );
};
