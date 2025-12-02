"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less.ts";
import { PricingPlanCard } from "@/ui/plans/components/pricing-plan-card.tsx";
import {
  IPricingPlan,
  PRICING_PLANS,
  SPECIAL_OFFER_PLAN,
} from "@/ui/plans/constants.ts";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Heading, Text } from "@radix-ui/themes";
import { getSubscriptionRenewalAction } from "core/constants/subscription-plans-weight.ts";
import {
  getCalculatePriceForView,
  getPaymentPlanPrice,
  ICustomerBody,
  TPaymentPlan,
} from "core/integration/payment/config";
import { FC, useState } from "react";
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

  const currentSubscriptionPlan = user?.paymentInfo?.subscriptionPlanCode;
  console.log("currentSubscriptionPlan", currentSubscriptionPlan);
  const isSpecialOfferPlan =
    currentSubscriptionPlan === SPECIAL_OFFER_PLAN.paymentPlan;

  const [selectedPlan, setSelectedPlan] = useState<IPricingPlan>(
    isSpecialOfferPlan
      ? SPECIAL_OFFER_PLAN
      : PRICING_PLANS.find(
          (item) => item.paymentPlan === currentSubscriptionPlan,
        ) || PRICING_PLANS[0],
  );

  console.log("selectedPlan", selectedPlan);

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

  return (
    <div className="border-border-500 flex flex-col justify-between gap-4 rounded-xl border bg-white px-4 py-3 shadow-sm lg:h-full lg:flex-1 lg:gap-6 lg:p-6">
      <div>
        <Heading
          as="h2"
          align="left"
          size={{ initial: "3", lg: "5" }}
          className="text-foreground font-semibold"
        >
          {!featuresAccess.featuresAccess
            ? "Choose your plan"
            : "Update your plan"}
        </Heading>
      </div>
      <div>
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
      </div>
      <div className="flex flex-col justify-center gap-2 lg:gap-4">
        <Text as="p" size="1" className="text-center text-neutral-800">
          {(!isCurrentPlan || isCancelled) &&
            `You'll be charged ${totalChargePrice} ${renewalAction === "upgrade" || isCancelled ? "today" : "at the start of the new billing period"}.`}
          {renewalAction === "upgrade" || isCancelled ? " " : <br />}Renews
          every {selectedPlan.name.toLowerCase()}. Cancel anytime.
        </Text>

        <div>
          <UpdateSubscriptionFlow
            user={user}
            currentSubscriptionPlan={currentSubscriptionPlan}
            selectedPlan={selectedPlan}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            featuresAccess={featuresAccess}
          />
        </div>

        <Text as="p" size="1" className="text-center text-neutral-800">
          🔒 Secure payment • Cancel anytime • No hidden fees
        </Text>
      </div>
    </div>
  );
};
