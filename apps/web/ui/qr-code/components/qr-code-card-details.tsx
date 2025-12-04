import { Session } from "@/lib/auth";
import { useQRContentEditor } from "@/ui/modals/qr-content-editor";
import { LINKED_QR_TYPES, QR_TYPES } from "@/ui/qr-builder-new/constants/get-qr-config";
import { getDisplayContent } from "@/ui/qr-builder-new/helpers/qr-data-handlers";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type";
import { Tooltip } from "@dub/ui";
import { cn, getPrettyUrl } from "@dub/utils/src";
import { Icon } from "@iconify/react";
import { memo, useMemo } from "react";

export const QRCardDetails = memo(
  ({
    qrCode,
    featuresAccess,
    setShowSubscriptionExpiredModal,
    user,
  }: {
    qrCode: TQrServerData;
    featuresAccess?: boolean;
    setShowSubscriptionExpiredModal?: (show: boolean) => void;
    user: Session["user"];
  }) => {
    const displayContent = getDisplayContent(qrCode);
    const qrType = qrCode.qrType as EQRType;

    const qrTypeLabel = useMemo(() => {
      const typeInfo = QR_TYPES.find((item) => item.id === qrType);
      return typeInfo?.label || "QR";
    }, [qrType]);

    const { setShowQRContentEditorModal, QRContentEditorModal } =
      useQRContentEditor({ qrCode, user });

    const onEditClick = (e: React.MouseEvent<SVGSVGElement>) => {
      e.stopPropagation();
      if (!featuresAccess) {
        setShowSubscriptionExpiredModal?.(true);
        return;
      }
      setShowQRContentEditorModal(true);
    };

    const isLinkType = LINKED_QR_TYPES.includes(qrType);

    return (
      <>
        <QRContentEditorModal />

        <div
          className={cn(
            "flex min-w-0 items-center whitespace-nowrap text-sm transition-[opacity,display] delay-[0s,150ms] duration-[150ms,0s]",
            "gap-1.5 opacity-100 md:gap-3",
          )}
        >
          <div className="flex min-w-0 items-center gap-1">
            {isLinkType && qrCode.link?.url ? (
              <a
                href={qrCode.link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={qrCode.link.url}
                className="min-w-0 truncate font-medium text-neutral-500 transition-colors hover:text-neutral-700 hover:underline hover:underline-offset-2"
              >
                {getPrettyUrl(displayContent)}
              </a>
            ) : (
              <span
                className="min-w-0 truncate font-medium text-neutral-500"
                title={displayContent}
              >
                {displayContent}
              </span>
            )}

            <Tooltip content={`Edit ${qrTypeLabel}`} delayDuration={150}>
              <div className="shrink-0 p-1">
                <Icon
                  icon="uil:edit"
                  className="text-secondary cursor-pointer"
                  onClick={onEditClick}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </>
    );
  },
);
