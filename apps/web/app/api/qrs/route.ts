import { checkFeaturesAccessAuthLess } from "@/lib/actions/check-features-access-auth-less.ts";
import { DubApiError } from "@/lib/api/errors";
import { throwIfLinksUsageExceeded } from "@/lib/api/links/usage-checks";
import { createQrWithLinkUniversal } from "@/lib/api/qrs/create-qr-with-link-universal";
import { getQrs } from "@/lib/api/qrs/get-qrs";
import { parseRequestBody } from "@/lib/api/utils";
import { withWorkspace } from "@/lib/auth";
import { ratelimit } from "@/lib/upstash";
import { sendWorkspaceWebhook } from "@/lib/webhook/publish";
import {
  getLinksQuerySchemaBase,
  linkEventSchema,
} from "@/lib/zod/schemas/links";
import { createQrBodySchema } from "@/lib/zod/schemas/qrs";
import { HOME_DOMAIN, LOCALHOST_IP, R2_URL } from "@dub/utils";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@dub/prisma";
import { CUSTOMER_IO_TEMPLATES, sendEmail } from '@dub/email';

// POST /api/qrs – create a new qr
export const POST = withWorkspace(
  async ({ req, headers, session, workspace }) => {
    if (workspace) {
      throwIfLinksUsageExceeded(workspace);
    }

    // TODO: CHECK
    if (session?.user?.id) {
      const { featuresAccess } = await checkFeaturesAccessAuthLess(
        session?.user?.id,
      );

      if (!featuresAccess) {
        throw new Error("Access denied: Account have not subscription.");
      }
    }

    console.log("here create qr");

    const body = createQrBodySchema.parse(await parseRequestBody(req));
    console.log("POST /api/qrs body:", body);
    if (!session) {
      const ip = req.headers.get("x-forwarded-for") || LOCALHOST_IP;
      const { success } = await ratelimit(10, "1 d").limit(ip);

      if (!success) {
        throw new DubApiError({
          code: "rate_limit_exceeded",
          message:
            "Rate limited – you can only create up to 10 links per day without an account.",
        });
      }
    }

    const fileId = crypto.randomUUID();

    const linkData = {
      ...body.link,
      url: body.file ? `${R2_URL}/qrs-content/${fileId}` : body.link.url,
    };

    const { createdQr } = await createQrWithLinkUniversal({
      qrData: body,
      linkData,
      workspace,
      userId: session?.user?.id,
      fileId,
      onLinkCreated: async (createdLink) => {
        if (createdLink.projectId && createdLink.userId) {
          waitUntil(
            sendWorkspaceWebhook({
              trigger: "link.created",
              workspace,
              data: linkEventSchema.parse(createdLink),
            }),
          );
        }
      },
    });

    const existingQrCount = await prisma.qr.count({
      where: {
        userId: session.user.id,
      },
    });

    if (existingQrCount === 1) {
      // const referer = req.headers.get('referer') || req.headers.get('referrer');
      // const origin = new URL(referer || '').origin;
      await sendEmail({
        email: session?.user?.email,
        subject: "Welcome to GetQR",
        template: CUSTOMER_IO_TEMPLATES.WELCOME_EMAIL,
        messageData: {
          qr_name: createdQr.title || "Untitled QR",
          qr_type: createdQr.qrType,
          url: HOME_DOMAIN,
        },
      });
    }

    return NextResponse.json(createdQr, {
      headers,
    });
  },
  {
    requiredPermissions: ["links.write"],
  },
);

// GET /api/qrs – get all qrs for a workspace
export const GET = withWorkspace(
  async ({ headers, searchParams, workspace, session }) => {
    const params = getLinksQuerySchemaBase.parse(searchParams);

    const response = await getQrs(params);

    return NextResponse.json(response, {
      headers,
    });
  },
  {
    requiredPermissions: ["links.read"],
  },
);
