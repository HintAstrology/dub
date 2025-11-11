import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { X } from "@/ui/shared/icons";
import { Button, Modal } from "@dub/ui";
import { Flex, Text, Theme } from "@radix-ui/themes";
import { CircleAlert } from "lucide-react";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useState,
} from "react";

type ArchiveQRModalProps = {
  isOpen: boolean;
  onToggleModal: Dispatch<SetStateAction<boolean>>;
  props: TQrServerData;
};

function ResetScansModal({
  isOpen,
  onToggleModal,
  props,
}: ArchiveQRModalProps) {
  // const { resetScans } = useQrOperations();
  const [loading, setLoading] = useState(false);

  const handleArchiveRequest = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setLoading(true);
    // const success = await resetScans(props.id);
    setLoading(false);

    // if (success) {
    //   onToggleModal(false);
    // }
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
              Are you sure you want to reset
              <br />
              scans for "{props.title}"?
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
              <div className="flex flex-col gap-2">
                <Flex direction="row" align="center" className="w-full gap-2">
                  <CircleAlert
                    className="h-[18px] w-[18px] text-amber-600"
                    strokeWidth={2}
                  />
                  <Text as="span" size={{ initial: "1", lg: "2" }}>
                    All scan statistics for this QR code will be deleted.
                    <br />
                    This can't be undone.
                  </Text>
                </Flex>
              </div>

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
                  variant="warning"
                  onClick={handleArchiveRequest}
                  loading={loading}
                  text="Confirm reset"
                />
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}

export function useResetScansModal({ props }: { props: TQrServerData }) {
  const [isOpen, setIsOpen] = useState(false);

  const ResetScansModalCallback = useCallback(() => {
    return props ? (
      <ResetScansModal
        isOpen={isOpen}
        onToggleModal={setIsOpen}
        props={props}
      />
    ) : null;
  }, [isOpen, setIsOpen]);

  return {
    isOpen,
    handleToggleModal: setIsOpen,
    ResetScansModal: ResetScansModalCallback,
  };
}
