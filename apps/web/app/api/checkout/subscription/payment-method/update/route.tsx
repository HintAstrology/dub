import { checkFeaturesAccessAuthLess } from "@/lib/actions/check-features-access-auth-less";
import { prisma } from "@dub/prisma";
import { IUpdateSubscriptionPaymentMethodBody } from "core/api/user/subscription/subscription.interface";
import { ICustomerBody } from "core/integration/payment/config";
import {
  getPrimerPaymentInfo,
  getPrimerPaymentMethodToken,
  PaymentService,
} from "core/integration/payment/server";
import { IDataRes } from "core/interfaces/common.interface";
import {
  getUserCookieService,
  updateUserCookieService,
} from "core/services/cookie/user-session.service";
import { NextRequest, NextResponse } from "next/server";

const paymentService = new PaymentService();

// update payment method
export async function POST(
  request: NextRequest,
): Promise<NextResponse<IDataRes>> {
  const body: IUpdateSubscriptionPaymentMethodBody = await request.json();

  const { user } = await getUserCookieService();

  if (!body || !body.customerId) {
    return NextResponse.json(
      { success: false, error: "User not found by customerId" },
      { status: 400 },
    );
  }

  if (!body || !body.email) {
    return NextResponse.json(
      { success: false, error: "User not found by email" },
      { status: 400 },
    );
  }

  if (!body.payment?.orderId || !body.payment?.id) {
    return NextResponse.json(
      { success: false, error: "Payment info not found" },
      { status: 400 },
    );
  }

  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 400 },
    );
  }

  let riskData;
  if (body?.first6Digits) {
    riskData = await paymentService.checkClientCardRisk(body.first6Digits);
  }

  try {
    const userDataFromDB = await prisma.user.findFirst({
      where: {
        email: body!.email!.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        paymentData: true,
      },
    });

    if (!userDataFromDB) {
      return NextResponse.json(
        { success: false, error: "User not found by email" },
        { status: 400 },
      );
    }

    const paymentData = userDataFromDB.paymentData as unknown as ICustomerBody;

    const featuresAccess = await checkFeaturesAccessAuthLess(userDataFromDB.id);

    const paymentInfo = await getPrimerPaymentInfo({
      paymentId: body.payment.id,
    });
    const lastAddedToken = await getPrimerPaymentMethodToken({
      customerId: body.customerId,
    })!;

    const paymentMethodToken =
      paymentInfo?.paymentMethod?.paymentMethodToken ?? lastAddedToken;

    await paymentService.updateClientPaymentMethod({
      orderExternalID: body.payment.orderId,
      orderPaymentID: body.payment.id,
      subscriptionId: featuresAccess.subscriptionId!,
      paymentMethodToken,
    });

    const newPaymentInfo = {
      ...paymentData,
      currency: {
        ...paymentData?.currency,
        currencyForPay: body.payment.currencyCode,
      },
      toxic: riskData?.type === "toxic",
      paymentInfo: {
        ...paymentData?.paymentInfo,
        customerId: userDataFromDB.id,
        paymentMethodToken,
        subscriptionId: featuresAccess.subscriptionId!,
        paymentType: body.payment.paymentType,
        paymentMethodType: body.payment.paymentMethodType,
        paymentProcessor: body.payment.paymentProcessor,
        nationalDocumentId: body?.nationalDocumentId,
      },
    };

    await prisma.user.update({
      where: {
        email: userDataFromDB.email!,
      },
      data: {
        paymentData: newPaymentInfo,
      },
    });

    await updateUserCookieService({
      ...newPaymentInfo,
    });

    return NextResponse.json({
      success: true,
      data: { toxic: riskData?.type === "toxic" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 },
    );
  }
}
