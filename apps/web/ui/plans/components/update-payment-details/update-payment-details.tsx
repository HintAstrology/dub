"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less";
import { LoadingSpinner } from "@dub/ui";
import { Payment } from "@primer-io/checkout-web";
import { useCreateUserSessionMutation } from "core/api/user/payment/payment.hook";
import { useUpdateSubscriptionPaymentMethodQuery } from "core/api/user/subscription/subscription.hook";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import {
  CheckoutFormComponent,
  ICheckoutFormSuccess,
  IPrimerClientError,
} from "core/integration/payment/client";
import {
  getPaymentPlanPrice,
  ICustomerBody,
  TPaymentPlan,
} from "core/integration/payment/config";
import { generateCheckoutFormPaymentEvents } from "core/services/events/checkout-form-events.service";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface Props {
  user: ICustomerBody;
  featuresAccess: FeaturesAccess;
  setShowForm: Dispatch<SetStateAction<boolean>>;
}

export const UpdatePaymentDetails: FC<Readonly<Props>> = ({
  user,
  featuresAccess,
  setShowForm,
}) => {
  const paymentTypeRef = useRef<string | null>(null);

  // const [currencies, setCurrencies] = useState<ICustomerBody['currency'] | null>(
  //   user?.currency || null,
  // );
  const [clientToken, setClientToken] = useState<string | null>(null);

  const { trigger: triggerCreateUserSession } = useCreateUserSessionMutation();
  const { trigger: triggerUpdateSubscriptionPaymentMethod } =
    useUpdateSubscriptionPaymentMethodQuery();

  useEffect(() => {
    const getClientToken = async () => {
      // if (!user?.paymentInfo || !user?.currency) {
      //   const localCurrencies = await getCurrenciesData();
      //   setCurrencies(localCurrencies);

      //   await updateUserPaymentInfo({
      //     currency: localCurrencies,
      //     paymentInfo: { customerId: user!.id! },
      //   });
      // }

      trackClientEvents({
        event: EAnalyticEvents.PRIMER_SESSION_ATTEMPT,
        params: {
          customer_id: user?.id,
        },
        sessionId: user?.id,
      });
      triggerCreateUserSession({ payMethodUpdateSession: true })
        .then((response: any) => {
          trackClientEvents({
            event: EAnalyticEvents.PRIMER_SESSION_CREATED,
            params: {
              customer_id: user?.id,
            },
            sessionId: user?.id,
          });

          setClientToken(response!.data!.clientToken!);
        })
        .catch((error) => {
          trackClientEvents({
            event: EAnalyticEvents.PRIMER_SESSION_ERROR,
            params: {
              customer_id: user?.id,
              email: user!.email!,
              flow_type: "payment_method",
              error_code: error?.code,
              error_message: error?.message,
            },
            sessionId: user?.id,
          });
        });
    };

    getClientToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const transformedUser: ICustomerBody = {
    ...user,
    paymentInfo: {
      ...user?.paymentInfo,
      clientToken: clientToken ?? undefined,
    },
    currency: {
      ...user?.currency,
    },
  };

  const paymentPlanForUpdate: TPaymentPlan = "MIN_PRICE";
  const { priceForPay: minimalPriceForUpdate } = getPaymentPlanPrice({
    paymentPlan: paymentPlanForUpdate,
    user: transformedUser,
  });

  const onPaymentMethodTypeClick = (paymentMethodType: string) => {
    paymentTypeRef.current = paymentMethodType;

    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "paymentDetails",
        content_value: paymentMethodType,
        event_category: "AppPurchase",
        event_type: null,
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
        page_name: "paymentDetails",
        element_name: paymentMethodType,
        event_category: "AppPurchase",
        event_type: null,
      },
      sessionId: user?.id,
    });
  };

  const handleOpenCardDetailsForm = () => {
    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "paymentDetails",
        content_value: "card",
        event_category: "AppPurchase",
        event_type: null,
      },
      sessionId: user?.id,
    });
    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_OPENED,
      params: {
        page_name: "paymentDetails",
        element_name: "CardDetails",
        event_category: "AppPurchase",
        event_type: null,
      },
      sessionId: user?.id,
    });
  };

  const handleCheckoutError = ({
    error,
    data,
  }: {
    error: IPrimerClientError;
    data: { payment?: Payment };
  }) => {
    const eventData = {
      code: error.code,
      message: error.message,
      paymentId: data?.payment?.id,
    };

    generateCheckoutFormPaymentEvents({
      user: transformedUser,
      data: eventData,
      flowType: "card_update",
      planCode: paymentPlanForUpdate,
      amount: minimalPriceForUpdate,
      stage: "error",
      toxic: user?.toxic,
      paymentType: paymentTypeRef.current!,
      subscriptionId: featuresAccess.subscriptionId,
      additionalParams: { event_category: "AppPurchase", event_type: null },
    });
  };

  const handleCheckoutSuccess = async (data: ICheckoutFormSuccess) => {
    const res = await triggerUpdateSubscriptionPaymentMethod({
      email: user!.email!,
      customerId: user!.id!,
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
    });

    if (!res?.success) {
      generateCheckoutFormPaymentEvents({
        user: transformedUser,
        data: {
          ...data,
          ...res,
        },
        flowType: "card_update",
        planCode: paymentPlanForUpdate,
        amount: minimalPriceForUpdate,
        stage: "error",
        toxic: user?.toxic,
        subscriptionId: featuresAccess.subscriptionId,
        additionalParams: { event_category: "AppPurchase", event_type: null },
      });

      return;
    }

    generateCheckoutFormPaymentEvents({
      user: transformedUser,
      data,
      flowType: "card_update",
      planCode: paymentPlanForUpdate,
      amount: minimalPriceForUpdate,
      stage: "success",
      paymentType: data.paymentType,
      toxic: res?.data?.toxic,
      subscriptionId: featuresAccess.subscriptionId,
      additionalParams: { event_category: "AppPurchase", event_type: null },
    });

    setShowForm(false);

    toast.success("Your payment details were updated successfully.", {
      duration: 10000,
    });

    return;

    // router.push(EClientRoutes.APP_REPORTS);
  };

  const onPaymentAttempt = () => {
    generateCheckoutFormPaymentEvents({
      user: transformedUser,
      stage: "attempt",
      amount: minimalPriceForUpdate,
      flowType: "card_update",
      planCode: paymentPlanForUpdate,
      paymentType: paymentTypeRef.current!,
      toxic: user?.toxic,
      subscriptionId: featuresAccess.subscriptionId,
      additionalParams: { event_category: "AppPurchase", event_type: null },
    });
  };

  const onSessionUpdate = () => {
    trackClientEvents({
      event: EAnalyticEvents.PRIMER_SESSION_UPDATED,
      params: {
        customer_id: user?.id,
        email: user?.email,
        flow_type: "payment_method",
      },
      sessionId: user?.id,
    });
  };

  const onSessionUpdateError = (error: IPrimerClientError) => {
    trackClientEvents({
      event: EAnalyticEvents.PRIMER_SESSION_ERROR,
      params: {
        customer_id: user?.id,
        email: user?.email,
        flow_type: "payment_method",
        error_code: error?.code,
        error_message: error?.message,
      },
      sessionId: user?.id,
    });
  };

  return (
    <div className="flex min-h-[88px] w-full items-center justify-center">
      {clientToken ? (
        <CheckoutFormComponent
          locale="en"
          theme="light"
          user={transformedUser as ICustomerBody}
          submitBtn={{
            text: "Update Payment Method",
          }}
          paymentPlan={paymentPlanForUpdate}
          handleCheckoutError={handleCheckoutError}
          handleCheckoutSuccess={handleCheckoutSuccess}
          handleOpenCardDetailsForm={handleOpenCardDetailsForm}
          onPaymentMethodSelected={onPaymentMethodTypeClick}
          onBeforePaymentCreate={onPaymentMethodTypeOpen}
          onPaymentAttempt={onPaymentAttempt}
          onSessionUpdate={onSessionUpdate}
          onSessionUpdateError={onSessionUpdateError}
          className="w-full"
          payMethodUpdateSession={true}
        />
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};
