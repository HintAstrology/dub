import { Options } from "qr-code-styling";
import { EQRType } from "./qr-type";

/**
 * Server response format - QR data from API
 * TQrServerData is the equivalent of TQrStorageData, but with client-side types for the constructor.
 */
export type TQrServerData = {
  id: string;
  data: string;
  qrType: EQRType;
  title: string;
  description?: string | null;
  archived?: boolean;
  styles: Options;
  frameOptions: {
    id: string;
    color?: string;
    textColor?: string;
    text?: string;
  };
  logoOptions?: {
    type: "suggested" | "uploaded";
    id?: string;
    fileId?: string;
  } | null;
  linkId: string;
  fileId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  file?: File;
  link: {
    url: string;
    key: string;
    domain: string;
    tagId?: string | null;
    webhookIds?: string[];
    shortLink?: string;
    clicks?: number;
  };
};
