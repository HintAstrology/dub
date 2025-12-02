"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less";
import { FAQ_ITEMS_PAYWALL } from "@/ui/landing/components/faq-section/config.tsx";
import { FAQSection } from "@/ui/landing/components/faq-section/faq-section.tsx";
import { PaymentComponent } from "@/ui/plans/components/payment-component.tsx";
import { PlansFeatures } from "@/ui/plans/components/plans-features.tsx";
import { PlansHeading } from "@/ui/plans/components/plans-heading.tsx";
import { PopularQrInfo } from "@/ui/plans/components/popular-qr-info.tsx";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { ICustomerBody } from "core/integration/payment/config";
import { Sparkles } from "lucide-react";
import { FC, useRef } from "react";
import { CustomerSupport } from "../landing/components/footer/components/customer-support";

interface IPlansContentProps {
  user: ICustomerBody;
  featuresAccess: FeaturesAccess;
  mostScannedQR: TQrServerData | null;
  sessionId: string;
}

export const PlansContent: FC<Readonly<IPlansContentProps>> = ({
  user,
  featuresAccess,
  mostScannedQR = null,
  sessionId,
}) => {
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToPayment = () => {
    if (paymentSectionRef.current) {
      paymentSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <div className="mb-4 flex w-full flex-col items-center justify-center gap-4 lg:gap-8">
      <PlansHeading featuresAccess={featuresAccess} />

      <div className="flex w-full flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-stretch lg:gap-8 lg:px-8">
        <PopularQrInfo
          mostScannedQR={mostScannedQR}
          featuresAccess={featuresAccess}
          handleScroll={handleScrollToPayment}
        />

        <div ref={paymentSectionRef} className="flex flex-1">
          <PaymentComponent user={user} featuresAccess={featuresAccess} />
        </div>

        <div className="block pb-6 lg:hidden">
          <PlansFeatures />
        </div>
      </div>

      <div className="w-full max-w-7xl">
        <FAQSection faqItems={FAQ_ITEMS_PAYWALL} />
      </div>

      <div className="flex w-full max-w-7xl items-center justify-center px-4 pt-8 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl p-4 shadow transition-shadow">
          <div className="relative z-10 flex items-center justify-between gap-4 p-2">
            {/* Left side - Content */}
            <div className="max-w-[550px] space-y-3">
              <h3 className="text-foreground text-balance text-3xl font-bold tracking-tight lg:text-4xl">
                Still have questions?
              </h3>

              <p className="text-muted-foreground lg:text-lg">
                Get instant support from our team of experts. We're available
                around the clock to ensure you have the best experience
              </p>
            </div>

            <div className="w-[200px]">
              <CustomerSupport sessionId={sessionId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
