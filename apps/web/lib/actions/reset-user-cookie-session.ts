"use server";

import {
  resetUserCookieService,
  resetUserSessionId,
  resetTrialExpiredModalShown,
} from "../../core/services/cookie/user-session.service.ts";

export const resetUserCookieSession = async () => {
  await resetUserSessionId();
  await resetUserCookieService();
  await resetTrialExpiredModalShown();
};
