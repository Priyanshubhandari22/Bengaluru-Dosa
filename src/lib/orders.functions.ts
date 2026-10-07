import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeTotals, type Coupon } from "./pricing";
import { isPaymentAvailable } from "./payments";

async function loadCoupon(code: string): Promise<Coupon | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("coupons")
    .select("code,description,kind,value,min_subtotal,max_discount,first_order_only")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .maybeSingle();
  return (data as Coupon | null) ?? null;
}

async function checkCoupon(code: string, subtotal: number, userId: string, orderCount: number) {
  const c = await loadCoupon(code);
  if (!c) return { ok: false as const, error: "That coupon code isn't valid." };
  if (subtotal < c.min_subtotal)
    return { ok: false as const, error: `Add items worth ₹${c.min_subtotal} to use ${c.code}.` };
  if (c.first_order_only && orderCount > 0)
    return { ok: false as const, error: `${c.code} is only for your first order.` };
  void userId;
  return { ok: true as const, coupon: c };
}

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ code: z.string().min(1).max(30), subtotal: z.number().min(0) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("orders")
      .select("id", { count: "exact", head: true });
    return checkCoupon(data.code, data.subtotal, context.userId, count ?? 0);
  });

const lineSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(1).max(20),
  addonIds: z.array(z.string()).max(10),
  spice: z.enum(["mild", "medium", "hot"]),
  notes: z.string().max(200).optional(),
});

const orderSchema = z.object({
  lines: z.array(lineSchema).min(1).max(50),
  fulfilment: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]),
  couponCode: z.string().max(30).optional(),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    email: z.string().trim().email().max(120),
    address: z.string().trim().max(250).optional(),
    city: z.string().trim().max(60).optional(),
    pincode: z.string().trim().max(6).optional(),
  }),
  saveAddress: z.boolean().optional(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (!isPaymentAvailable(data.paymentMethod)) {
      return {
        ok: false as const,
        error: "Online payments aren't connected yet. Please choose Cash on Delivery.",
      };
    }
    if (data.fulfilment === "delivery") {
      const c = data.customer;
      if (!c.address || !c.city || !/^\d{6}$/.test(c.pincode ?? "")) {
        return {
          ok: false as const,
          error: "Please complete your delivery address and 6-digit pincode.",
        };
      }
    }
    const sb = context.supabase;
    const ids = [...new Set(data.lines.map((l: { itemId: string }) => l.itemId))];
    const [{ data: items }, { data: addons }] = await Promise.all([
      sb.from("menu_items").select("id,name,price,is_available,customizable").in("id", ids),
      sb.from("addons").select("id,name,price"),
    ]);
    const lines = [];
    let subtotal = 0;
    for (const l of data.lines) {
      const item = items?.find((i: { id: string }) => i.id === l.itemId);
      if (!item || !item.is_available)
        return { ok: false as const, error: "Some items are no longer available." };
      const chosen = item.customizable
        ? ((addons ?? []).filter((a: { id: string }) => l.addonIds.includes(a.id)) as Array<{
            id: string;
            name: string;
            price: number;
          }>)
        : [];
      const unit = item.price + chosen.reduce((s: number, a: { price: number }) => s + a.price, 0);
      subtotal += unit * l.quantity;
      lines.push({
        itemId: item.id,
        name: item.name,
        unitPrice: unit,
        quantity: l.quantity,
        addons: chosen.map((a) => a.name),
        spice: l.spice,
        notes: l.notes ?? "",
      });
    }

    let coupon: Coupon | null = null;
    if (data.couponCode) {
      const { count } = await sb.from("orders").select("id", { count: "exact", head: true });
      const r = await checkCoupon(data.couponCode, subtotal, context.userId, count ?? 0);
      if (!r.ok) return r;
      coupon = r.coupon;
    }
    const t = computeTotals(subtotal, data.fulfilment, coupon);
    const orderNumber = `BD${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: context.userId,
        fulfilment: data.fulfilment,
        payment_method: data.paymentMethod,
        payment_status: "pay_on_delivery",
        customer: data.customer,
        items: lines,
        subtotal: t.subtotal,
        discount: t.discount,
        delivery_fee: t.deliveryFee + t.packing,
        taxes: t.taxes,
        total: t.total,
        coupon_code: coupon?.code ?? null,
      })
      .select("id")
      .single();
    if (error || !order) {
      console.error(error);
      return { ok: false as const, error: "We couldn't place your order. Please try again." };
    }
    if (data.saveAddress && data.fulfilment === "delivery") {
      const { count } = await sb
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("line1", data.customer.address!);
      if (!count) {
        await sb.from("addresses").insert({
          user_id: context.userId,
          line1: data.customer.address!,
          city: data.customer.city!,
          pincode: data.customer.pincode!,
        });
      }
    }
    return { ok: true as const, orderId: order.id };
  });
