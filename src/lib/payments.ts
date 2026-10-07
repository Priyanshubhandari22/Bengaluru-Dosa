// Payment provider abstraction. Only Cash on Delivery is live; online methods
// are wired to this interface so a real gateway (e.g. Razorpay) can drop in.

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export type PaymentProvider = {
  id: PaymentMethod;
  label: string;
  available: boolean;
  note: string;
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  { id: "upi", label: "UPI", available: false, note: "GPay, PhonePe, Paytm — coming soon" },
  {
    id: "card",
    label: "Credit / Debit Card",
    available: false,
    note: "Visa, Mastercard, RuPay — coming soon",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    available: false,
    note: "All major banks — coming soon",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    available: true,
    note: "Pay with cash or UPI at your door",
  },
];

export const isPaymentAvailable = (m: PaymentMethod) =>
  PAYMENT_PROVIDERS.find((p) => p.id === m)?.available ?? false;
