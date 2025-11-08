"use client";

import { QrBuilderProvider } from "@/ui/qr-builder-new/context";
import { Modal } from "@dub/ui";
import { Theme } from "@radix-ui/themes";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { TQrServerData } from "../../qr-builder-new/helpers/data-converters";
import { QrContentEditorInnerModal } from "./components/qr-content-editor-inner.modal";

export type QRContentEditorData = Record<string, string | File[] | undefined>;

type QRContentEditorModalProps = {
  qrCode: TQrServerData;
  showQRContentEditorModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

export function QRContentEditorModal({
  qrCode,
  showQRContentEditorModal,
  setShowModal,
}: QRContentEditorModalProps) {
  if (!qrCode.qrType) {
    return null;
  }

  return (
    <Modal
      showModal={showQRContentEditorModal}
      setShowModal={setShowModal}
      drawerRootProps={{
        dismissible: false,
      }}
      className="border-border-500 h-fit transition-[height] duration-[300ms]"
    >
      <Theme>
        <QrBuilderProvider initialQrData={qrCode}>
          <QrContentEditorInnerModal setShowModal={setShowModal} />
        </QrBuilderProvider>
      </Theme>
    </Modal>
  );
}

export const useQRContentEditor = ({ qrCode }: { qrCode: TQrServerData }) => {
  const [showQRContentEditorModal, setShowQRContentEditorModal] =
    useState(false);

  const QRContentEditorModalCallback = useCallback(() => {
    return (
      <QRContentEditorModal
        qrCode={qrCode}
        showQRContentEditorModal={showQRContentEditorModal}
        setShowModal={setShowQRContentEditorModal}
      />
    );
  }, [showQRContentEditorModal, setShowQRContentEditorModal]);

  return useMemo(
    () => ({
      QRContentEditorModal: QRContentEditorModalCallback,
      setShowQRContentEditorModal,
    }),
    [QRContentEditorModalCallback, setShowQRContentEditorModal],
  );
};
