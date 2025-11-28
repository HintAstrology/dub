"use server";

import { redis } from "@/lib/upstash";
import { createQrBodySchema } from "@/lib/zod/schemas/qrs";
import { ERedisArg } from "core/interfaces/redis.interface.ts";
import z from "../../zod";
import { actionClient } from "../safe-action";

// schema for qr data
const schema = z.object({
  sessionId: z.string(),
  extraKey: z.string().optional().describe("Extra key to identify the data"),
  qrData: createQrBodySchema,
});

// save qr data to redis in background
export const saveQrDataToRedisAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { sessionId, qrData, extraKey } = parsedInput;

    const key = `${ERedisArg.QR_DATA_REG}:${sessionId}${extraKey ? `:${extraKey}` : ""}`;
    console.log("saveQrDataToRedisAction key", key);

    await redis
      .set(key, JSON.stringify(qrData), {
        ex: 60 * 60 * 24 * 10, // 10 days
      })
      .catch((error) => {
        console.error("Error saving QR data to redis in background:", error);
      });

    return { success: true };
  });
