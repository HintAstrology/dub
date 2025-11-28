import { z } from "zod";

export const qrNameSchema = z.object({
  qrName: z
    .string()
    .optional()
    .transform((val) => (!val || val?.trim() === "" ? "My QR Code" : val)),
});

// Enhanced URL validation with regex
// Supports: http(s)://, www., subdomains, ports, paths, query params, fragments
const URL_REGEX =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

export const websiteUrlSchema = z
  .string()
  .min(1, "Website URL is required")
  .regex(URL_REGEX, "Please enter a valid URL (e.g., https://example.com)")
  .refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        // Check that protocol is http or https
        if (!["http:", "https:"].includes(urlObj.protocol)) {
          return false;
        }

        // Check for multiple consecutive slashes in pathname (except //)
        if (urlObj.pathname.includes("//")) {
          return false;
        }

        // Check for trailing slashes repeated multiple times
        if (/\/{3,}$/.test(url)) {
          return false;
        }

        // Check hostname is valid (no trailing dots, proper structure)
        const hostname = urlObj.hostname;
        if (hostname.startsWith(".") || hostname.endsWith(".")) {
          return false;
        }

        // Check for valid TLD (2-6 chars, but realistic domains)
        const parts = hostname.split(".");
        if (parts.length < 2) {
          return false;
        }

        const tld = parts[parts.length - 1];
        if (tld.length < 2 || tld.length > 6) {
          return false;
        }

        // Check for overly nested subdomains (more than 3 levels is suspicious)
        // Examples: example.com (2), sub.example.com (3), api.sub.example.com (4)
        if (parts.length > 4) {
          return false;
        }

        // Check each part has reasonable length (1-63 chars per RFC 1035)
        if (parts.some((part) => part.length === 0 || part.length > 63)) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid URL" },
  );

export const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number");

export const fileSchema = z.object({
  size: z.number().max(50 * 1024 * 1024, "File size must be less than 50MB"),
  name: z.string().min(1, "File name is required"),
  type: z.string().min(1, "File type is required"),
});

export const wifiPasswordSchema = z
  .string()
  .min(8, "WiFi password must be at least 8 characters")
  .optional()
  .or(z.literal(""));

export const wifiNetworkNameSchema = z
  .string()
  .min(1, "Network name is required")
  .max(32, "Network name must be less than 32 characters");
