import { Session } from "@/lib/auth/utils";
import useWorkspace from "@/lib/swr/use-workspace.ts";
import { useArchiveQRModal } from "@/ui/modals/archive-qr-modal.tsx";
import { useDeleteQRModal } from "@/ui/modals/delete-qr-modal.tsx";
import { useQRBuilder } from "@/ui/modals/qr-builder";
import { useQRPreviewModal } from "@/ui/modals/qr-preview-modal.tsx";
import { QrStorageData } from "@/ui/qr-builder/types/types.ts";
import { QrCodesListContext } from "@/ui/qr-code/qr-codes-container.tsx";
import {
  Button,
  Popover,
  useMediaQuery,
} from "@dub/ui";
import { Download } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { ArrowRightLeft, ChartNoAxesColumn, CirclePause, Copy, Palette, Play, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCodeStyling from "qr-code-styling";
import { RefObject, useContext } from "react";
import { ThreeDots } from "../shared/icons";
import { useResetScansModal } from '../modals/reset-scans-modal';

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
  const { domain, key } = qrCode.link;
  const { slug } = useWorkspace();

  const { isMobile } = useMediaQuery();
  const router = useRouter();

  const { openMenuQrCodeId, setOpenMenuQrCodeId } =
    useContext(QrCodesListContext);
  const openPopover = openMenuQrCodeId === qrCode.id;
  const setOpenPopover = (open: boolean) => {
    setOpenMenuQrCodeId(open ? qrCode.id : null);
  };

  const { handleToggleModal: setShowResetScansModal, ResetScansModal } = useResetScansModal({
    props: qrCode,
  });
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

  const {
    setShowQRBuilderModal: setShowQRTypeModal,
    QRBuilderModal: QRChangeTypeModal,
  } = useQRBuilder({
    props: qrCode,
    initialStep: 1,
  });

  const {
    setShowQRBuilderModal: setShowQRCustomizeModal,
    QRBuilderModal: QRCustomizeModal,
  } = useQRBuilder({
    props: qrCode,
    initialStep: 3, // design customization
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

  return (
    <div className="flex flex-col-reverse items-end justify-end gap-2 lg:flex-row lg:items-center">
      <ResetScansModal />
      <QRPreviewModal />
      <QRChangeTypeModal />
      <QRCustomizeModal />
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
              <Button
                text="View Statistics"
                variant="outline"
                onClick={() => {
                  router.push(`/${slug}/analytics?domain=${domain}&key=${key}&interval=all`)
                }}
                icon={<ChartNoAxesColumn className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
              {/* <Button
                text="Duplicate"
                variant="outline"
                onClick={() => {
                  // TODO GETQR-260
                }}
                icon={<Copy className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              /> */}
              <Button
                text={qrCode.archived ? "Activate" : "Pause"}
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
                icon={qrCode.archived ? <Play className="size-4" /> : <CirclePause className="size-4" />}
                shortcut="A"
                className="h-9 w-full justify-start px-2 font-medium"
              />
            </div>
            <div className="w-full px-6" >
              <div className="border-t border-neutral-200 w-full" />
            </div>
            <div className="grid gap-1 p-2">
              <Button
                text="Change QR Type"
                variant="outline"
                onClick={() => {
                  onActionClick("change_qr_type");

                  setOpenPopover(false);
                  if (!featuresAccess) {
                    setShowTrialExpiredModal?.(true);
                    return;
                  }
                  setShowQRTypeModal(true);
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
                    setShowTrialExpiredModal?.(true);
                    return;
                  }

                  setShowQRCustomizeModal(true);
                }}
                icon={<Palette className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
              <Button
                text="Reset scans"
                variant="outline"
                onClick={() => {
                  onActionClick("reset_scans");

                  setOpenPopover(false);

                  if (!featuresAccess) {
                    setShowTrialExpiredModal?.(true);
                    return;
                  }

                  setShowResetScansModal(true);
                }}
                icon={<RotateCcw className="size-4" />}
                className="h-9 w-full justify-start px-2 font-medium"
              />
            </div>
            <div className="w-full px-6" >
              <div className="border-t border-neutral-200 w-full" />
            </div>
            <div className="grid gap-1 p-2">
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

// function DownloadPopover({
//   qrCode,
//   canvasRef,
//   isTrialOver = false,
//   setShowTrialExpiredModal,
//   children,
// }: PropsWithChildren<{
//   qrCode: QrStorageData;
//   canvasRef: RefObject<HTMLCanvasElement>;
//   isTrialOver?: boolean;
//   setShowTrialExpiredModal?: (show: boolean) => void;
// }>) {
//   const [openPopover, setOpenPopover] = useState(false);
//   const { qrCode: qrCodeObject } = useQrCustomization(qrCode);
//   const { downloadQrCode } = useQrDownload(qrCodeObject, canvasRef);
//
//   return (
//     <Popover
//       content={
//         <div className="grid w-full justify-start gap-1 p-2 sm:min-w-48">
//           <button
//             className="flex w-full items-center justify-start gap-2 rounded-md p-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
//             onClick={() => {
//               downloadQrCode("svg");
//               setOpenPopover(false);
//             }}
//           >
//             <Photo className="h-4 w-4" />
//             <span>Download SVG</span>
//           </button>
//           <button
//             className="flex w-full items-center justify-start gap-2 rounded-md p-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
//             onClick={() => {
//               downloadQrCode("png");
//               setOpenPopover(false);
//             }}
//           >
//             <Photo className="h-4 w-4" />
//             <span>Download PNG</span>
//           </button>
//           <button
//             className="flex w-full items-center justify-start gap-2 rounded-md p-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
//             onClick={() => {
//               downloadQrCode("jpg");
//               setOpenPopover(false);
//             }}
//           >
//             <Photo className="h-4 w-4" />
//             <span>Download JPG</span>
//           </button>
//         </div>
//       }
//       openPopover={openPopover}
//       setOpenPopover={() => {
//         if (isTrialOver) {
//           setShowTrialExpiredModal?.(true);
//           return;
//         }
//
//         setOpenPopover(!openPopover);
//       }}
//     >
//       {children}
//     </Popover>
//   );
// }
