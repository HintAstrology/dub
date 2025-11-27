"use server";

import { prisma } from "@dub/prisma";
import { generateQRSVG } from "./generate-qr-svg";

export async function getMostScannedQr(userId: string) {
  const start = performance.now();

  const qr = await prisma.qr.findFirst({
    where: { userId },
    select: {
      id: true,
      data: true,
      qrType: true,
      title: true,
      styles: true,
      frameOptions: true,
      logoOptions: true,
      link: {
        select: {
          url: true,
          clicks: true,
          shortLink: true,
          domain: true,
          key: true,
        },
      },
    },
    orderBy: { link: { clicks: "desc" } },
  });
  const endLink = performance.now();
  console.log("performance 1", endLink - start);

  // Generate SVG string if QR exists
  let svgString: string | null = null;
  if (qr) {
    const svgStart = performance.now();
    svgString = await generateQRSVG(qr as any);
    const svgEnd = performance.now();
    console.log("performance SVG generation", svgEnd - svgStart);
  }

  return {
    ...qr,
    svgString,
  };
}
