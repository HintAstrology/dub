import z from "@/lib/zod";
import { getLinksQuerySchemaBase } from "@/lib/zod/schemas/links";
import { prisma } from "@dub/prisma";

export async function getQrs({
  search,
  sort, // Deprecated
  sortBy,
  sortOrder,
  page,
  pageSize,
  userId,
}: z.infer<typeof getLinksQuerySchemaBase>) {
  // support legacy sort param
  if (sort && sort !== "createdAt") {
    sortBy = sort;
  }

  const qrs = await prisma.qr.findMany({
    where: {
      ...(search && {
        OR: [
          {
            data: { contains: search },
          },
          {
            title: { contains: search },
          },
        ],
      }),
      ...(userId && { userId }),
    },
    include: {
      user: true,
      link: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  return qrs;
}
