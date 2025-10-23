"use server";

import { conn } from "@/lib/planetscale/connection";
import { checkSubscriptionStatusAuthLess } from "./check-subscription-status-auth-less";

export type FeaturesAccess = {
  featuresAccess: boolean;
  isTrialOver: boolean;
  isSubscribed: boolean;
  subscriptionNotPaid: boolean;
  subscriptionId: string | null;
  status:
    | "active"
    | "inactive"
    | "trial"
    | "dunning"
    | "pre_active"
    | "pre_renew"
    | "scheduled_for_cancellation"
    | "cancelled"
    | null;
};

export const checkFeaturesAccessAuthLess = async (userId: string) => {
  const { rows } = await conn.execute(
    `SELECT u.createdAt as userCreatedAt, u.email as email
    FROM User u 
    WHERE u.id = ?`,
    [userId],
  );

  const userData = rows?.[0];
  if (!userData) {
    return {
      featuresAccess: false,
      isTrialOver: false,
      isSubscribed: false,
      subscriptionNotPaid: false,
      subscriptionId: null,
      status: null,
    } as FeaturesAccess;
  }

  const { isSubscribed, subscriptionId, status } =
    await checkSubscriptionStatusAuthLess(userData.email);

  // const totalClicks = userData.totalUserClicks || 0;
  // const daysSinceRegistration = userData.userCreatedAt
  //   ? Math.floor(
  //       (Date.now() - new Date(userData.userCreatedAt).getTime()) /
  //         (1000 * 60 * 60 * 24),
  //     )
  //   : 0;

  // const maxClicksForTest = beforeRecord
  //   ? TrialClicksForTest - 1
  //   : TrialClicksForTest;
  // const maxClicksForRealFlow = beforeRecord ? TrialClicks - 1 : TrialClicks;
  // const maxClicks =
  //   process.env.NEXT_PUBLIC_APP_ENV === "dev"
  //     ? maxClicksForTest
  //     : maxClicksForRealFlow;

  // const isTrialOver = totalClicks >= maxClicks || daysSinceRegistration >= TrialDays;

  return {
    featuresAccess: isSubscribed,
    isTrialOver: status !== "trial" || !status,
    isSubscribed,
    subscriptionNotPaid: !!subscriptionId && !isSubscribed,
    subscriptionId,
    status,
  } as FeaturesAccess;
};
