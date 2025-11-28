"use client";

import { createContext, useContext } from "react";
import { IQrBuilderContextType } from "../types/context";

// Create context
export const QrBuilderContext = createContext<
  IQrBuilderContextType | undefined
>(undefined);

// Custom hook to use the context
export function useQrBuilderContext(): IQrBuilderContextType {
  const context = useContext(QrBuilderContext);

  if (context === undefined) {
    throw new Error("useQrBuilder must be used within a QrBuilderProvider");
  }

  return context;
}
