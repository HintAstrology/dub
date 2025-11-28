import ApplePay from "@/ui/shared/icons/payments/apple-pay.tsx";
import GooglePay from "@/ui/shared/icons/payments/google-pay.tsx";
import MasterCard from "@/ui/shared/icons/payments/master-card.tsx";
import Paypal from "@/ui/shared/icons/payments/paypal.tsx";
import Visa from "@/ui/shared/icons/payments/visa.tsx";

const payments = [
  { icon: Visa, alt: "Visa" },
  { icon: MasterCard, alt: "MasterCard" },
  { icon: Paypal, alt: "PayPal" },
  { icon: ApplePay, alt: "Apple Pay" },
  { icon: GooglePay, alt: "Google Pay" },
];

export const Payments = () => (
  <div className="flex flex-wrap items-center gap-1.5">
    {payments.map(({ icon: Icon, alt }) => (
      <div
        key={alt}
        className="bg-white border border-border rounded-lg flex items-center justify-center p-2"
        aria-label={alt}
      >
        <Icon className="h-4" />
      </div>
    ))}
  </div>
);
