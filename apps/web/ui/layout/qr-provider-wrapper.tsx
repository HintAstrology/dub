"use client";

import { QrCodesDisplayProvider } from "@/ui/qr-code/qr-codes-display-provider";
import { ReactNode } from "react";

interface QRProviderWrapperProps {
  children: ReactNode;
}

export function QRProviderWrapper({ children }: QRProviderWrapperProps) {
  return <QrCodesDisplayProvider>{children}</QrCodesDisplayProvider>;
}

