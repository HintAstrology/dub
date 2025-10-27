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
import { prisma } from "@dub/prisma";
import { LOCALHOST_IP, R2_URL } from "@dub/utils";
import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";

// GET /api/qrs – get all qrs for a workspace
export const GET = withWorkspace(
  async ({ headers, searchParams, workspace, session }) => {
    const startTime = performance.now();

    const params = getLinksQuerySchemaBase.parse(searchParams);

    const response = await getQrs(params, {
      includeFile: true,
    });

    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);

    console.log(`🚀 QR List API Performance: ${executionTime}ms`);
    console.log(`📊 Query params:`, params);
    console.log(`📈 Results count: ${response.length}`);

    return NextResponse.json(response, {
      headers: {
        ...headers,
        "X-Execution-Time": `${executionTime}ms`,
      },
    });
  },
  {
    requiredPermissions: ["links.read"],
  },
);

// POST /api/qrs – create a new qr
export const POST = withWorkspace(
  async ({ req, headers, session, workspace }) => {
    if (workspace) {
      throwIfLinksUsageExceeded(workspace);
    }

    if (session?.user?.id) {
      const { featuresAccess } = await checkFeaturesAccessAuthLess(
        session?.user?.id,
      );

      if (!featuresAccess) {
        throw new Error("Access denied: Account have not subscription.");
      }
    }

    const parsedReq = await parseRequestBody(req);
    const body = createQrBodySchema.parse(parsedReq);

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

    const linkData = {
      ...body.link,
      url: body.fileId ? `${R2_URL}/qrs-content/${body.fileId}` : body.link.url,
    };

    const { createdQr, createdLink } = await createQrWithLinkUniversal({
      qrData: body,
      linkData,
      workspace,
      userId: session?.user?.id,
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

    return NextResponse.json(
      { createdQr, createdLink },
      {
        headers,
      },
    );
  },
  {
    requiredPermissions: ["links.write"],
  },
);
