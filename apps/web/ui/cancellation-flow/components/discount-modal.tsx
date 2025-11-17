import { X } from "@/ui/shared/icons";
import { Button, Modal } from "@dub/ui";
import { Flex, Text, Theme } from "@radix-ui/themes";
import { generateTrackingUpsellEvent } from 'core/services/events/upsell-events.service';
import { Heart, TriangleAlert } from "lucide-react";
import Link from 'next/link';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSecondStep, setIsSecondStep] = useState(false);
  
  const handleClose = () => {
    if (!isSecondStep) {
      setIsSecondStep(true);
      return;
    }
    setShowModal(false);
  };

  const handleActivateDiscount = useCallback(async () => {
    setIsLoading(true);
    setIsLoading(false);
  }, []);

  // const payAndUpdatePlan = async () => {
  //   setIsProcessing(true);

  //   generateTrackingUpsellEvent({
  //     user,
  //     paymentPlan: selectedPlan.paymentPlan,
  //     stage: "attempt",
  //     additionalParams: {
  //       billing_action: getSubscriptionRenewalAction(
  //         selectedPlan.paymentPlan,
  //         currentSubscriptionPlan as TPaymentPlan,
  //       ),
  //     },
  //   });

  //   const createPaymentRes = await triggerCreateUserPayment({
  //     paymentPlan: selectedPlan.paymentPlan,
  //   });

  //   if (!createPaymentRes?.success) {
  //     setIsProcessing(false);
  //     generateTrackingUpsellEvent({
  //       user,
  //       paymentPlan: selectedPlan.paymentPlan,
  //       stage: "error",
  //       additionalParams: {
  //         error_code: "PAYMENT_CREATION_FAILED",
  //         billing_action: getSubscriptionRenewalAction(
  //           selectedPlan.paymentPlan,
  //           currentSubscriptionPlan as TPaymentPlan,
  //         ),
  //       },
  //     });
  //     toast.error(`Payment creation failed.`);

  //     return;
  //   }

  //   const onError = (info?: IGetPrimerClientPaymentInfoRes) => {
  //     setIsProcessing(false);

  //     generateTrackingUpsellEvent({
  //       user,
  //       paymentPlan: selectedPlan.paymentPlan,
  //       stage: "error",
  //       paymentId: info?.id ?? createPaymentRes?.data?.paymentId,
  //       additionalParams: {
  //         error_code: info?.statusReason?.code ?? info?.status ?? null,
  //         billing_action: getSubscriptionRenewalAction(
  //           selectedPlan.paymentPlan,
  //           currentSubscriptionPlan as TPaymentPlan,
  //         ),
  //       },
  //     });

  //     toast.error(
  //       `Payment failed: ${info?.statusReason?.code ?? info?.status ?? "unknown error"}`,
  //     );
  //   };

  //   const onPurchased = async (info: IGetPrimerClientPaymentInfoRes) => {
  //     await triggerUpdateSubscription({
  //       paymentId: info.id,
  //       paymentPlan: selectedPlan.paymentPlan,
  //     })
  //       .then(async () => {
  //         generateTrackingUpsellEvent({
  //           user,
  //           paymentPlan: selectedPlan.paymentPlan,
  //           stage: "success",
  //           paymentId: info?.id,
  //           additionalParams: {
  //             billing_action: getSubscriptionRenewalAction(
  //               selectedPlan.paymentPlan,
  //               currentSubscriptionPlan as TPaymentPlan,
  //             ),
  //           },
  //         });

  //         if (
  //           featuresAccess.isSubscribed &&
  //           featuresAccess.status !== "scheduled_for_cancellation"
  //         ) {
  //           toast.success(
  //             `You’ve successfully upgraded to ${selectedPlan.name} plan.`,
  //           );
  //         } else {
  //           toast.success(
  //             `You’ve successfully activated your subscription. Your current plan is ${selectedPlan.name} plan.`,
  //           );
  //         }

  //         const chargePeriodDays = getChargePeriodDaysIdByPlan({
  //           paymentPlan: selectedPlan.paymentPlan,
  //           user,
  //         });

  //         setPeopleAnalytic({
  //           plan_name: selectedPlan.paymentPlan,
  //           charge_period_days: chargePeriodDays,
  //         });

  //         setIsTrialOver(false);
  //         await updateSession();
  //         await mutate("/api/user");

  //         // Force refresh the page cache
  //         router.refresh();
  //         router.push("/");
  //       })
  //       .catch((error) =>
  //         toast.error(
  //           `The plan updating failed: ${error?.code ?? error?.message}`,
  //         ),
  //       );
  //   };

  //   await pollPaymentStatus({
  //     paymentId: createPaymentRes!.data!.paymentId,
  //     onPurchased,
  //     onError,
  //     initialStatus: createPaymentRes!.data!.status,
  //   });
  // };

  // const justDowngradePlan = useCallback(async () => {
  //   await triggerUpdateSubscription({
  //     paymentPlan: selectedPlan.paymentPlan,
  //   })
  //     .then(async (res) => {
  //       const chargePeriodDays = getChargePeriodDaysIdByPlan({
  //         paymentPlan: selectedPlan.paymentPlan,
  //         user,
  //       });

  //       if (
  //         featuresAccess.isSubscribed &&
  //         featuresAccess.status !== "scheduled_for_cancellation"
  //       ) {
  //         toast.success(
  //           `You’ve downgraded to ${selectedPlan.name} plan. It will take effect on ${format(
  //             new Date(res?.data?.nextBillingDate || ""),
  //             "yyyy-MM-dd",
  //           )}. No charge today!`,
  //         );
  //       } else {
  //         toast.success(
  //           `You’ve successfully activated your subscription. Your current plan is ${selectedPlan.name} plan.`,
  //         );
  //       }

  //       setPeopleAnalytic({
  //         plan_name: selectedPlan.paymentPlan,
  //         charge_period_days: chargePeriodDays,
  //       });
  //       setIsTrialOver(false);

  //       await updateSession();
  //       await mutate("/api/user");

  //       // Force refresh the page cache

  //       router.refresh();
  //       router.push("/");
  //     })
  //     .catch((error) => {
  //       setIsProcessing(false);
  //       toast.error(
  //         `The plan updating failed: ${error?.code ?? error?.message}`,
  //       );
  //     });

  //   return;
  // }, [selectedPlan, currentSubscriptionPlan]);

  // const handleUpdatePlan = useCallback(async () => {
  //   setIsProcessing(true);

  //   trackClientEvents({
  //     event: EAnalyticEvents.PLAN_PICKER_CLICKED,
  //     params: {
  //       event_category: "Authorized",
  //       email: user.email,
  //       plan_name: selectedPlan.paymentPlan,
  //       page_name: "profile",
  //       content_group: "plans",
  //     },
  //     sessionId: user.id,
  //   });

  //   if (
  //     subscriptionPlansWeight[selectedPlan.paymentPlan] <
  //     subscriptionPlansWeight?.[currentSubscriptionPlan!]
  //   ) {
  //     await justDowngradePlan();

  //     return;
  //   }

  //   await payAndUpdatePlan();
  // }, [selectedPlan, currentSubscriptionPlan, featuresAccess, user]);

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
            <h3 className="!mt-0 max-w-xs text-center text-xl font-semibold flex items-center gap-2 font-bold">
              {!isSecondStep
                ? <>
                  <Heart className="h-8 w-8 inline text-red-500" /> Wait — before you go!
                </>
                : <>
                  <TriangleAlert className="h-8 w-8 min-w-8 inline text-amber-600" /> Are you sure you want to lose this one-time opportunity?
                </>
              }
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
              <div className="flex flex-col gap-2 justify-center items-center">
                {!isSecondStep
                  ? <>
                    <p>We'd love to make things better for you.</p>
                    <p className="text-3xl font-extrabold text-red-500">50% OFF FOREVER</p>
                    <p className="text-lg font-semibold">$ 19.99 per month</p>
                    <p>No interruptions. No reactivation hassle. Just savings.</p>
                  </>
                  : <>
                    <p className="text-center">You're about to give up your <span className="font-semibold inline">exclusive 50% lifetime discount</span> — once it's gone, it's gone.</p>
                    <p className="text-center">Keep your premium access, analytics and customization features for just <span className="font-semibold inline">$19.99/month — forever.</span></p>
                  </>
                }
              </div>
              

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleActivateDiscount}
                  loading={isLoading}
                  text={!isSecondStep ? "Activate My 50% Forever Discount" : "Keep & Activate My 50% Forever Discount"}
                />
                <div className="text-xs font-medium text-neutral-500 text-center">
                  By continuing, you agree to our{" "}
                  <Link className="font-semibold underline" href="/eula" target="_blank">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link className="font-semibold underline" href="/privacy-policy" target="_blank">
                    Privacy Policy
                  </Link>
                  . Your plan renews automatically at the discounted $19.99/month for as long as your subscription remains active, unless you cancel at least 24 hours before your next billing period.
                </div>
                {isSecondStep && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    text="Continue to cancel"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}
