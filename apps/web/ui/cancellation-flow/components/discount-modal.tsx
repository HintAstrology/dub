import { X } from "@/ui/shared/icons";
import { Button, Modal } from "@dub/ui";
import { Flex, Text, Theme } from "@radix-ui/themes";
import { CircleAlert, CircleCheck } from "lucide-react";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useState,
} from "react";

type Props = {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

export const DiscountModal: FC<Props> = ({ showModal, setShowModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClose = () => {
    setShowModal(false);
  };

  const handleActivateDiscount = useCallback(async () => {
    setIsLoading(true);
    setIsLoading(false);
  }, []);

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      className="border-border-500 md:max-w-md"
      drawerRootProps={{
        repositionInputs: false,
      }}
    >
      <Theme>
        <div className="flex flex-col gap-2">
          <div className="relative flex w-full items-center justify-center px-2 py-4">
            <h3 className="!mt-0 max-w-xs text-center text-lg font-semibold">
              Wait — before you go!
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="active:bg-border-500 group absolute right-6 rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none md:block"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6">
              <div>
                <p>We'd love to make things better for you.</p>
                <p>50% OFF FOREVER</p>
                <p>$ 19.99 per month</p>
                <p>No interruptions. No reactivation hassle. Just savings.</p>
              </div>
              

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleActivateDiscount}
                  loading={isLoading}
                  text="Activate My 50% Forever Discount"
                />
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}
