import { TPaymentPlan } from 'core/integration/payment/config';

export type PricingPlan = {
  badge: string;
  title: string;
  plan: string;
  paymentPlan?: TPaymentPlan;
  planFeatures: string[];
  withButton?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    badge: "then $39.99/month",
    title: "7-Day Trial",
    plan: "$0.99/7 days",
    paymentPlan: "PRICE_TRIAL_MONTH_PLAN",
    planFeatures: [
      "Unlimited QR codes",
      "Advanced analytics",
      "Full customization",
    ],
    withButton: true,
  },
  // {
  //   badge: "Most Flexible",
  //   title: "Monthly",
  //   plan: "$39.99/month",
  //   planFeatures: [
  //     "Unlimited QR codes",
  //     "Advanced analytics",
  //     "Full customization",
  //   ],
  // },
  {
    badge: "Save 25%",
    title: "Quarterly",
    plan: "$29.99/month",
    paymentPlan: "PRICE_QUARTER_PLAN",
    planFeatures: [
      "Unlimited QR codes",
      "Advanced analytics",
      "Full customization",
    ],
    withButton: true,
  },
  {
    badge: "Save 50%",
    title: "Annual",
    plan: "$19.99/month",
    paymentPlan: "PRICE_YEAR_PLAN",
    planFeatures: [
      "Unlimited QR codes",
      "Advanced analytics",
      "Full customization",
    ],
    withButton: true,
  },
];
