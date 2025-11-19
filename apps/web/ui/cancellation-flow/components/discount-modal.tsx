"use client";

import { LoadingSpinner, Modal } from "@dub/ui";
import { Theme } from "@radix-ui/themes";
import { useUpdateSubscriptionMutation } from 'core/api/user/subscription/subscription.hook';
import { setPeopleAnalytic, trackClientEvents } from 'core/integration/analytic';
import { EAnalyticEvents } from 'core/integration/analytic/interfaces/analytic.interface';
import { getChargePeriodDaysIdByPlan, ICustomerBody, TPaymentPlan } from 'core/integration/payment/config';
import { Heart, TriangleAlert } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { toast } from 'sonner';
import { mutate } from 'swr';
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { cn } from '@dub/utils';

const SPECIAL_PLAN = "PRICE_RETENTION_OFFER_MONTH";

type Props = {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  user: ICustomerBody;
};

export const DiscountModal: FC<Props> = ({ showModal, setShowModal, user }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSecondStep, setIsSecondStep] = useState(false);
  const router = useRouter();

  const { trigger: triggerUpdateSubscription } =
    useUpdateSubscriptionMutation();
  
  const handleClose = () => {
    if (!isSecondStep) {
      setIsSecondStep(true);
      return;
    }
    setShowModal(false);
  };

  const justDowngradePlan = useCallback(async () => {
    await triggerUpdateSubscription({
      paymentPlan: SPECIAL_PLAN,
    })
      .then(async (res) => {
        const chargePeriodDays = getChargePeriodDaysIdByPlan({
          paymentPlan: SPECIAL_PLAN,
          user,
        });

        toast.success(
          `You’ve updated to the discounted monthly plan. It will take effect on ${format(
            new Date(res?.data?.nextBillingDate || ""),
            "yyyy-MM-dd",
          )}. No charge today!`,
        );

        setPeopleAnalytic({
          plan_name: SPECIAL_PLAN,
          charge_period_days: chargePeriodDays,
        });

        await mutate("/api/user");

        // Force refresh the page cache

        router.refresh();
        router.push("/");
      })
      .catch((error) => {
        setIsProcessing(false);
        toast.error(
          `The plan updating failed: ${error?.code ?? error?.message}`,
        );
      });

    return;
  }, []);

  const handleUpdatePlan = useCallback(async () => {
    setIsProcessing(true);

    trackClientEvents({
      event: EAnalyticEvents.PLAN_PICKER_CLICKED,
      params: {
        event_category: "Authorized",
        email: user.email,
        plan_name: SPECIAL_PLAN,
        page_name: "profile",
        content_group: "plans",
      },
      sessionId: user.id,
    });

    await justDowngradePlan()
  }, [user, justDowngradePlan]);

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      className="border-border-500 md:max-w-md"
      drawerRootProps={{
        repositionInputs: false,
      }}
      preventDefaultClose
    >
      <Theme>
        <div className="flex flex-col gap-2">
          <div className="relative flex w-full items-center justify-center pt-8 pb-2">
            <h3
              className={cn("!mt-0 max-w-xs text-center text-2xl font-bold flex items-center gap-2 font-bold", {
                "text-xl": isSecondStep,
              })}
            >
              {!isSecondStep
                ? <>
                  <Heart className="h-10 w-10 inline text-red-500" /> Wait — before you go!
                </>
                : <>
                  <TriangleAlert className="h-8 w-8 min-w-8 inline text-amber-600" /> Are you sure you want to lose this one-time opportunity?
                </>
              }
            </h3>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 justify-center items-center">
                {!isSecondStep
                  ? <>
                    <p>We'd love to make things better for you.</p>
                    <p className="text-4xl font-extrabold text-red-500 py-4">50% OFF<br />FOREVER</p>
                    <p className="text-lg font-semibold">$ 19.99 per month</p>
                    <p>No interruptions. No reactivation hassle. Just savings.</p>
                  </>
                  : <>
                    <p className="text-center pt-4">You're about to give up your <strong>exclusive 50% lifetime discount</strong> — once it's gone, it's gone.</p>
                    <p className="text-center py-4 text-2xl font-bold">$ 19.99 per<br />month<br />FOREVER</p>
                  </>
                }
              </div>
              

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleUpdatePlan}
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-lg font-medium text-white h-12"
                  disabled={isProcessing}
                >
                  {isProcessing ? <LoadingSpinner /> : null}{!isSecondStep ? "Activate My 50% Forever Discount" : "Keep & Activate My 50% Forever Discount"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  size="lg"
                  className="text-lg h-12"
                  disabled={isProcessing}
                >
                  {!isSecondStep ? "No thanks" : "Cancel my subscription"}
                </Button>
                <div className="text-xs font-medium text-neutral-500 text-center py-4">
                  By activating the offer, you agree to our{" "}
                  <Link className="font-semibold underline" href="/eula" target="_blank">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link className="font-semibold underline" href="/privacy-policy" target="_blank">
                    Privacy Policy
                  </Link>
                  . Your plan renews automatically at the <strong>discounted $19.99/month</strong> for as long as your subscription remains active, unless you cancel at least 24 hours before your next billing period.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </Modal>
  );
}
