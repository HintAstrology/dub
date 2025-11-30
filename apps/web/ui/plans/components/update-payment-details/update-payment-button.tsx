"use client";

import { FeaturesAccess } from "@/lib/actions/check-features-access-auth-less";
import { IPricingPlan } from "@/ui/plans/constants";
import { Button } from "@dub/ui";
import {
  ICustomerBody,
} from "core/integration/payment/config";
import { useRouter } from "next/navigation";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { UpdatePaymentDetails } from './update-payment-details';

interface Props {
  user: ICustomerBody;
  featuresAccess: FeaturesAccess;
  currentSubscriptionPlan: string | undefined;
  selectedPlan: IPricingPlan;
  isProcessing: boolean;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
}

export const UpdatePaymentButton: FC<Readonly<Props>> = ({
  user,
  featuresAccess,
  selectedPlan,
  currentSubscriptionPlan,
  isProcessing,
  setIsProcessing,
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="block"
        variant="secondary"
        loading={isProcessing}
        text="Update payment details"
        onClick={() => setShowForm(value => !value)}
      />
      {showForm && (
        <UpdatePaymentDetails user={user} />
      )}
    </div>
  );
};
