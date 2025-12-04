"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less.ts";
import { PricingPlanCard } from "@/ui/plans/components/pricing-plan-card.tsx";
import {
  IPricingPlan,
  PRICING_PLANS,
  SPECIAL_OFFER_PLAN,
} from "@/ui/plans/constants.ts";
import { Button } from "@dub/ui";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { getSubscriptionRenewalAction } from "core/constants/subscription-plans-weight.ts";
import {
  getCalculatePriceForView,
  getPaymentPlanPrice,
  ICustomerBody,
  TPaymentPlan,
} from "core/integration/payment/config";
import { ChevronLeft } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { UpdatePaymentDetails } from "./update-payment-details/update-payment-details.tsx";
import { UpdateSubscriptionFlow } from "./update-subscription-flow.tsx";

interface IPaymentComponentProps {
  user: ICustomerBody;
  featuresAccess: FeaturesAccess;
}

export const PaymentComponent: FC<Readonly<IPaymentComponentProps>> = ({
  user,
  featuresAccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpdatePaymentDetailsForm, setShowUpdatePaymentDetailsForm] =
    useState(false);

  const currentSubscriptionPlan = user?.paymentInfo?.subscriptionPlanCode;

  const isSpecialOfferPlan =
    currentSubscriptionPlan === SPECIAL_OFFER_PLAN.paymentPlan;

  const [selectedPlan, setSelectedPlan] = useState<IPricingPlan>(
    isSpecialOfferPlan
      ? SPECIAL_OFFER_PLAN
      : PRICING_PLANS.find(
          (item) => item.paymentPlan === currentSubscriptionPlan,
        ) || PRICING_PLANS[0],
  );

  const isDunning = featuresAccess.status === "dunning";
  // const isDunning = true;

  const { priceForView: totalPriceForView } = getPaymentPlanPrice({
    paymentPlan: selectedPlan.paymentPlan,
    user,
  });

  const totalChargePrice = getCalculatePriceForView(totalPriceForView, user);

  const onChangePlan = (value: string) => {
    const plan = [...PRICING_PLANS, SPECIAL_OFFER_PLAN].find(
      (p) => p.id === value,
    );

    if (plan) {
      setSelectedPlan(plan);
    }
  };

  const renewalAction = getSubscriptionRenewalAction(
    selectedPlan.paymentPlan,
    currentSubscriptionPlan as TPaymentPlan,
  );

  const isCurrentPlan = currentSubscriptionPlan === selectedPlan.paymentPlan;
  const isCancelled = featuresAccess.status === "cancelled";

  const headingText = useMemo(() => {
    if (isDunning) {
      return "Update Payment Details & Reactivate Subscription";
    }
    if (showUpdatePaymentDetailsForm) {
      return "Update your payment method";
    }
    return !featuresAccess.featuresAccess
      ? "Choose your plan"
      : "Update your plan";
  }, [showUpdatePaymentDetailsForm, featuresAccess.featuresAccess, isDunning]);

  return (
    <Flex
      direction="column"
      // lg:min-h-[480px]
      className="border-border-500 gap-4 rounded-lg px-0 py-3 lg:flex-1 lg:gap-[18px] lg:border lg:px-6 lg:py-4"
    >
      <Heading
        as="h2"
        align={{ initial: "center", lg: "left" }}
        size="4"
        className="text-neutral"
      >
        {headingText}
      </Heading>

      <div className="border-border-500 hidden h-px w-full border-t lg:block" />

      {showUpdatePaymentDetailsForm ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <UpdatePaymentDetails
            user={user}
            featuresAccess={featuresAccess}
            setShowForm={setShowUpdatePaymentDetailsForm}
          />
          <Button
            className="block"
            variant="secondary"
            loading={isProcessing}
            text={
              <div className="flex items-center justify-center gap-1">
                <ChevronLeft className="inline size-4" />
                Back
              </div>
            }
            onClick={() => setShowUpdatePaymentDetailsForm((value) => !value)}
          />
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-2 lg:gap-4">
          {!isDunning && (
            <>
              <RadioGroup.Root
                value={selectedPlan.id}
                onValueChange={onChangePlan}
                className="flex flex-col gap-2"
                disabled={isProcessing}
              >
                {PRICING_PLANS.map((plan) => (
                  <PricingPlanCard
                    key={plan.id}
                    user={user}
                    plan={plan}
                    isSelected={selectedPlan.id === plan.id}
                  />
                ))}
                {isSpecialOfferPlan && (
                  <PricingPlanCard
                    key={SPECIAL_OFFER_PLAN.id}
                    user={user}
                    plan={SPECIAL_OFFER_PLAN}
                    isSelected={selectedPlan.id === SPECIAL_OFFER_PLAN.id}
                  />
                )}
              </RadioGroup.Root>

              <Text as="p" size="1" className="text-center text-neutral-800">
                {(!isCurrentPlan || isCancelled) &&
                  `You'll be charged ${totalChargePrice} ${renewalAction === "upgrade" || isCancelled ? "today" : "at the start of the new billing period"}.`}
                {renewalAction === "upgrade" || isCancelled ? " " : <br />}
                Renews every {selectedPlan.name.toLowerCase()}. Cancel anytime.
              </Text>
            </>
          )}

          <div className="flex flex-col gap-2">
            {!isDunning && (
              <UpdateSubscriptionFlow
                user={user}
                currentSubscriptionPlan={currentSubscriptionPlan}
                selectedPlan={selectedPlan}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                featuresAccess={featuresAccess}
              />
            )}
            <Button
              className="block"
              variant={isDunning ? "primary" : "secondary"}
              loading={isProcessing}
              text="Update payment details"
              onClick={() => setShowUpdatePaymentDetailsForm((value) => !value)}
            />
          </div>

          <Text as="p" size="1" className="text-center text-neutral-800">
            🔒 Secure payment • Cancel anytime • No hidden fees
          </Text>
        </div>
      )}
    </Flex>
  );
};
