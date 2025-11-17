import { ANALYTICS_QR_TYPES_DATA } from "../qr-builder-new/constants/get-qr-config";
import { COUNTRIES, nFormatter } from "@dub/utils";

export interface DashboardStats {
  totalClicks: number;
  uniqueClicks: number;
  totalClicksChange: number | null;
  uniqueClicksChange: number | null;
  comparisonPeriod: string | null;
  topDevice: { name: string; value: number; percentage: number } | null;
  topBrowser: { name: string; value: number; percentage: number } | null;
  topOS: { name: string; value: number; percentage: number } | null;
  topCountry: { name: string; value: number; percentage: number } | null;
  topQrType: { name: string; value: number; percentage: number } | null;
  topLink: { name: string; value: number } | null;
}

export interface PercentageChange {
  text: string;
  isPositive: boolean;
}

/**
 * Format percentage change for display
 */
export function formatPercentageChange(
  change: number | null
): PercentageChange | null {
  if (change === null) return null;
  const isPositive = change >= 0;
  const sign = isPositive ? "+" : "";
  return {
    text: `${sign}${change}%`,
    isPositive,
  };
}

/**
 * Get QR type label from QR type ID
 */
export function getQrTypeLabel(qrTypeId: string | undefined): string {
  if (!qrTypeId) return "-";
  return (
    ANALYTICS_QR_TYPES_DATA.find((type) => type.id === qrTypeId)?.label ||
    qrTypeId
  );
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string | undefined): string {
  if (!countryCode) return "-";
  return COUNTRIES[countryCode] || countryCode;
}

/**
 * Format stat value for display
 */
export function formatStatValue(
  value: number | undefined | null,
  full: boolean = false
): string {
  if (value === undefined || value === null) return "0";
  return nFormatter(value, { full });
}

/**
 * Format stat change for non-numeric stats (percentage or scans)
 */
export function formatStatChange(
  percentage: number | undefined,
  value?: number
): string {
  if (value !== undefined) {
    return `${nFormatter(value)} scans`;
  }
  if (percentage !== undefined) {
    return `${percentage}%`;
  }
  return "0%";
}

