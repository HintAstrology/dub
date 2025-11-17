import { Session } from "@/lib/auth";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { X } from "@/ui/shared/icons";
import { Button, Modal } from "@dub/ui";
import { Flex, Text, Theme } from "@radix-ui/themes";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { useNewQrOperations } from "../qr-builder-new/hooks/use-qr-operations";

type Props = {
  isOpen: boolean;
  onToggleModal: Dispatch<SetStateAction<boolean>>;
  qrCode: TQrServerData;
  user: Session["user"];
};

function DuplicateQRModal({ isOpen, onToggleModal, qrCode, user }: Props) {
  const { duplicateQR } = useNewQrOperations({ initialQrData: qrCode, user });
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setLoading(true);
    const success = await duplicateQR();
    setLoading(false);

    if (success) {
      onToggleModal(false);
    }
  };

  const handleClose = () => {
    onToggleModal(false);
  };

  return (
    <Modal
      showModal={isOpen}
      setShowModal={onToggleModal}
      className="border-border-500 md:max-w-md"
      drawerRootProps={{
        repositionInputs: false,
      }}
    >
      <Theme>
        <div className="flex flex-col gap-2">
          <div className="relative flex w-full items-center justify-center px-2 py-4">
            <h3 className="!mt-0 max-w-xs text-center text-lg font-semibold">
              Are you sure you want to duplicate
              <br />"{qrCode.title}"?
            </h3>
            <button
              disabled={loading}
              type="button"
              onClick={handleClose}
              className="active:bg-border-500 group absolute right-6 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:block"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6">
              <Flex direction="row" align="center" className="w-full gap-2">
                <Text as="span" size={{ initial: "1", lg: "2" }}>
                  A duplicate QR will be created with the same type, design and
                  customization.
                </Text>
              </Flex>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  text="Cancel"
                />
                <Button
                  type="button"
                  onClick={handleConfirm}
                  loading={loading}
                  text="Confirm duplicate"
                />
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}

export function useDuplicateQRModal({
  qrCode,
  user,
}: {
  qrCode: TQrServerData;
  user: Session["user"];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const DuplicateQRModalCallback = useCallback(() => {
    return (
      <DuplicateQRModal
        isOpen={isOpen}
        onToggleModal={setIsOpen}
        qrCode={qrCode}
        user={user}
      />
    );
  }, [isOpen, setIsOpen, user]);

  return {
    isOpen,
    handleToggleModal: setIsOpen,
    DuplicateQRModal: DuplicateQRModalCallback,
  };
}
