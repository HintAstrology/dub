"use client";

import { useAuthModal } from "@/ui/modals/auth-modal.tsx";
import { QrBuilder } from "@/ui/qr-builder/qr-builder.tsx";
import { QrTabsTitle } from "@/ui/qr-builder/qr-tabs-title.tsx";
import { QRBuilderData } from "@/ui/qr-builder/types/types.ts";
import { Rating } from "@/ui/qr-rating/rating.tsx";
import { useLocalStorage, useMediaQuery } from "@dub/ui";
import { FC, forwardRef, Ref, useEffect } from "react";
import { LogoScrollingBanner } from "./components/logo-scrolling-banner.tsx";

interface IQRTabsProps {
  sessionId: string;
}

export const QRTabs: FC<
  Readonly<IQRTabsProps> & { ref?: Ref<HTMLDivElement> }
> = forwardRef(({ sessionId }, ref) => {
  const { AuthModal, showModal } = useAuthModal({ sessionId });

  const [, setQrDataToCreate] = useLocalStorage<QRBuilderData | null>(
    `qr-data-to-create`,
    null,
  );

  const { isMobile } = useMediaQuery();

  useEffect(() => {
    if (!isMobile) return;

    const handleFocusOut = (e: Event) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        setTimeout(() => {
          if (
            !document.activeElement ||
            document.activeElement === document.body
          ) {
            window.scrollTo({ top: 60, behavior: "smooth" });
          }
        }, 150);
      }
    };

    document.body.addEventListener("focusout", handleFocusOut);

    return () => {
      document.body.removeEventListener("focusout", handleFocusOut);
    };
  }, [isMobile]);

  const handleSaveQR = async (data: QRBuilderData) => {
    setQrDataToCreate(data);
    showModal("signup");
  };

  return (
    <section className="bg-primary-100 w-full px-3 py-10 lg:py-14">
      <div
        className="mx-auto flex max-w-[992px] flex-col items-center justify-center gap-6 lg:gap-12"
        ref={ref}
      >
        <QrTabsTitle />

        <QrBuilder
          sessionId={sessionId}
          handleSaveQR={handleSaveQR}
          homepageDemo
        />

        <Rating />

        {!isMobile && <LogoScrollingBanner />}
      </div>

      <AuthModal />
    </section>
  );
});
