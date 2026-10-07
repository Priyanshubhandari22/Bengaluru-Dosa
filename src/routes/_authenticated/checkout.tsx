import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bike, Store, Tag, Lock, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, lineUnitPrice } from "@/lib/cart";
import { computeTotals, formatINR, type Coupon, type Fulfilment } from "@/lib/pricing";
import { PAYMENT_PROVIDERS, type PaymentMethod } from "@/lib/payments";
import { placeOrder, validateCoupon } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { EmptyCart, Row } from "@/components/site/CartDrawer";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Enter delivery details, apply coupons and place your dosa order.",
      },
      { property: "og:title", content: "Checkout — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Complete your Avighna Bengaluru Dosa order." },
    ],
  }),
  component: Checkout,
});

const field =
  "mt-1 h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none focus:border-primary aria-[invalid=true]:border-destructive";

function Checkout() {
  const { user } = Route.useRouteContext();
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const place = useServerFn(placeOrder);
  const checkCoupon = useServerFn(validateCoupon);

  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [form, setForm] = useState({
    name: (user.user_metadata?.["full_name"] as string) ?? "",
    phone: (user.user_metadata?.["phone"] as string) ?? "",
    email: user.email ?? "",
    address: "",
    city: "Dehradun",
    pincode: "",
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "phone" | "email" | "address" | "city" | "pincode", string>>
  >({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });

  const { data: addresses } = useQuery({
    queryKey: ["addresses", user.id],
    queryFn: async () =>
      (await supabase.from("addresses").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });
  useEffect(() => {
    if (addresses?.[0] && !form.address)
      setForm((f) => ({
        ...f,
        address: addresses[0]!.line1,
        city: addresses[0]!.city,
        pincode: addresses[0]!.pincode,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  // Drop coupon if subtotal falls under its minimum
  useEffect(() => {
    if (coupon && subtotal < coupon.min_subtotal) {
      setCoupon(null);
      setCouponErr(`${coupon.code} removed — order is below ₹${coupon.min_subtotal}.`);
    }
  }, [subtotal, coupon]);

  if (lines.length === 0)
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Checkout" />
        <div className="container-x py-10">
          <EmptyCart />
        </div>
      </>
    );

  const t = computeTotals(subtotal, fulfilment, coupon);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setChecking(true);
    setCouponErr("");
    try {
      const r = await checkCoupon({ data: { code: couponInput, subtotal } });
      if (r.ok) {
        setCoupon(r.coupon);
        toast.success(`${r.coupon.code} applied!`);
      } else setCouponErr(r.error);
    } catch {
      setCouponErr("Couldn't check that coupon. Please try again.");
    }
    setChecking(false);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (fulfilment === "delivery") {
      if (form.address.trim().length < 5) e.address = "Enter your full address";
      if (!form.city.trim()) e.city = "Enter your city";
      if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a 6-digit pincode";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitErr("");
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      const r = await place({
        data: {
          lines: lines.map((l) => ({
            itemId: l.itemId,
            quantity: l.quantity,
            addonIds: l.addons.map((a) => a.id),
            spice: l.spice,
            notes: l.notes || undefined,
          })),
          fulfilment,
          paymentMethod: payment,
          couponCode: coupon?.code,
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            ...(fulfilment === "delivery"
              ? { address: form.address, city: form.city, pincode: form.pincode }
              : {}),
          },
          saveAddress,
        },
      });
      if (!r.ok) {
        setSubmitErr(r.error);
        setSubmitting(false);
        return;
      }
      clear();
      navigate({ to: "/order/$id", params: { id: r.orderId }, replace: true });
    } catch (err) {
      console.error(err);
      setSubmitErr("We couldn't reach the kitchen. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  const err = (k: keyof typeof errors) =>
    errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  return (
    <>
      <PageHeader eyebrow="Almost there" title="Checkout" />
      <form
        onSubmit={submit}
        noValidate
        className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_400px]"
      >
        <div className="space-y-6">
          <Card title="1. How would you like it?">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["delivery", "Home delivery", Bike, "30–40 min"],
                  ["pickup", "Pickup", Store, "Ready in 15 min"],
                ] as const
              ).map(([v, l, I, s]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setFulfilment(v)}
                  aria-pressed={fulfilment === v}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${fulfilment === v ? "border-primary bg-secondary" : "border-border"}`}
                >
                  <I className="h-6 w-6 text-primary" />
                  <span>
                    <span className="block font-bold">{l}</span>
                    <span className="text-xs text-muted-foreground">{s}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="2. Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Full name
                <input
                  className={field}
                  value={form.name}
                  onChange={set("name")}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                />
                {err("name")}
              </label>
              <label className="text-sm font-semibold">
                Phone number
                <input
                  className={field}
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  aria-invalid={!!errors.phone}
                />
                {err("phone")}
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Email
                <input
                  className={field}
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
                {err("email")}
              </label>
              {fulfilment === "delivery" && (
                <>
                  {addresses && addresses.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      {addresses.map((a) => (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              address: a.line1,
                              city: a.city,
                              pincode: a.pincode,
                            }))
                          }
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary"
                        >
                          {a.label}: {a.line1.slice(0, 28)}
                        </button>
                      ))}
                    </div>
                  )}
                  <label className="text-sm font-semibold sm:col-span-2">
                    Delivery address
                    <input
                      className={field}
                      value={form.address}
                      onChange={set("address")}
                      autoComplete="street-address"
                      placeholder="House no, street, area"
                      aria-invalid={!!errors.address}
                    />
                    {err("address")}
                  </label>
                  <label className="text-sm font-semibold">
                    City
                    <input
                      className={field}
                      value={form.city}
                      onChange={set("city")}
                      autoComplete="address-level2"
                      aria-invalid={!!errors.city}
                    />
                    {err("city")}
                  </label>
                  <label className="text-sm font-semibold">
                    Pincode
                    <input
                      className={field}
                      value={form.pincode}
                      onChange={set("pincode")}
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="postal-code"
                      aria-invalid={!!errors.pincode}
                    />
                    {err("pincode")}
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    Save this address for next time
                  </label>
                </>
              )}
            </div>
          </Card>

          <Card title="3. Payment">
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {PAYMENT_PROVIDERS.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border-2 transition ${payment === p.id ? "border-primary bg-secondary/50" : "border-border"}`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={payment === p.id}
                    onClick={() => setPayment(p.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border-2 ${payment === p.id ? "border-primary bg-primary" : "border-border"}`}
                    >
                      {payment === p.id && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold">{p.label}</span>
                      <span className="text-xs text-muted-foreground">{p.note}</span>
                    </span>
                    {!p.available && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </button>
                  {payment === p.id && p.id === "upi" && (
                    <div className="space-y-3 px-4 pb-4">
                      <div className="flex gap-2">
                        {["GPay", "PhonePe", "Paytm"].map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                      <label className="block text-sm font-semibold">
                        UPI ID
                        <input
                          className={field}
                          value={upi}
                          onChange={(e) => setUpi(e.target.value)}
                          placeholder="name@okbank"
                        />
                      </label>
                    </div>
                  )}
                  {payment === p.id && p.id === "card" && (
                    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                      <label className="col-span-2 text-sm font-semibold">
                        Card number
                        <input
                          className={field}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={card.number}
                          onChange={(e) =>
                            setCard({
                              ...card,
                              number: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 16)
                                .replace(/(.{4})/g, "$1 ")
                                .trim(),
                            })
                          }
                          placeholder="1234 5678 9012 3456"
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        Expiry
                        <input
                          className={field}
                          autoComplete="cc-exp"
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value.slice(0, 5) })}
                          placeholder="MM/YY"
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        CVV
                        <input
                          className={field}
                          type="password"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          value={card.cvv}
                          onChange={(e) =>
                            setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })
                          }
                        />
                      </label>
                    </div>
                  )}
                  {payment === p.id && p.id === "netbanking" && (
                    <div className="px-4 pb-4">
                      <select className={field} aria-label="Choose your bank">
                        <option>SBI</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak</option>
                      </select>
                    </div>
                  )}
                  {payment === p.id && !p.available && (
                    <p className="flex items-start gap-2 px-4 pb-4 text-xs text-muted-foreground">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Online payments are not connected yet, so no money will be charged. Please
                      choose Cash on Delivery to place your order.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="max-h-60 space-y-3 overflow-y-auto text-sm">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span>
                  <span className="font-semibold">
                    {l.quantity} × {l.name}
                  </span>
                  {l.addons.length > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      + {l.addons.map((a) => a.name).join(", ")}
                    </span>
                  )}
                </span>
                <span className="font-semibold">{formatINR(lineUnitPrice(l) * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div>
            <div className="flex gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Coupon code</span>
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="DOSA10"
                  disabled={!!coupon}
                  className="h-11 w-full rounded-full border border-input bg-background pl-9 pr-3 font-mono text-sm uppercase outline-none focus:border-primary"
                />
              </label>
              {coupon ? (
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="h-11 rounded-full border border-border px-4 text-sm font-semibold"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={checking}
                  className="h-11 rounded-full bg-ink px-4 text-sm font-semibold text-ink-foreground"
                >
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </button>
              )}
            </div>
            {couponErr && <p className="mt-2 text-xs text-destructive">{couponErr}</p>}
            {coupon && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-semibold text-leaf"
              >
                {coupon.code}: {coupon.description}
              </motion.p>
            )}
          </div>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Item subtotal" value={formatINR(t.subtotal)} />
            {t.discount > 0 && (
              <Row
                accent
                label={`Discount (${coupon?.code})`}
                value={`− ${formatINR(t.discount)}`}
              />
            )}
            <Row
              label="Delivery fee"
              value={
                fulfilment === "pickup"
                  ? "Pickup"
                  : t.deliveryFee
                    ? formatINR(t.deliveryFee)
                    : "Free"
              }
            />
            <Row label="Packing" value={formatINR(t.packing)} />
            <Row label="GST (5%)" value={formatINR(t.taxes)} />
            <div className="flex justify-between border-t border-border pt-3 text-lg font-extrabold">
              <span>Grand total</span>
              <span>{formatINR(t.total)}</span>
            </div>
          </div>
          {submitErr && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {submitErr}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-saffron text-lg font-bold text-primary-foreground shadow-soft disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Placing order…
              </>
            ) : payment === "cod" ? (
              `Place order · ${formatINR(t.total)}`
            ) : (
              `Pay ${formatINR(t.total)}`
            )}
          </button>
          <Link
            to="/cart"
            className="block text-center text-sm font-semibold text-muted-foreground"
          >
            Back to cart
          </Link>
        </aside>
      </form>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="mb-4 font-display text-xl">{title}</h2>
      {children}
    </section>
  );
}
