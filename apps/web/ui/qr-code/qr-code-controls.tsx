import { Session } from "@/lib/auth/utils";
import { useCheckFolderPermission } from "@/lib/swr/use-folder-permissions";
import { useArchiveQRModal } from "@/ui/modals/archive-qr-modal.tsx";
import { useDeleteQRModal } from "@/ui/modals/delete-qr-modal.tsx";
import { QRBuilderModal } from "@/ui/modals/qr-builder-new";
import { useQRPreviewModal } from "@/ui/modals/qr-preview-modal.tsx";
import { QrStorageData } from "@/ui/qr-builder/types/types.ts";
import { QrCodesListContext } from "@/ui/qr-code/qr-codes-container.tsx";
import {
  Button,
  CardList,
  Popover,
  useKeyboardShortcut,
  useMediaQuery,
} from "@dub/ui";
import { BoxArchive, Download } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { Delete, Palette } from "lucide-react";
import { useSearchParams } from "next/navigation";
import QRCodeStyling from "qr-code-styling";
import { RefObject, useContext, useState } from "react";
import { ThreeDots } from "../shared/icons";

interface QrCodeControlsProps {
  qrCode: QrStorageData;
  canvasRef: RefObject<HTMLCanvasElement>;
  builtQrCodeObject: QRCodeStyling | null;
  featuresAccess?: boolean;
  setShowTrialExpiredModal?: (show: boolean) => void;
  user: Session["user"];
}

