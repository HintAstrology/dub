import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { X } from "@/ui/shared/icons";
import { Button, Modal } from "@dub/ui";
import { Flex, Text, Theme } from "@radix-ui/themes";
import { CircleAlert, CircleCheck } from "lucide-react";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useNewQrOperations } from "../qr-builder-new/hooks/use-qr-operations";

type ArchiveQRModalProps = {
  showArchiveQRModal: boolean;
  setShowArchiveQRModal: Dispatch<SetStateAction<boolean>>;
  qrCode: TQrServerData;
};

function ArchiveQRModal({
  showArchiveQRModal,
  setShowArchiveQRModal,
  qrCode,
}: ArchiveQRModalProps) {
  const { archiveQR } = useNewQrOperations({ initialQrData: qrCode });
  const [archiving, setArchiving] = useState(false);

  const handleArchiveRequest = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setArchiving(true);
    const success = await archiveQR();
    setArchiving(false);

    if (success) {
      setShowArchiveQRModal(false);
    }
  };

  const handleClose = () => {
    setShowArchiveQRModal(false);
  };

  return (
    <Modal
      showModal={showArchiveQRModal}
      setShowModal={setShowArchiveQRModal}
      className="border-border-500 md:max-w-md"
      drawerRootProps={{
        repositionInputs: false,
      }}
    >
      <Theme>
        <div className="flex flex-col gap-2">
          <div className="relative flex w-full items-center justify-center px-2 py-4">
            <h3 className="!mt-0 max-w-xs text-center text-lg font-semibold">
              {qrCode.archived
                ? "Are you sure you want to activate"
                : "Are you sure you want to pause"}
              <br />"{qrCode.title}"?
            </h3>
            <button
              disabled={archiving}
              type="button"
              onClick={handleClose}
              className="active:bg-border-500 group absolute right-6 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:block"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6">
              {!qrCode.archived ? (
                <div className="flex flex-col gap-2">
                  <Flex
                    direction="row"
                    align="center"
                    className="w-full gap-1.5"
                  >
                    <CircleAlert
                      className="h-[18px] w-[18px] text-amber-600"
                      strokeWidth={2}
                    />
                    <Text as="span" size={{ initial: "1", lg: "2" }}>
                      New scans won’t open the destination.
                    </Text>
                  </Flex>
                  <Flex
                    direction="row"
                    align="center"
                    className="w-full gap-1.5"
                  >
                    <CircleAlert
                      className="h-[18px] w-[18px] text-amber-600"
                      strokeWidth={2}
                    />
                    <Text as="span" size={{ initial: "1", lg: "2" }}>
                      Analytics won’t be recorded while paused.
                    </Text>
                  </Flex>
                  <Flex
                    direction="row"
                    align="center"
                    className="w-full gap-1.5"
                  >
                    <CircleAlert
                      className="h-[18px] w-[18px] text-amber-600"
                      strokeWidth={2}
                    />
                    <Text as="span" size={{ initial: "1", lg: "2" }}>
                      You can resume at any time.
                    </Text>
                  </Flex>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Flex
                    direction="row"
                    align="center"
                    className="w-full gap-1.5"
                  >
                    <CircleCheck
                      className="h-[18px] w-[18px] text-green-600"
                      strokeWidth={2}
                    />
                    <Text as="span" size={{ initial: "1", lg: "2" }}>
                      New scans will open the destination again.
                    </Text>
                  </Flex>
                  <Flex
                    direction="row"
                    align="center"
                    className="w-full gap-1.5"
                  >
                    <CircleCheck
                      className="h-[18px] w-[18px] text-green-600"
                      strokeWidth={2}
                    />
                    <Text as="span" size={{ initial: "1", lg: "2" }}>
                      Analytics will start recording from now on.
                    </Text>
                  </Flex>
                  <Flex
                    direction="row"
                    align="center"
                    className="w-full gap-1.5"
                  >
                    <CircleCheck
                      className="h-[18px] w-[18px] text-green-600"
                      strokeWidth={2}
                    />
                    <Text as="span" size={{ initial: "1", lg: "2" }}>
                      You can pause this code at any time.
                    </Text>
                  </Flex>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={archiving}
                  text="Cancel"
                />
                <Button
                  type="button"
                  variant={qrCode.archived ? "primary" : "warning"}
                  onClick={handleArchiveRequest}
                  loading={archiving}
                  text={
                    qrCode.archived ? "Confirm activation" : "Confirm pause"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}

export function useArchiveQRModal({ qrCode }: { qrCode: TQrServerData }) {
  const [showArchiveQRModal, setShowArchiveQRModal] = useState(false);

  const ArchiveQRModalCallback = useCallback(() => {
    return (
      <ArchiveQRModal
        showArchiveQRModal={showArchiveQRModal}
        setShowArchiveQRModal={setShowArchiveQRModal}
        qrCode={qrCode}
      />
    );
  }, [showArchiveQRModal, setShowArchiveQRModal]);

  return useMemo(
    () => ({
      setShowArchiveQRModal,
      ArchiveQRModal: ArchiveQRModalCallback,
    }),
    [setShowArchiveQRModal, ArchiveQRModalCallback],
  );
}
