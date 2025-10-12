import { withWorkspace } from "@/lib/auth";
import { getQr } from "@/lib/api/qrs/get-qr";
import { prisma } from "@dub/prisma";
import { NextResponse } from "next/server";
import { verifyFolderAccess } from '@/lib/folder/permissions';

async function executeTinybirdDatasourceDelete(datasource: string, deleteCondition: string) {
  const url = `${process.env.TINYBIRD_API_URL}/v0/datasources/${datasource}/delete`;
  const body = new URLSearchParams({ delete_condition: deleteCondition });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tinybird delete failed: ${text || res.statusText}`);
  }

  return true;
}

// DELETE /api/qrs/[qrId]/analytics – remove all Tinybird analytics for a QR (by its link)
export const DELETE = withWorkspace(
  async ({ headers, params, workspace, session }) => {
    const qr = await getQr({ qrId: params.qrId });

    const linkId = qr.linkId || qr.link?.id;
    if (!linkId) {
      return NextResponse.json(
        { ok: false, message: "QR has no associated link." },
        { status: 400, headers },
      );
    }

    if (qr.link?.folderId) {
      await verifyFolderAccess({
        workspace,
        userId: session.user.id,
        folderId: qr.link.folderId,
        requiredPermission: "folders.links.write",
      });
    }

    const escapedLinkId = linkId.replace(/'/g, "''");
    const deleteCondition = `(link_id='${escapedLinkId}')`;

    await Promise.all([
      executeTinybirdDatasourceDelete("dub_click_events", deleteCondition),
      executeTinybirdDatasourceDelete("dub_lead_events", deleteCondition),
      executeTinybirdDatasourceDelete("dub_sale_events", deleteCondition),
    ]);

    await prisma.link.update({
      where: { id: linkId },
      data: {
        clicks: 0,
        leads: 0,
        sales: 0,
        saleAmount: 0,
      },
    });

    return NextResponse.json(
      {
        qr,
        ok: true,
        message: "Analytics cleared for QR",
      },
      { headers },
    );
  },
  { requiredPermissions: ["links.write"] },
);


