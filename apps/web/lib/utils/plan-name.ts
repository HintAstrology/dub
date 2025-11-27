/**
 * Converts plan name to a readable billing period string
 * @param planName - The plan name from subscription attributes (e.g., "PRICE_MONTH_PLAN", "PRICE_YEAR_PLAN", "PRICE_QUARTER_PLAN")
 * @returns A readable string like "Monthly", "Annual", "Quarter" or the original planName if not recognized
 */
export function formatPlanName(planName: string | null): string {
  if (!planName) return "";

  const planNameUpper = planName.toUpperCase();

  // Check for monthly plans (PRICE_MONTH_PLAN, MONTH, MONTHLY)
  if (
    planNameUpper.includes("PRICE_MONTH") ||
    planNameUpper.includes("MONTH") ||
    planNameUpper.includes("MONTHLY")
  ) {
    return "Monthly";
  }

  // Check for annual/yearly plans (PRICE_YEAR_PLAN, YEAR, YEARLY, ANNUAL)
  if (
    planNameUpper.includes("PRICE_YEAR") ||
    planNameUpper.includes("YEAR") ||
    planNameUpper.includes("YEARLY") ||
    planNameUpper.includes("ANNUAL")
  ) {
    return "Annual";
  }

  // Check for quarterly plans (PRICE_QUARTER_PLAN, QUARTER, QUARTERLY, SEMESTER)
  if (
    planNameUpper.includes("PRICE_QUARTER") ||
    planNameUpper.includes("QUARTER") ||
    planNameUpper.includes("QUARTERLY") ||
    planNameUpper.includes("SEMESTER")
  ) {
    return "Quarter";
  }

  // Return original if not recognized
  return planName;
}

