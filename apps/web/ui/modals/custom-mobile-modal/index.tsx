import { cn } from "@dub/utils";
import { AnimatePresence, motion } from "framer-motion";

import { FC, ReactNode, useEffect } from "react";

interface ICustomMobileModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  children: ReactNode;
  size?: "full" | "default";
  backdropClassName?: string;
  modalClassName?: string;
  bodyClassName?: string;
  closeButtonClassName?: string;
  hideCloseButton?: boolean;
}

export const CustomMobileModal: FC<Readonly<ICustomMobileModalProps>> = ({
  isOpen,
  onOpenChange,
  children,
  backdropClassName,
  modalClassName,
  bodyClassName,
  size = "full",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[999] flex touch-none flex-col",
            backdropClassName,
          )}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.2 } },
            exit: { opacity: 0, transition: { duration: 0.2 } },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className={cn(
              "[&_:is(input,textarea):focus]:animate-noop-repaint relative z-10 flex max-h-[100vh] flex-col bg-white",
              {
                "mt-auto !h-[100dvh] !max-h-[100dvh] !min-h-[100dvh] w-full":
                  size === "full",
              },
              modalClassName,
            )}
            variants={{
              hidden: { scale: 0.9, opacity: 0 },
              visible: {
                scale: 1,
                opacity: 1,
                transition: { type: "spring", stiffness: 100, damping: 20 },
              },
              exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={cn(
                "[&_:is(input,textarea):focus]:animate-noop-repaint w-full flex-1 touch-manipulation overflow-y-auto overscroll-contain",
                bodyClassName,
              )}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
