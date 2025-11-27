"use server";

import {
  resetUserCookieService,
  resetUserSessionId,
  resetSubscriptionExpiredModalShown,
} from "../../core/services/cookie/user-session.service.ts";

export const resetUserCookieSession = async () => {
  await resetUserSessionId();
  await resetUserCookieService();
  await resetSubscriptionExpiredModalShown();
};
