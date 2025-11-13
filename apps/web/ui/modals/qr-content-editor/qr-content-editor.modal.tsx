"use client";

import { Session } from "@/lib/auth";
import { QrBuilderProvider } from "@/ui/qr-builder-new/context";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { Modal } from "@dub/ui";
import { Theme } from "@radix-ui/themes";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { QrContentEditorInnerModal } from "./components/qr-content-editor-inner.modal";

export type QRContentEditorData = Record<string, string | File[] | undefined>;

type QRContentEditorModalProps = {
  qrCode: TQrServerData;
  showQRContentEditorModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  user: Session["user"];
};

export function QRContentEditorModal({
  qrCode,
  showQRContentEditorModal,
  setShowModal,
  user,
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
          <QrContentEditorInnerModal user={user} setShowModal={setShowModal} />
        </QrBuilderProvider>
      </Theme>
    </Modal>
  );
}

export const useQRContentEditor = ({
  qrCode,
  user,
}: {
  qrCode: TQrServerData;
  user: Session["user"];
}) => {
  const [showQRContentEditorModal, setShowQRContentEditorModal] =
    useState(false);

  const QRContentEditorModalCallback = useCallback(() => {
    return (
      <QRContentEditorModal
        qrCode={qrCode}
        showQRContentEditorModal={showQRContentEditorModal}
        setShowModal={setShowQRContentEditorModal}
        user={user}
      />
    );
  }, [showQRContentEditorModal, setShowQRContentEditorModal, user]);

  return useMemo(
    () => ({
      QRContentEditorModal: QRContentEditorModalCallback,
      setShowQRContentEditorModal,
    }),
    [QRContentEditorModalCallback, setShowQRContentEditorModal],
  );
};
