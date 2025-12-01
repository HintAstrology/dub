"use client";

import { Session } from "@/lib/auth/utils.ts";
import { QRTabs } from "@/ui/landing/components/qr-tabs/qr-tabs.tsx";
import { LandingSectionsServer } from "@/ui/landing/landing-sections-server.tsx";
import { FC, useCallback, useState } from "react";
import { trackClientEvents } from "../../core/integration/analytic";
import { EAnalyticEvents } from "../../core/integration/analytic/interfaces/analytic.interface.ts";
import { EQRType } from "../qr-builder-new/types/qr-type.ts";
import { scrollToBuilder } from "./helpers/scrollToBuilder.tsx";
import { TPaymentPlan } from 'core/integration/payment/config/payment-config.interface.ts';

interface ILandingSectionsClientProps {
  user: Session["user"] | null;
  sessionId: string;
}

export const LandingSectionsClient: FC<
  Readonly<ILandingSectionsClientProps>
> = ({ user, sessionId }) => {
  const [typeToScrollTo, setTypeToScrollTo] = useState<EQRType | null>(null);
  const [featureToOpen, setFeatureToOpen] = useState<string | null>(null);

  const handleScrollButtonClick = (
    type: "1" | "2" | "3",
    scrollTo?: EQRType,
    selectedPlan?: TPaymentPlan,
  ) => {
    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "landing",
        content_value: "create_qr",
        content_group: selectedPlan ? selectedPlan : (scrollTo || null),
        element_no: type,
        event_category: "nonAuthorized",
      },
      sessionId,
    });

    setTypeToScrollTo(scrollTo || null);

    // If scrolling to a specific QR type, wait longer to allow the builder to open the type first
    // Otherwise, scroll immediately
    const delay = scrollTo ? 500 : 0;
    setTimeout(scrollToBuilder, delay);
  };

  const handleFeatureClick = useCallback((feature: string) => {
    setFeatureToOpen(feature);
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleResetTypeToScrollTo = useCallback(() => {
    setTypeToScrollTo(null);
  }, []);

  return (
    <>
      {/* 1. New Builder */}
      <section
        id="qr-generation-block"
        className="bg-primary-100 flex min-h-[93svh] w-full items-center justify-center px-3 pt-2 pb-6 md:min-h-0 lg:py-14"
      >
        <QRTabs
          user={user}
          sessionId={sessionId}
          typeToScrollTo={typeToScrollTo}
          handleResetTypeToScrollTo={handleResetTypeToScrollTo}
        />
      </section>

      {/* 2-8. Other sections */}
      <LandingSectionsServer
        sessionId={sessionId}
        handleScrollButtonClick={handleScrollButtonClick}
        handleFeatureClick={handleFeatureClick}
        featureToOpen={featureToOpen}
      />
    </>
  );
};
