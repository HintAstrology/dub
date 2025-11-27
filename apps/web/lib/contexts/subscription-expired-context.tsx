"use client";

import { useGetUserProfileQuery } from "core/api/user/user.hook.tsx";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { checkFeaturesAccess } from "../actions/check-features-access";
import { useSession } from "next-auth/react";
import { SubscriptionExpiredModal } from "@/ui/modals/subscription-expired-modal";
import { 
  getSubscriptionExpiredModalShown, 
  setSubscriptionExpiredModalShown 
} from "../../core/services/cookie/user-session.service.ts";

interface SubscriptionExpiredContextType {
  isTrialOver: boolean;
  setIsTrialOver: (value: boolean) => void; // TODO: remove it, still used for testing
}

const SubscriptionExpiredContext = createContext<SubscriptionExpiredContextType | undefined>(
  undefined,
);

export function SubscriptionExpiredProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession() as
    | {
        data: { user: { id: string } };
        status: "authenticated";
      }
    | { data: null; status: "loading" };

  const [isTrialOver, setIsTrialOver] = useState<boolean>(false);
  const [showSubscriptionExpiredModal, setShowSubscriptionExpiredModal] = useState<boolean>(false);
  const [subscriptionModalShown, setSubscriptionModalShown] = useState<boolean>(false);
  const previousStatusRef = useRef<string>(status);
  const pathname = usePathname();

  useGetUserProfileQuery();

  useEffect(() => {
    const checkModalShown = async () => {
      const hasBeenShown = await getSubscriptionExpiredModalShown();
      setSubscriptionModalShown(hasBeenShown);
    };
    checkModalShown();
  }, []);

  const checkTrialStatus = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const res = await checkFeaturesAccess();

      if (!res?.data?.featuresAccess) {
        setIsTrialOver(true);
      }
    } catch (error) {
      console.error("Error checking trial status:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "loading") return;

    checkTrialStatus();
  }, [status, checkTrialStatus, pathname]);

  useEffect(() => {
    const isAuthenticated = 
      status === "authenticated";
    if (isAuthenticated && isTrialOver && !subscriptionModalShown) {
      setShowSubscriptionExpiredModal(true);
      setSubscriptionModalShown(true);
      setSubscriptionExpiredModalShown();
    }

    previousStatusRef.current = status;
  }, [status, isTrialOver, subscriptionModalShown]);

  return (
    <SubscriptionExpiredContext.Provider value={{ isTrialOver, setIsTrialOver }}>
      <SubscriptionExpiredModal
        showModal={showSubscriptionExpiredModal}
        setShowModal={setShowSubscriptionExpiredModal}
      />
      {children}
    </SubscriptionExpiredContext.Provider>
  );
}

export function useSubscriptionExpired() {
  const context = useContext(SubscriptionExpiredContext);
  if (context === undefined) {
    throw new Error("useSubscriptionExpired must be used within a SubscriptionExpiredProvider");
  }
  return context;
}

