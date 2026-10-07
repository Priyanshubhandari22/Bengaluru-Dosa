// Pure pricing rules shared by the browser (display) and the server (authoritative totals).

export const TAX_RATE = 0.05; // GST on restaurant food
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_ABOVE = 499;
export const PACKING_FEE = 10;

export type Coupon = {
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  min_subtotal: number;
  max_discount: number | null;
  first_order_only: boolean;
};

export type Fulfilment = "delivery" | "pickup";

export function couponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon || subtotal < coupon.min_subtotal) return 0;
  let d = coupon.kind === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.max_discount != null) d = Math.min(d, coupon.max_discount);
  return Math.min(d, subtotal);
}

export function computeTotals(subtotal: number, fulfilment: Fulfilment, coupon: Coupon | null) {
  const discount = couponDiscount(coupon, subtotal);
  const afterDiscount = subtotal - discount;
  const deliveryFee =
    subtotal === 0 || fulfilment === "pickup" || afterDiscount >= FREE_DELIVERY_ABOVE
      ? 0
      : DELIVERY_FEE;
  const packing = subtotal === 0 ? 0 : PACKING_FEE;
  const taxes = Math.round(afterDiscount * TAX_RATE);
  const total = afterDiscount + deliveryFee + packing + taxes;
  return { subtotal, discount, deliveryFee, packing, taxes, total };
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
