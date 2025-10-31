import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createAutoLoginURL } from "@/lib/auth/jwt-signin";
import { QR_TYPES } from "@/ui/qr-builder/constants/get-qr-config";
import { CUSTOMER_IO_TEMPLATES, sendEmail } from "@dub/email";
import { prisma } from "@dub/prisma";
import {
  ICreateSubscriptionBody,
  ICreateSubscriptionRes,
} from "core/api/user/subscription/subscription.interface.ts";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import {
  getChargePeriodDaysIdByPlan,
  getPaymentPlanPrice,
  TPaymentPlan,
} from "core/integration/payment/config";
import { PaymentService } from "core/integration/payment/server";
import { ECookieArg } from "core/interfaces/cookie.interface.ts";
import { CustomerIOClient } from "core/lib/customerio/customerio.config";
import {
  getUserCookieService,
  updateUserCookieService,
} from "core/services/cookie/user-session.service.ts";
import { getUserIp } from "core/util/user-ip.util.ts";
import { addDays, format } from "date-fns";

const getPeriod = (paymentPlan: string) => {
  const periodMap = {
    PRICE_MONTH_PLAN: "1 month",
    PRICE_QUARTER_PLAN: "3 months",
    PRICE_YEAR_PLAN: "12 months",
  };

  return periodMap[paymentPlan];
};

const trialPaymentPlan: TPaymentPlan = "PRICE_TRIAL_MONTH_PLAN";
const initialSubPaymentPlan: TPaymentPlan = "PRICE_MONTH_PLAN";

const paymentService = new PaymentService();

