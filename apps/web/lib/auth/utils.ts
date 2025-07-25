import { ICustomerBody, TPaymentPlan } from "core/integration/payment/config";
import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { DubApiError } from "../api/errors";
import { authOptions } from "./options";

export type TPaymentInfo = {
  paymentPlan: TPaymentPlan;
  paymentInfo?: ICustomerBody["paymentInfo"];
  currency: ICustomerBody["currency"];
};

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    isMachine: boolean;
    defaultWorkspace?: string;
    defaultPartnerId?: string;
    dubPartnerId?: string;
    paymentData?: any;
  };
}

export const getSession = async () => {
  return getServerSession(authOptions) as Promise<Session>;
};

export const getAuthTokenOrThrow = (
  req: Request | NextRequest,
  type: "Bearer" | "Basic" = "Bearer",
) => {
  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader) {
    throw new DubApiError({
      code: "bad_request",
      message:
        "Misconfigured authorization header. Did you forget to add 'Bearer '? Learn more: https://d.to/auth",
    });
  }

  return authorizationHeader.replace(`${type} `, "");
};

export function generateOTP() {
  // Generate a random number between 0 and 999999
  const randomNumber = Math.floor(Math.random() * 1000000);

  // Pad the number with leading zeros if necessary to ensure it is always 6 digits
  const otp = randomNumber.toString().padStart(6, "0");

  return otp;
}

export const convertSessionUserToCustomerBody = (
  sessionUser: Session["user"],
  options?: {
    ip?: string;
    iat?: number;
    currency?: ICustomerBody["currency"];
    paymentInfo?: ICustomerBody["paymentInfo"];
    sessions?: ICustomerBody["sessions"];
  },
): ICustomerBody => {
  const customerBody: ICustomerBody = {
    id: sessionUser.id,
    email: sessionUser.email,
    ip: options?.ip,
    iat: options?.iat,
    currency: options?.currency || sessionUser.paymentData?.currency,
    paymentInfo: {
      customerId: sessionUser.id,
      ...(options?.paymentInfo || sessionUser.paymentData?.paymentInfo),
    },
    sessions: options?.sessions || sessionUser.paymentData?.sessions,
    toxic: sessionUser.paymentData?.toxic || false,
  };

  return customerBody;
};
