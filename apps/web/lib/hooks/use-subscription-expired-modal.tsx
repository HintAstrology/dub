"use client";

import { SubscriptionExpiredModal } from "@/ui/modals/subscription-expired-modal";
import { useCallback, useState } from "react";

export function useSubscriptionExpiredModal() {
  const [showSubscriptionExpiredModal, setShowSubscriptionExpiredModal] =
    useState<boolean>(false);

  const SubscriptionExpiredModalCallback = useCallback(() => {
    return showSubscriptionExpiredModal ? (
      <SubscriptionExpiredModal
        showModal={showSubscriptionExpiredModal}
        setShowModal={setShowSubscriptionExpiredModal}
      />
    ) : null;
  }, [showSubscriptionExpiredModal]);

  return {
    setShowSubscriptionExpiredModal,
    SubscriptionExpiredModalCallback,
  };
}