export function QrCodeControls({
  qrCode,
  canvasRef,
  builtQrCodeObject,
  featuresAccess,
  setShowTrialExpiredModal,
  user,
}: QrCodeControlsProps) {
  const { hovered } = useContext(CardList.Card.Context);
  const searchParams = useSearchParams();

  const { isMobile } = useMediaQuery();

  const { openMenuQrCodeId, setOpenMenuQrCodeId } =
    useContext(QrCodesListContext);
  const openPopover = openMenuQrCodeId === qrCode.id;
  const setOpenPopover = (open: boolean) => {
    setOpenMenuQrCodeId(open ? qrCode.id : null);
  };

  const { setShowArchiveQRModal, ArchiveQRModal } = useArchiveQRModal({
    props: qrCode,
  });
  const { setShowDeleteQRModal, DeleteLinkModal } = useDeleteQRModal({
    props: qrCode,
  });
  const { QRPreviewModal, setShowQRPreviewModal } = useQRPreviewModal({
    canvasRef,
    qrCode: builtQrCodeObject,
    width: isMobile ? 300 : 200,
    height: isMobile ? 300 : 200,
    qrCodeId: qrCode.id,
    user,
  });

  const [showQRCustomizeModal, setShowQRCustomizeModal] = useState(false);

  const folderId = qrCode.link.folderId || searchParams.get("folderId");

  const canManageLink = useCheckFolderPermission(
    folderId,
    "folders.links.write",
  );

  useKeyboardShortcut(
    ["e", "a", "x", "b"],
    (e) => {
      setOpenPopover(false);
      switch (e.key) {
        case "a":
          canManageLink && setShowArchiveQRModal(true);
          break;
        case "x":
          canManageLink && setShowDeleteQRModal(true);
          break;
      }
    },
    {
      enabled: openPopover || (hovered && openMenuQrCodeId === null),
    },
  );

  const onDownloadButtonClick = () => {
    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "dashboard",
        content_group: "my_qr_codes",
        content_value: "download_qr",
        qrId: qrCode.id,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });

    setShowQRPreviewModal(true);
  };

  const onPopoverClick = () => {
    setOpenPopover(!openPopover);

    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "dashboard",
        content_group: "my_qr_codes",
        content_value: "qr_actions",
        qrId: qrCode.id,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });

    if (openPopover) {
      trackClientEvents({
        event: EAnalyticEvents.ELEMENT_OPENED,
        params: {
          page_name: "dashboard",
          content_group: "my_qr_codes",
          element_name: "qr_actions",
          qrId: qrCode.id,
          event_category: "Authorized",
        },
        sessionId: user?.id,
      });
    }
  };

  const onActionClick = (contentValue: string) => {
    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_CLICKED,
      params: {
        page_name: "dashboard",
        content_group: "my_qr_codes",
        element_name: "qr_actions",
        content_value: contentValue,
        qrId: qrCode.id,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });
  };

  return (
    <div className="flex flex-col-reverse items-end justify-end gap-2 lg:flex-row lg:items-center">
      <QRPreviewModal />
      <QRBuilderModal
        qrData={qrCode as any}
        showModal={showQRCustomizeModal}
        setShowModal={setShowQRCustomizeModal}
      />
      <ArchiveQRModal />
      <DeleteLinkModal />
      {canvasRef && (
        // <DownloadPopover
        //   qrCode={qrCode}
        //   canvasRef={canvasRef}
        //   isTrialOver={isTrialOver}
        //   setShowTrialExpiredModal={setShowTrialExpiredModal}
        // >
        <Button
          onClick={onDownloadButtonClick}
          variant="secondary"
          className={cn(
            "h-8 w-8 px-1.5 outline-none transition-all duration-200",
            "border-transparent data-[state=open]:border-neutral-200/40 data-[state=open]:ring-neutral-200/40 sm:group-hover/card:data-[state=closed]:border-neutral-200/10",
            "border-border-500 border lg:border-none",
          )}
          icon={<Download className="h-5 w-5 shrink-0" />}
        />
        // </DownloadPopover>
      )}
      <Popover
        content={
          <div className="w-full sm:w-48">
            <div className="grid gap-1 p-2">
              {/* TODO: Implement Change QR Type functionality with new builder */}
              {/* <Button
                text="Change QR Type"
                variant="outline"
                onClick={() => {
                  onActionClick("change_qr_type");

                  setOpenPopover(false);
                  if (!featuresAccess) {
                    setShowTrialExpiredModal?.(true);
                    return;
                  }
                  // setShowQRTypeModal(true);
                }}
                icon={<RefreshCw className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
                disabledTooltip={
                  !canManageLink
                    ? "You don't have permission to update this link."
                    : undefined
                }
              /> */}
              <Button
                text="Customize QR"
                variant="outline"
                onClick={() => {
                  onActionClick("customize_qr");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowTrialExpiredModal?.(true);
                    return;
                  }

                  setShowQRCustomizeModal(true);
                }}
                icon={<Palette className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
                disabledTooltip={
                  !canManageLink
                    ? "You don't have permission to update this link."
                    : undefined
                }
              />
            </div>
            <div className="border-t border-neutral-200/10" />
            <div className="grid gap-1 p-2">
              <Button
                text={qrCode.archived ? "Unpause" : "Pause"}
                variant="outline"
                onClick={() => {
                  onActionClick("pause");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowTrialExpiredModal?.(true);
                    setOpenPopover(false);
                    return;
                  }

                  setShowArchiveQRModal(true);
                }}
                icon={<BoxArchive className="size-4" />}
                shortcut="A"
                className="h-9 w-full justify-start px-2 font-medium"
                disabledTooltip={
                  !canManageLink
                    ? "You don't have permission to archive this link."
                    : undefined
                }
              />

              <Button
                text="Delete"
                variant="danger-outline"
                onClick={() => {
                  onActionClick("delete");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowTrialExpiredModal?.(true);
                    return;
                  }

                  setShowDeleteQRModal(true);
                }}
                icon={<Delete className="size-4" />}
                shortcut="X"
                className="h-9 w-full justify-start px-2 font-medium"
              />
            </div>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <Button
          variant="secondary"
          className={cn(
            "h-8 w-8 px-1.5 outline-none transition-all duration-200",
            "border-transparent data-[state=open]:border-neutral-200/40 data-[state=open]:ring-neutral-200/40 sm:group-hover/card:data-[state=closed]:border-neutral-200/10",
            "border-border-500 border lg:border-none",
          )}
          icon={<ThreeDots className="h-5 w-5 shrink-0" />}
          onClick={onPopoverClick}
        />
      </Popover>
    </div>
  );
}
