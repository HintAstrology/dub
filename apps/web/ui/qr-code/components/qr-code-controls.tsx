import { Session } from "@/lib/auth/utils";
import useWorkspace from "@/lib/swr/use-workspace.ts";
import { useArchiveQRModal } from "@/ui/modals/archive-qr-modal.tsx";
import { useDeleteQRModal } from "@/ui/modals/delete-qr-modal.tsx";
import { useQRPreviewModal } from "@/ui/modals/qr-preview-modal.tsx";
import { TStepState } from "@/ui/qr-builder-new/types/context";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { QrCodesListContext } from "@/ui/qr-code/qr-codes-container.tsx";
import { Button, Popover } from "@dub/ui";
import { Download } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import {
  ArrowRightLeft,
  ChartNoAxesColumn,
  CirclePause,
  Copy,
  Palette,
  Play,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import QRCodeStyling from "qr-code-styling";
import { useContext, useState } from "react";
import { useDuplicateQRModal } from "../../modals/duplicate-qr-modal";
import { QRBuilderNewModal } from "../../modals/qr-builder-new";
import { ThreeDots } from "../../shared/icons";

interface QrCodeControlsProps {
  qrCode: TQrServerData;
  qrCodeStylingInstance: QRCodeStyling | null;
  svgString: string;
  featuresAccess?: boolean;
  setShowSubscriptionExpiredModal?: (show: boolean) => void;
  user: Session["user"];
}

export function QrCodeControls({
  qrCode,
  qrCodeStylingInstance,
  svgString,
  featuresAccess,
  setShowSubscriptionExpiredModal,
  user,
}: QrCodeControlsProps) {
  const [currentStep, setCurrentStep] = useState<TStepState>(null);
  const [showEditQRModal, setShowEditQRModal] = useState(false);

  const { domain, key } = qrCode.link;
  const { slug } = useWorkspace();

  const router = useRouter();

  const { openMenuQrCodeId, setOpenMenuQrCodeId } =
    useContext(QrCodesListContext);
  const openPopover = openMenuQrCodeId === qrCode.id;
  const setOpenPopover = (open: boolean) => {
    setOpenMenuQrCodeId(open ? qrCode.id : null);
  };

  const { handleToggleModal: setShowDuplicateQRModal, DuplicateQRModal } =
    useDuplicateQRModal({
      qrCode,
      user,
    });
  const { setShowArchiveQRModal, ArchiveQRModal } = useArchiveQRModal({
    qrCode,
    user,
  });
  const { setShowDeleteQRModal, DeleteLinkModal } = useDeleteQRModal({
    qrCode,
    user,
  });
  const { QRPreviewModal, setShowQRPreviewModal } = useQRPreviewModal({
    qrCodeStylingInstance,
    svgString,
    qrCodeId: qrCode.id,
    user,
  });

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

  const onCloseEditQRModal = () => {
    setShowEditQRModal(false);
    setCurrentStep(null);
  };

  return (
    <div className="flex flex-col-reverse items-end justify-end gap-2 lg:flex-row lg:items-center">
      <DuplicateQRModal />
      <QRPreviewModal />
      <ArchiveQRModal />
      <DeleteLinkModal />

      <QRBuilderNewModal
        showModal={showEditQRModal}
        onClose={onCloseEditQRModal}
        user={user}
        qrCode={qrCode}
        initialStep={currentStep}
      />

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
      <Popover
        content={
          <div className="w-full sm:w-48">
            <div className="grid gap-1 p-2">
              <Button
                text="View Statistics"
                variant="outline"
                onClick={() => {
                  router.push(
                    `/${slug}/analytics?domain=${domain}&key=${key}&interval=all`,
                  );
                }}
                icon={<ChartNoAxesColumn className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
              <Button
                text="Duplicate"
                variant="outline"
                onClick={() => {
                  onActionClick("duplicate");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowSubscriptionExpiredModal?.(true);
                    setOpenPopover(false);
                    return;
                  }

                  setShowDuplicateQRModal(true);
                }}
                icon={<Copy className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
              <Button
                text={qrCode.archived ? "Activate" : "Pause"}
                variant="outline"
                onClick={() => {
                  onActionClick("pause");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowSubscriptionExpiredModal?.(true);
                    setOpenPopover(false);
                    return;
                  }

                  setShowArchiveQRModal(true);
                }}
                icon={
                  qrCode.archived ? (
                    <Play className="size-4" />
                  ) : (
                    <CirclePause className="size-4" />
                  )
                }
                className="h-9 w-full justify-start px-2 font-medium"
              />
            </div>
            <div className="w-full px-6">
              <div className="border-border-500 w-full border-t" />
            </div>
            <div className="grid gap-1 p-2">
              <Button
                text="Change QR Type"
                variant="outline"
                onClick={() => {
                  onActionClick("change_qr_type");

                  setOpenPopover(false);
                  if (!featuresAccess) {
                    setShowSubscriptionExpiredModal?.(true);
                    return;
                  }

                  setShowEditQRModal(true);
                  setCurrentStep(1);
                }}
                icon={<ArrowRightLeft className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
              <Button
                text="Customize QR"
                variant="outline"
                onClick={() => {
                  onActionClick("customize_qr");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowSubscriptionExpiredModal?.(true);
                    return;
                  }

                  setShowEditQRModal(true);
                  setCurrentStep(3);
                }}
                icon={<Palette className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
              {/* <Button
                text="Reset scans"
                variant="outline"
                onClick={() => {
                  onActionClick("reset_scans");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowSubscriptionExpiredModal?.(true);
                    return;
                  }

                  setShowResetScansModal(true);
                }}
                icon={<RotateCcw className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              /> */}
            </div>
            <div className="w-full px-6">
              <div className="border-border-500 w-full border-t" />
            </div>
            <div className="grid gap-1 p-2">
              <Button
                text="Delete"
                variant="danger-outline"
                onClick={() => {
                  onActionClick("delete");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowSubscriptionExpiredModal?.(true);
                    return;
                  }

                  setShowDeleteQRModal(true);
                }}
                icon={<Trash2 className="size-4" />}
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
