"use client";

import { useKeyboardShortcut, useMediaQuery } from "@dub/ui";
import { Theme } from "@radix-ui/themes";
import { FC, useCallback, useEffect } from "react";
import { Drawer } from "vaul";

import { Session } from "@/lib/auth";
import { QRBuilderWrapper } from "@/ui/qr-builder-new/components/qr-builder-wrapper";
import { useQrBuilderContext } from "@/ui/qr-builder-new/context";
import { X } from "@/ui/shared/icons";
import QRIcon from "@/ui/shared/icons/qr.tsx";
import { Modal } from "@dub/ui";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface.ts";
import { LoaderCircle } from "lucide-react";

interface QRBuilderModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  user: Session["user"];
}

export const QRBuilderUpdateModal: FC<Readonly<QRBuilderModalProps>> = ({
  showModal,
  setShowModal,
  user,
}) => {
  const { isMobile } = useMediaQuery();
  const { isProcessing, initialQrData } = useQrBuilderContext();

  const title = initialQrData?.title ?? initialQrData?.id;

  useEffect(() => {
    if (showModal) {
      trackClientEvents({
        event: EAnalyticEvents.ELEMENT_OPENED,
        params: {
          page_name: "dashboard",
          element_name: "qr_builder_modal",
          content_value: "edit",
          email: user?.email,
          event_category: "Authorized",
        },
        sessionId: user?.id,
      });
    }
  }, [showModal, user]);

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      setShowModal(false);
    }
  }, [isProcessing, setShowModal]);

  useKeyboardShortcut("Escape", handleClose);

  if (!showModal) {
    return null;
  }

  const modalContent = (
    <div className="flex h-full flex-col gap-2 bg-white md:h-fit md:overflow-y-auto">
      {isProcessing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
          <LoaderCircle className="text-secondary h-8 w-8 animate-spin" />
        </div>
      )}
      <div className="flex w-full flex-shrink-0 items-center justify-between gap-2 px-6 py-4">
        <div className="flex items-center gap-2">
          <QRIcon className="text-primary h-5 w-5" />
          <h3 className="!mt-0 max-w-xs truncate text-lg font-medium">
            {`Edit QR - ${title}`}
          </h3>
        </div>
        <button
          onClick={() => setShowModal(false)}
          disabled={isProcessing}
          type="button"
          className="active:bg-border-500 group relative -right-2 z-10 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:right-0 md:block"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <Theme>
        <QRBuilderWrapper />
      </Theme>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer.Root
        open={showModal}
        onOpenChange={setShowModal}
        dismissible={false}
        repositionInputs={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex !h-[100dvh] !max-h-[100dvh] flex-col rounded-t-[10px] bg-white">
            <div className="flex h-full flex-col overflow-y-auto">
              {modalContent}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      onClose={handleClose}
      desktopOnly
      className="border-border-500 w-full max-w-6xl overflow-hidden"
    >
      {modalContent}
    </Modal>
  );
};
