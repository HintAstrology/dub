"use client";

import { LoadingSpinner, Modal } from "@dub/ui";
import { Payment } from "@primer-io/checkout-web";
import { useCreateSubscriptionMutation } from "core/api/user/subscription/subscription.hook";
import {
  setPeopleAnalytic,
  trackClientEvents,
} from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface.ts";
import {
  CheckoutFormComponent,
  ICheckoutFormSuccess,
  IPrimerClientError,
} from "core/integration/payment/client/checkout-form";
import {
  getCalculatePriceForView,
  getChargePeriodDaysIdByPlan,
  getPaymentPlanPrice,
  ICustomerBody,
  TPaymentPlan,
} from "core/integration/payment/config";
import { generateCheckoutFormPaymentEvents } from "core/services/events/checkout-form-events.service.ts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface ICreateSubscriptionProps {
  user: ICustomerBody;
  isPaidTraffic: boolean;
  onSubscriptionCreating: () => Promise<void>;
  onSubcriptionCreated: () => void;
  onSignupError: (error: any) => void;
}

const pageName = "paywall";
const trialPaymentPlan: TPaymentPlan = "PRICE_TRIAL_MONTH_PLAN";
const subPaymentPlan: TPaymentPlan = "PRICE_MONTH_PLAN";

export const CreateSubscriptionFlow: FC<Readonly<ICreateSubscriptionProps>> = ({
  user,
  isPaidTraffic,
  onSubscriptionCreating,
  onSubcriptionCreated,
  onSignupError,
}) => {
  const router = useRouter();
  const paymentTypeRef = useRef<string | null>(null);
  const [isSubscriptionCreation, setIsSubscriptionCreation] = useState(false);

  const { trigger: triggerCreateSubscription } =
    useCreateSubscriptionMutation();

  const { priceForPay, priceForView } = getPaymentPlanPrice({
    paymentPlan: trialPaymentPlan,
    user,
  });
  const priceForViewText = getCalculatePriceForView(priceForView, user);

  const { priceForView: oldPriceForView } = getPaymentPlanPrice({
    paymentPlan: subPaymentPlan,
    user,
  });
  const oldPriceForViewText = getCalculatePriceForView(oldPriceForView, user);

  const onPaymentMethodTypeClick = (paymentMethodType: string) => {
    paymentTypeRef.current = paymentMethodType;

    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_CLICKED,
      params: {
        page_name: pageName,
        content_value: paymentMethodType,
        element_name: "payment_modal",
        email: user?.email,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });
  };

  const onPaymentMethodTypeOpen = (paymentMethodType: string) => {
    paymentTypeRef.current = paymentMethodType;

    if (paymentMethodType.includes("CARD")) {
      return;
    }

    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_OPENED,
      params: {
        page_name: pageName,
        element_name: paymentMethodType,
        email: user?.email,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });
  };

  const handleOpenCardDetailsForm = () => {
    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_CLICKED,
      params: {
        page_name: pageName,
        content_value: "card",
        element_name: "payment_modal",
        email: user?.email,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });
    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_OPENED,
      params: {
        page_name: pageName,
        element_name: "card",
        email: user?.email,
        event_category: "Authorized",
      },
      sessionId: user?.id,
    });
  };

  const onPaymentAttempt = () => {
    generateCheckoutFormPaymentEvents({
      user,
      stage: "attempt",
      amount: priceForPay,
      planCode: subPaymentPlan,
      paymentType: paymentTypeRef.current!,
      toxic: false,
      additionalParams: {
        email_marketing: user?.emailMarketing ?? false,
      },
    });
  };

  const handlePaymentSuccess = async (data: ICheckoutFormSuccess) => {
    setIsSubscriptionCreation(true);

    await onSubscriptionCreating?.();

    const res = await triggerCreateSubscription({
      payment: {
        id: data.payment.id,
        orderId: data.payment.orderId,
        paymentType: data.paymentType,
        paymentMethodType: data.paymentMethodType,
        paymentProcessor: data.paymentProcessor,
        currencyCode: data.currencyCode,
      },
      nationalDocumentId: data.nationalDocumentId,
      first6Digits: data.first6Digits,
      metadata: { ...data.metadata },
      paymentPlan: data.paymentPlan,
    });

    if (!res?.success) {
      setIsSubscriptionCreation(false);
      toast.error("Subscription creation failed!");

      const errorData = {
        code: "SUBSCRIPTION_CREATION_FAILED",
        message: "Subscription creation failed!",
      };

      onSignupError(errorData);

      return generateCheckoutFormPaymentEvents({
        user,
        data: {
          ...data,
          ...errorData,
          ...res,
        },
        planCode: subPaymentPlan,
        amount: priceForPay,
        stage: "error",
        toxic: false,
        additionalParams: {
          email_marketing: user?.emailMarketing ?? false,
        },
      });
    }

    toast.success("Subscription created successfully!");

    const chargePeriodDays = getChargePeriodDaysIdByPlan({
      paymentPlan: subPaymentPlan,
      user,
    });

    setPeopleAnalytic({
      plan_name: subPaymentPlan,
      charge_period_days: chargePeriodDays,
    });

    generateCheckoutFormPaymentEvents({
      user,
      data,
      planCode: subPaymentPlan,
      amount: priceForPay,
      stage: "success",
      paymentType: data.paymentType,
      subscriptionId: res!.data!.subscriptionId!,
      toxic: res?.data?.toxic,
      additionalParams: {
        email_marketing: user?.emailMarketing ?? false,
      },
    });

    router.refresh();

    onSubcriptionCreated?.();
  };

  const handleCheckoutError = ({
    error,
    data,
  }: {
    error: IPrimerClientError;
    data: { payment?: Payment };
  }) => {
    const eventData = {
      code: error?.code,
      message: error?.message,
      paymentId: data?.payment?.id,
    };

    setIsSubscriptionCreation(false);

    onSignupError(eventData);

    generateCheckoutFormPaymentEvents({
      user,
      data: eventData,
      planCode: subPaymentPlan,
      amount: priceForPay,
      stage: "error",
      toxic: false,
      paymentType: paymentTypeRef.current!,
    });
  };

  const termsAndConditionsText = useMemo(() => {
    if (isPaidTraffic) {
      return (
        // By continuing, you agree to our Terms and Conditions and Privacy Policy.
        // After 7 days you will be charged €39.99 every month unless you cancel 24 hours before your trial ends.

        <div className="text-xs font-medium text-neutral-500">
          By continuing, you agree to our{" "}
          <Link className="font-semibold underline" href="/eula?source=paywall">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link className="font-semibold underline" href="/privacy-policy?source=paywall">
            Privacy Policy
          </Link>
          . After 7 days you will be charged{" "}
          <span className="font-semibold">{oldPriceForViewText}</span> every
          month unless you cancel 24 hours before your trial ends.
        </div>
      );
    }

    return (
      <div className="text-xs font-medium text-neutral-500">
        By continuing, you agree to our{" "}
        <Link className="font-semibold underline" href="/eula?source=paywall">
          Terms and Conditions
        </Link>{" "}
        and{" "}
        <Link className="font-semibold underline" href="/privacy-policy?source=paywall">
          Privacy Policy
        </Link>
        . If you don’t cancel at least 24 hours before the end of your 7-day
        trial, your subscription will automatically renew at{" "}
        <span className="font-bold text-black">
          {oldPriceForViewText} every month
        </span>{" "}
        until you cancel through our{" "}
        <Link className="font-semibold underline" href="/help?source=paywall">
          Help Center
        </Link>
        . For assistance, please contact our support team at{" "}
        <Link className="font-semibold underline" href="mailto:help@getqr.com">
          help@getqr.com
        </Link>
      </div>
    );
  }, [isPaidTraffic]);

  return (
    <>
      <div id="payment-block" className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl bg-white px-0">
          <p className="text-xl font-bold">Total due:</p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-base font-semibold text-slate-400 line-through">
              {oldPriceForViewText}
            </span>
            <span className="text-xl font-bold">{priceForViewText}</span>
          </div>
        </div>
        <CheckoutFormComponent
          locale="en"
          theme="light"
          user={user}
          paymentPlan={trialPaymentPlan}
          onPaymentAttempt={onPaymentAttempt}
          handleCheckoutSuccess={handlePaymentSuccess}
          handleCheckoutError={handleCheckoutError}
          handleOpenCardDetailsForm={handleOpenCardDetailsForm}
          onPaymentMethodSelected={onPaymentMethodTypeClick}
          onBeforePaymentCreate={onPaymentMethodTypeOpen}
          submitBtn={{
            text: "Pay Now",
          }}
          isPaidTraffic={isPaidTraffic}
          termsAndConditionsText={termsAndConditionsText}
        />
      </div>

      <Modal
        showModal={isSubscriptionCreation}
        preventDefaultClose
        setShowModal={() => setIsSubscriptionCreation(false)}
        className="border-border-500"
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <span className="text-lg font-semibold">
            Your Order Is Being Processed
          </span>
          <LoadingSpinner />
          <span className="text-center">
            Please wait while we finalize your payment and create your digital
            product. Closing this tab may interrupt the process.
          </span>
        </div>
      </Modal>
    </>
  );
};
