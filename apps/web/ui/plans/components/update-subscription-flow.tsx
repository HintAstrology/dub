"use client";

import { IPricingPlan } from "@/ui/plans/constants";
import { Button } from "@dub/ui";
import { useCreateUserPaymentMutation } from "core/api/user/payment/payment.hook";
import { useUpdateSubscriptionMutation } from "core/api/user/subscription/subscription.hook";
import { pollPaymentStatus } from "core/integration/payment/client/services/payment-status.service.ts";
import { IGetPrimerClientPaymentInfoRes } from "core/integration/payment/server";
import { FC, useState } from "react";
import { toast } from "sonner";
import { ICustomerBody } from "core/integration/payment/config";
import { generateTrackingUpsellEvent } from "core/services/events/upsell-events.service.ts";

interface IUpdateSubscriptionProps {
  cookieUser: ICustomerBody;
  currentSubscriptionPlan: string | undefined;
  selectedPlan: IPricingPlan;
}

export const UpdateSubscriptionFlow: FC<Readonly<IUpdateSubscriptionProps>> = ({
  cookieUser,
  currentSubscriptionPlan,
  selectedPlan,
}) => {
  const [isUpdateProcessing, setIsUpdateProcessing] = useState(false);

  const { trigger: triggerCreateUserPayment } = useCreateUserPaymentMutation();
  const { trigger: triggerUpdateSubscription } =
    useUpdateSubscriptionMutation();

  const handleUpdatePlan = async () => {
    setIsUpdateProcessing(true);

    generateTrackingUpsellEvent({
      user: cookieUser!,
      paymentPlan: selectedPlan.paymentPlan,
      stage: "attempt",
    });

    const createPaymentRes = await triggerCreateUserPayment({
      paymentPlan: selectedPlan.paymentPlan,
    });

    const onError = (info?: IGetPrimerClientPaymentInfoRes) => {
      setIsUpdateProcessing(false);

      generateTrackingUpsellEvent({
        user: cookieUser!,
        paymentPlan: selectedPlan.paymentPlan,
        stage: "error",
        paymentId: info?.id ?? createPaymentRes?.data?.paymentId,
        additionalParams: {
          error_code: info?.statusReason?.code ?? info?.status ?? null,
        },
      });

      toast.error(
        `Payment failed: ${info?.statusReason?.code ?? info?.status ?? "unknown error"}`,
      );
    };

    const onPurchased = async (info: IGetPrimerClientPaymentInfoRes) => {
      await triggerUpdateSubscription({ paymentPlan: selectedPlan.paymentPlan })
        .then(() => {
          generateTrackingUpsellEvent({
            user: cookieUser!,
            paymentPlan: selectedPlan.paymentPlan,
            stage: "success",
            paymentId: info?.id,
          });

          toast.success("The plan update was successful!");
          setTimeout(() => window.location.reload(), 1000);
        })
        .catch((error) =>
          toast.error(
            `The plan updating failed: ${error?.code ?? error?.message}`,
          ),
        );
    };

    if (!createPaymentRes?.success) {
      setIsUpdateProcessing(false);
      toast.error(`Payment creation failed.`);
      return;
    }

    await pollPaymentStatus({
      paymentId: createPaymentRes!.data!.paymentId,
      onPurchased,
      onError,
      initialStatus: createPaymentRes!.data!.status,
    });
  };

  return (
    <Button
      className="block"
      loading={isUpdateProcessing}
      disabled={
        currentSubscriptionPlan === selectedPlan.paymentPlan ||
        isUpdateProcessing
      }
      onClick={handleUpdatePlan}
      text={isUpdateProcessing ? null : "Upgrade Plan"}
    />
  );
};
