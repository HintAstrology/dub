"use server";

import { redis } from "@/lib/upstash";
import { ERedisArg } from "core/interfaces/redis.interface.ts";

// get qr data from redis by sessionId
export const getQrDataFromRedis = async (
  sessionId: string,
  extraKey?: string,
) => {
  try {
    const key = `${ERedisArg.QR_DATA_REG}:${sessionId}${extraKey ? `:${extraKey}` : ""}`;

    const data = await redis.get(key);

    if (!data) {
      return { success: true, qrData: null };
    }

    return { success: true, qrData: data };
  } catch (error) {
    console.error("Error getting QR data from redis:", error);
    return { success: false, qrData: null };
  }
};