// create user subscription
export const POST = async (
  req: NextRequest,
): Promise<NextResponse<ICreateSubscriptionRes>> => {
  const { user } = await getUserCookieService();

  if (!user || !user?.email) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 400 },
    );
  }

  const body: ICreateSubscriptionBody = await req.json();

  if (!body.payment?.orderId || !body.payment?.id) {
    return NextResponse.json(
      { success: false, error: "Payment info not found" },
      { status: 400 },
    );
  }

  if (body?.first6Digits) {
    const riskData = await paymentService.checkClientCardRisk(
      body.first6Digits,
    );

    if (riskData?.type === "toxic") {
      await updateUserCookieService({ toxic: true });
    }
  }

  const updatedUser = await updateUserCookieService({
    currency: { currencyForPay: body.payment.currencyCode },
  });

  const { priceForPay: trialPrice, trialPeriodDays } = getPaymentPlanPrice({
    paymentPlan: trialPaymentPlan,
    user: {
      ...user,
      paymentInfo: {
        ...user?.paymentInfo,
        paymentMethodType: body.payment.paymentMethodType,
      },
    },
  });

  const { priceForPay: price } = getPaymentPlanPrice({
    paymentPlan: initialSubPaymentPlan,
    user: {
      ...user,
      paymentInfo: {
        ...user?.paymentInfo,
        paymentMethodType: body.payment.paymentMethodType,
      },
    },
  });

  const period = getChargePeriodDaysIdByPlan({
    paymentPlan: initialSubPaymentPlan,
    user,
  });

  const headerStore = headers();
  const cookieStore = cookies();

  const metadata: { [key: string]: string | number | null } = {
    ...body.metadata,
    ...body.payment,

    //**** antifraud sessions ****//
    ...user.sessions,

    //**** for analytics ****//
    email: user!.email!,
    flow_type: "internal",
    locale: "en",
    mixpanel_user_id:
      user.id || cookieStore.get(ECookieArg.SESSION_ID)?.value || null,
    plan_name: initialSubPaymentPlan,
    plan_price: price,
    charge_period_days: period,
    payment_subtype: "SUBSCRIPTION",
    //**** for analytics ****//

    //**** fields for subscription system ****//
    sub_user_id_primer: user?.paymentInfo?.customerId || null,
    sub_order_country: updatedUser.currency?.countryCode || null,
    ipAddress: getUserIp(headerStore)!,
    subscriptionType: `APP_SUBSCRIPTION`,
    application: `${process.env.NEXT_PUBLIC_PAYMENT_ENV}`,
    //**** fields for subscription system ****//
  };

  try {
    const createSubscriptionBody = {
      user: {
        email: user.email || "",
        country: user.currency?.countryCode || "",
        externalId: user.paymentInfo?.customerId || "",
        nationalDocumentId: body?.nationalDocumentId,
        attributes: { ...metadata },
      },
      subscription: {
        plan: {
          currencyCode: user.currency?.currencyForPay || "",
          trialPrice: trialPrice,
          trialPeriodDays,
          price,
          chargePeriodDays: period,
          secondary: false,
          twoSteps: false,
        },
        attributes: {
          ...metadata,
          // billing_action: "rebill"
        },
      },
      orderAmount: price,
      orderCurrencyCode: user.currency?.currencyForPay || "",
      orderPaymentID: body.payment.id,
      orderExternalID: body.payment.orderId,
    };

    const { tokenOnboardingData, paymentMethodToken } =
      await paymentService.createClientSubscription(createSubscriptionBody);

    if (
      !tokenOnboardingData ||
      !tokenOnboardingData.subscription ||
      !tokenOnboardingData.subscription.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create subscription: invalid response from payment system",
        },
        { status: 500 },
      );
    }

    await CustomerIOClient.track(user.id, {
      name: EAnalyticEvents.TRIAL_ACTIVATED,
      email: user?.email,
    });

    const updatedUser = await updateUserCookieService({
      paymentInfo: {
        ...user.paymentInfo,
        paymentMethodToken,
        subscriptionId: tokenOnboardingData.subscription.id,
        subscriptionPlanCode: initialSubPaymentPlan,
        paymentType: body.payment.paymentType,
        paymentMethodType: body.payment.paymentMethodType,
        paymentProcessor: body.payment.paymentProcessor,
        nationalDocumentId: body?.nationalDocumentId,
      },
      sessions: {
        ...user.sessions,
      },
    });

    const clonedUser = structuredClone(updatedUser);

    delete clonedUser?.paymentInfo?.clientToken;
    delete clonedUser?.paymentInfo?.clientTokenExpirationDate;

    const firstQr = await prisma.qr.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        qrType: true,
      },
    });

    const loginUrl = await createAutoLoginURL(user.id, `/?qrId=${firstQr?.id}`);

    await Promise.all([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          paymentData: {
            toxic: user.toxic || false,
            paymentInfo: clonedUser.paymentInfo,
            currency: updatedUser.currency,
            sessions: updatedUser.sessions,
          },
        },
      }),
      firstQr
        ? await sendEmail({
            email: user!.email!,
            subject: "Welcome to GetQR",
            template: CUSTOMER_IO_TEMPLATES.WELCOME_TRIAL,
            messageData: {
              // period: getPeriod(initialSubPaymentPlan),
              // price: (price / 100).toFixed(2),
              // currency: user.currency?.currencyForPay as string,
              // next_billing_date: format(
              //   addDays(new Date(), period),
              //   "yyyy-MM-dd",
              // ),
              trial_price: (trialPrice / 100).toFixed(2),
              currency_symbol: user.currency?.currencyForPay as string,
              trial_period: trialPeriodDays.toString(),
              trial_end_date: format(
                addDays(new Date(), trialPeriodDays),
                "yyyy-MM-dd",
              ),
              price: (price / 100).toFixed(2),
              period: period.toString(),
              qr_name: firstQr?.title || "Untitled QR",
              qr_type:
                QR_TYPES.find((item) => item.id === firstQr?.qrType)!.label ||
                "Undefined type",
              url: loginUrl,
            },
            customerId: user.id,
          })
        : sendEmail({
            email: user!.email!,
            subject: "Welcome to GetQR",
            template: CUSTOMER_IO_TEMPLATES.GOOGLE_WELCOME_EMAIL,
            messageData: {
              trial_price: (trialPrice / 100).toFixed(2),
              currency_symbol: user.currency?.currencyForPay as string,
              trial_period: trialPeriodDays.toString(),
              trial_end_date: format(
                addDays(new Date(), trialPeriodDays),
                "yyyy-MM-dd",
              ),
              price: (price / 100).toFixed(2),
              period: period.toString(),
              url: loginUrl,
            },
            customerId: user.id,
          }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: tokenOnboardingData.subscription.id,
        toxic: user?.toxic || false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message, code: error.code },
      { status: 500 },
    );
  }
};
