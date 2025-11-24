"use client";

import { useGetUserProfileQuery } from "core/api/user/user.hook.tsx";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { checkFeaturesAccess } from "../actions/check-features-access";
import { useSession } from "next-auth/react";
import { TrialExpiredModal } from "@/ui/modals/trial-expired-modal";
import { 
  getTrialExpiredModalShown, 
  setTrialExpiredModalShown 
} from "../../core/services/cookie/user-session.service.ts";

interface TrialStatusContextType {
  isTrialOver: boolean;
  setIsTrialOver: (value: boolean) => void; // TODO: remove it, still used for testing
}

const TrialStatusContext = createContext<TrialStatusContextType | undefined>(
  undefined,
);

export function TrialStatusProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession() as
    | {
        data: { user: { id: string } };
        status: "authenticated";
      }
    | { data: null; status: "loading" };

  const [isTrialOver, setIsTrialOver] = useState<boolean>(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState<boolean>(false);
  const [trialModalShown, setTrialModalShown] = useState<boolean>(false);
  const previousStatusRef = useRef<string>(status);
  const pathname = usePathname();

  useGetUserProfileQuery();

  useEffect(() => {
    const checkModalShown = async () => {
      const hasBeenShown = await getTrialExpiredModalShown();
      setTrialModalShown(hasBeenShown);
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
    if (isAuthenticated && isTrialOver && !trialModalShown) {
      setShowTrialExpiredModal(true);
      setTrialModalShown(true);
      setTrialExpiredModalShown();
    }

    previousStatusRef.current = status;
  }, [status, isTrialOver, trialModalShown]);

  return (
    <TrialStatusContext.Provider value={{ isTrialOver, setIsTrialOver }}>
      <TrialExpiredModal
        showModal={showTrialExpiredModal}
        setShowModal={setShowTrialExpiredModal}
      />
      {children}
    </TrialStatusContext.Provider>
  );
}

export function useTrialStatus() {
  const context = useContext(TrialStatusContext);
  if (context === undefined) {
    throw new Error("useTrialStatus must be used within a TrialStatusProvider");
  }
  return context;
}
