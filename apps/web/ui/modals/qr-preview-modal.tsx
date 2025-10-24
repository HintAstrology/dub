"use client";

import { Session } from "@/lib/auth";
import { QRCanvas } from "@/ui/qr-builder/qr-canvas";
import {
  TDownloadFormat,
  useQrDownload,
} from "@/ui/qr-code/use-qr-download.ts";
import { X } from "@/ui/shared/icons";
import QRIcon from "@/ui/shared/icons/qr";
import { Button, Modal, useRouterStuff } from "@dub/ui";
import { cn } from "@dub/utils";
import { Icon } from "@iconify/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Theme } from "@radix-ui/themes";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import QRCodeStyling from "qr-code-styling";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

const FORMAT_OPTIONS = [
  { id: "svg", label: "SVG" },
  { id: "png", label: "PNG" },
  { id: "jpg", label: "JPEG" },
];

interface IQRPreviewModalProps {
  showQRPreviewModal: boolean;
  setShowQRPreviewModal: Dispatch<SetStateAction<boolean>>;
  setIsNewQr: Dispatch<SetStateAction<boolean>>;
  isNewQr?: boolean;
  canvasRef: RefObject<HTMLCanvasElement>;
  qrCode: QRCodeStyling | null;
  qrCodeId?: string;
  width?: number;
  height?: number;
  user: Session["user"];
  onCanvasReady?: () => void;
}

