"use client";

import { Button, Modal, useKeyboardShortcut, useMediaQuery } from "@dub/ui";
import { Theme } from "@radix-ui/themes";
import { Options } from "qr-code-styling";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";

import useUser from "@/lib/swr/use-user.ts";
import { EQRType } from "@/ui/qr-builder/constants/get-qr-config";
import { DEFAULT_WEBSITE } from "@/ui/qr-builder/constants/qr-type-inputs-placeholders.ts";
import { QrBuilder } from "@/ui/qr-builder/qr-builder";
import { FullQrCreateData, useQrSave } from "@/ui/qr-code/hooks/use-qr-save";
import { ResponseQrCode } from "@/ui/qr-code/qr-codes-container.tsx";
import { X } from "@/ui/shared/icons";
import QRIcon from "@/ui/shared/icons/qr.tsx";
import { LoaderCircle } from "lucide-react";
import { trackClientEvents } from "../../../core/integration/analytic";
import { EAnalyticEvents } from "../../../core/integration/analytic/interfaces/analytic.interface.ts";

export type QRBuilderData = {
  title: string;
  styles: Options;
  frameOptions: {
    id: string;
    color?: string;
    textColor?: string;
    text?: string;
  };
  qrType: EQRType;
  files: File[];
};

type QRBuilderModalProps = {
  props?: ResponseQrCode;
  showQRBuilderModal: boolean;
  setShowQRBuilderModal: Dispatch<SetStateAction<boolean>>;
  initialStep?: number;
};

export function QRBuilderModal({
  props,
  showQRBuilderModal,
  setShowQRBuilderModal,
  initialStep,
}: QRBuilderModalProps) {
  const { createQr, updateQr } = useQrSave();
  const { isMobile } = useMediaQuery();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveQR = async (data: QRBuilderData) => {
    setIsProcessing(true);

    if (data.styles.data === DEFAULT_WEBSITE) {
      setIsProcessing(false);
      toast.error("Data of QR Code not found.");
      return;
    }

    if (props) {
      await updateQr(props.id, {
        data: data.styles.data,
        styles: data.styles,
        frameOptions: data.frameOptions,
        qrType: data.qrType,
        files: data.files,
      });
    } else {
      await createQr(data as FullQrCreateData);
    }

    setIsProcessing(false);
    setShowQRBuilderModal(false);
  };

  const modalContent = (
    <div className="flex h-full flex-col gap-2 overflow-y-auto bg-white md:h-fit">
      {isProcessing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
          <LoaderCircle className="text-secondary h-8 w-8 animate-spin" />
        </div>
      )}
      <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
        <div className="flex items-center gap-2">
          <QRIcon className="text-primary h-5 w-5" />
          <h3 className="!mt-0 max-w-xs truncate text-lg font-medium">
            {props ? `Edit QR - ${props.title ?? props.id}` : "New QR"}
          </h3>
        </div>
        <button
          onClick={() => setShowQRBuilderModal(false)}
          disabled={isProcessing}
          type="button"
          className="group relative -right-2 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none active:bg-neutral-200 md:right-0 md:block"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <Theme>
        <QrBuilder
          isEdit={!!props}
          isProcessing={isProcessing}
          props={props}
          handleSaveQR={handleSaveQR}
          initialStep={initialStep}
        />
      </Theme>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer.Root
        open={showQRBuilderModal}
        onOpenChange={setShowQRBuilderModal}
        shouldScaleBackground
        dismissible={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="bg-neutral/20 fixed inset-0 z-50" />
          <Drawer.Content className="mx-h-[82vh] fixed inset-0 bottom-0 left-0 right-0 z-50 mt-24 flex flex-col rounded-t-xl bg-white">
            <div className="mx-auto mb-2 mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-neutral-300" />
            {modalContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Modal
      showModal={showQRBuilderModal}
      setShowModal={setShowQRBuilderModal}
      desktopOnly
      className="border-border-500 max-w-screen-lg"
    >
      {modalContent}
    </Modal>
  );
}

function CreateQRButton({
  setShowQRBuilderModal,
}: {
  setShowQRBuilderModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { user } = useUser();

  useKeyboardShortcut("c", () => setShowQRBuilderModal(true));

  return (
    <Button
      text="Create QR code"
      onClick={() => {
        trackClientEvents({
          event: EAnalyticEvents.PAGE_CLICKED,
          params: {
            page_name: "profile",
            content_value: "create_qr",
            email: user?.email,
          },
          sessionId: user?.id,
        });
        setShowQRBuilderModal(true);
      }}
    />
  );
}

export function useQRBuilder(data?: {
  props?: ResponseQrCode;
  initialStep?: number;
}) {
  const { props, initialStep } = data ?? {};

  const [showQRBuilderModal, setShowQRBuilderModal] = useState(false);

  const QRBuilderModalCallback = useCallback(() => {
    return (
      <QRBuilderModal
        props={props}
        showQRBuilderModal={showQRBuilderModal}
        setShowQRBuilderModal={setShowQRBuilderModal}
        initialStep={initialStep}
      />
    );
  }, [props, showQRBuilderModal, setShowQRBuilderModal, initialStep]);

  const CreateQRButtonCallback = useCallback(() => {
    return <CreateQRButton setShowQRBuilderModal={setShowQRBuilderModal} />;
  }, [setShowQRBuilderModal]);

  return useMemo(
    () => ({
      CreateQRButton: CreateQRButtonCallback,
      QRBuilderModal: QRBuilderModalCallback,
      setShowQRBuilderModal,
    }),
    [CreateQRButtonCallback, QRBuilderModalCallback, setShowQRBuilderModal],
  );
}
