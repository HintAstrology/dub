import { NewQrProps } from "@/lib/types";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type";
import { prisma } from "@dub/prisma";
import { createId } from "../utils";

export async function createQr(
  {
    data,
    qrType,
    title,
    description,
    styles,
    frameOptions,
    logoOptions,
    fileId,
  }: NewQrProps | TQrServerData,
  url: string,
  linkId: string,
  userId: string | null,
) {

  const shouldStoreRawData =
    qrType === EQRType.WIFI || qrType === EQRType.VCARD;

  const qr = await prisma.qr.create({
    data: {
      id: createId({ prefix: "qr_" }),
      qrType,
      data: shouldStoreRawData ? data : url,
      title,
      description,
      styles: styles as any,
      frameOptions,
      logoOptions,
      linkId,
      userId,
      fileId,
    },
  });

  return qr;
}