function QRPreviewModal({
  showQRPreviewModal,
  setShowQRPreviewModal,
  setIsNewQr,
  isNewQr,
  canvasRef,
  qrCode,
  qrCodeId,
  width = 200,
  height = 200,
  user,
  onCanvasReady,
}: IQRPreviewModalProps) {
  const { queryParams } = useRouterStuff();
  const searchParams = useSearchParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<TDownloadFormat>("svg");

  const { downloadQrCode } = useQrDownload(qrCode);

  const isWelcomeModal = searchParams.has("onboarded") || isNewQr;
  const [canShare, setCanShare] = useState(false);

  const handleClose = () => {
    if (!isDownloading) {
      setShowQRPreviewModal(false);
      setIsNewQr(false);
      if (isWelcomeModal) {
        queryParams({
          del: ["onboarded"],
        });
      }
    }
  };

  const handleDownload = async () => {
    if (!qrCode || !canvasRef.current) {
      toast.error("QR code not found");
      return;
    }

    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_CLICKED,
      params: {
        page_name: "dashboard",
        element_name: "qr_preview",
        content_group: "my_qr_codes",
        content_value: "download_qr",
        email: user?.email,
        qrId: qrCodeId,
        img_format: selectedFormat,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });

    setIsDownloading(true);
    try {
      await downloadQrCode(selectedFormat);
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast.error("Failed to download QR code");
    } finally {
      setIsDownloading(false);
    }
  };

  const onShareClick = async () => {
    if (!qrCode) {
      return;
    }

    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_CLICKED,
      params: {
        page_name: "dashboard",
        element_name: "qr_preview",
        content_group: "my_qr_codes",
        content_value: "share",
        email: user?.email,
        qrId: qrCodeId,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });

    try {
      setIsDownloading(true);
      const blob = await qrCode.getRawData(
        selectedFormat === "jpg" ? "jpeg" : selectedFormat,
      );

      if (!blob) {
        toast.error("Failed to generate QR data");
        return;
      }

      const file = new File([blob], `qr-code.${selectedFormat}`, {
        type:
          selectedFormat === "svg"
            ? "image/svg+xml"
            : selectedFormat === "png"
              ? "image/png"
              : "image/jpeg",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("Failed to share QR code:", error);
      toast.error("Failed to share QR code");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (showQRPreviewModal) {
      trackClientEvents({
        event: EAnalyticEvents.ELEMENT_OPENED,
        params: {
          page_name: "dashboard",
          element_name: "qr_preview",
          content_group: "my_qr_codes",
          email: user?.email,
          qrId: qrCodeId,
          event_category: "Authorized",
        },
        sessionId: user?.id,
      });
    }
  }, [showQRPreviewModal]);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" &&
        !!navigator.share &&
        !!navigator.canShare
    );
  }, []);

  return (
    <Modal
      showModal={showQRPreviewModal}
      setShowModal={setShowQRPreviewModal}
      onClose={() =>
        queryParams({
          del: ["onboarded"],
        })
      }
      className="border-border-500 h-fit"
    >
      <Theme>
        <div className="flex flex-col gap-2">
          {isWelcomeModal && (
            <button
              disabled={isDownloading}
              type="button"
              onClick={handleClose}
              className="active:bg-border-500 absolute right-6 top-4 rounded-full p-1.5 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:absolute md:right-1 md:block"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {!isWelcomeModal && (
            <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
              <div className="flex items-center gap-2">
                <QRIcon className="text-primary h-5 w-5" />
                <h3 className="!mt-0 max-w-xs truncate text-lg font-medium">
                  QR Code Preview
                </h3>
              </div>
              <button
                disabled={isDownloading}
                type="button"
                onClick={handleClose}
                className="active:bg-border-500 group relative -right-2 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:right-0 md:block"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {isWelcomeModal && (
            <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
              <div className="flex flex-col items-center justify-start gap-1">
                <h3 className="text-neutral !mt-0 max-w-xs truncate text-lg font-medium">
                  Your QR Code Is Ready!
                </h3>
                <h2 className={"text-center text-base text-neutral-800"}>
                  Download and share to track every scan from your dashboard.
                </h2>
              </div>
            </div>
          )}

          <div className="px-6 pb-6">
            <div className="flex flex-col items-center gap-6">
              <div className="flex justify-center">
                <QRCanvas
                  ref={canvasRef}
                  qrCode={qrCode}
                  qrCodeId={qrCodeId}
                  width={width}
                  height={height}
                  onCanvasReady={onCanvasReady}
                />
              </div>

              <div className="flex w-full flex-col items-center gap-2">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="w-full">
                    <div
                      className={cn(
                        "border-border-300 flex h-10 w-full cursor-pointer items-center justify-between gap-3.5 rounded-md border bg-white px-3 text-sm text-neutral-200 transition-colors",
                        "focus-within:border-secondary",
                      )}
                    >
                      <span>
                        {
                          FORMAT_OPTIONS.find((f) => f.id === selectedFormat)
                            ?.label
                        }
                      </span>
                      <Icon
                        icon="line-md:chevron-down"
                        className="text-xl text-neutral-200 transition-transform duration-300"
                      />
                    </div>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    className="border-border-100 !z-10 flex w-[94px] flex-col items-center justify-start gap-2 rounded-lg border bg-white p-3 shadow-md"
                    sideOffset={5}
                    align="start"
                  >
                    {FORMAT_OPTIONS.map((option) => (
                      <DropdownMenu.Item
                        key={option.id}
                        className={cn(
                          "hover:bg-secondary-100 flex h-9 w-full cursor-pointer items-center justify-between rounded-md bg-white p-3",
                          {
                            "bg-secondary-100": selectedFormat === option.id,
                          },
                        )}
                        onClick={() =>
                          setSelectedFormat(option.id as TDownloadFormat)
                        }
                      >
                        <span
                          className={cn("text-neutral text-sm", {
                            "text-secondary": selectedFormat === option.id,
                          })}
                        >
                          {option.label}
                        </span>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
                <div className="flex w-full gap-2">
                  <Button
                    text="Download QR"
                    variant="primary"
                    onClick={handleDownload}
                    className="flex-1"
                  />
                  {canShare && (
                    <Button
                      icon={<Share2 className="size-6" />}
                      variant="primary"
                      disabled={isDownloading}
                      className="flex w-fit items-center justify-center gap-2"
                      onClick={onShareClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}

export function useQRPreviewModal(data: {
  canvasRef: RefObject<HTMLCanvasElement>;
  qrCode: QRCodeStyling | null;
  qrCodeId?: string;
  width?: number;
  height?: number;
  user: Session["user"];
  onCanvasReady?: () => void;
}) {
  const {
    canvasRef,
    qrCode,
    qrCodeId,
    width = 200,
    height = 200,
    user,
    onCanvasReady,
  } = data;
  const [showQRPreviewModal, setShowQRPreviewModal] = useState(false);
  const [isNewQr, setIsNewQr] = useState(false);

  const handleOpenNewQr = useCallback(() => {
    setShowQRPreviewModal(true);
    setIsNewQr(true);
  }, []);

  const QRPreviewModalCallback = useCallback(() => {
    return (
      <QRPreviewModal
        canvasRef={canvasRef}
        qrCode={qrCode}
        qrCodeId={qrCodeId}
        width={width}
        height={height}
        showQRPreviewModal={showQRPreviewModal}
        setShowQRPreviewModal={setShowQRPreviewModal}
        setIsNewQr={setIsNewQr}
        isNewQr={isNewQr}
        user={user}
        onCanvasReady={onCanvasReady}
      />
    );
  }, [width, height, showQRPreviewModal, qrCodeId]);

  return {
    QRPreviewModal: QRPreviewModalCallback,
    setShowQRPreviewModal,
    handleOpenNewQr,
  };
}
