import { Session } from "@/lib/auth";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { X } from "@/ui/shared/icons";
import { Button, Modal } from "@dub/ui";
import { Flex, Text, Theme } from "@radix-ui/themes";
import { CircleX } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useNewQrOperations } from "../qr-builder-new/hooks/use-qr-operations";

type DeleteQRModalProps = {
  showDeleteQRModal: boolean;
  setShowDeleteQRModal: Dispatch<SetStateAction<boolean>>;
  qrCode: TQrServerData;
  user: Session["user"];
};

function DeleteQRModal({
  showDeleteQRModal,
  setShowDeleteQRModal,
  qrCode,
  user,
}: DeleteQRModalProps) {
  const [deleting, setDeleting] = useState(false);

  const { deleteQR } = useNewQrOperations({ initialQrData: qrCode, user });

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    const success = await deleteQR();
    setDeleting(false);

    if (success) {
      setShowDeleteQRModal(false);
    }
  }, [qrCode, setShowDeleteQRModal]);

  const handleClose = () => {
    setShowDeleteQRModal(false);
  };

  return (
    <Modal
      showModal={showDeleteQRModal}
      setShowModal={setShowDeleteQRModal}
      className="border-border-500 md:max-w-md"
      drawerRootProps={{
        repositionInputs: false,
      }}
    >
      <Theme>
        <div className="flex flex-col gap-2">
          <div className="relative flex w-full items-center justify-center px-2 py-4">
            <h3 className="!mt-0 max-w-xs text-center text-lg font-semibold">
              Are you sure you want to delete
              <br />"{qrCode.title}"?
            </h3>
            <button
              disabled={deleting}
              type="button"
              onClick={handleClose}
              className="active:bg-border-500 group absolute right-6 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:block"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Flex direction="row" align="center" className="w-full gap-1.5">
                  <CircleX className="h-[18px] w-[18px] text-red-800" />
                  <Text as="span" size={{ initial: "1", lg: "2" }}>
                    This permanently removes the QR code.
                  </Text>
                </Flex>
                <Flex direction="row" align="center" className="w-full gap-1.5">
                  <CircleX className="h-[18px] w-[18px] text-red-800" />
                  <Text as="span" size={{ initial: "1", lg: "2" }}>
                    Future scans will not work.
                  </Text>
                </Flex>
                <Flex direction="row" align="center" className="w-full gap-1.5">
                  <CircleX className="h-[18px] w-[18px] text-red-800" />
                  <Text as="span" size={{ initial: "1", lg: "2" }}>
                    All analytics for this code will be deleted.
                  </Text>
                </Flex>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={deleting}
                  text="Cancel"
                />
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                  text="Confirm delete"
                />
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}

export function useDeleteQRModal({
  qrCode,
  user,
}: {
  qrCode: TQrServerData;
  user: Session["user"];
}) {
  const [showDeleteQRModal, setShowDeleteQRModal] = useState(false);

  const DeleteLinkModalCallback = useCallback(() => {
    return (
      <DeleteQRModal
        showDeleteQRModal={showDeleteQRModal}
        setShowDeleteQRModal={setShowDeleteQRModal}
        qrCode={qrCode}
        user={user}
      />
    );
  }, [showDeleteQRModal, setShowDeleteQRModal, user]);

  return useMemo(
    () => ({
      setShowDeleteQRModal,
      DeleteLinkModal: DeleteLinkModalCallback,
    }),
    [setShowDeleteQRModal, DeleteLinkModalCallback],
  );
}
