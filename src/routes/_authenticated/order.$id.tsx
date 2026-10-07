import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STEPS, type OrderLine } from "@/lib/orders";
import { formatINR } from "@/lib/pricing";
import { Row } from "@/components/site/CartDrawer";

export const Route = createFileRoute("/_authenticated/order/$id")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Avighna Bengaluru Dosa" },
      { name: "description", content: "Your Avighna Bengaluru Dosa order status and receipt." },
      { property: "og:title", content: "Order confirmed — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Track your dosa order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });

  if (isLoading)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (error || !order)
    return (
      <div className="container-x py-20 text-center">
        <p className="font-display text-2xl">We couldn't find that order</p>
        <Link to="/account" className="mt-4 inline-block font-semibold text-primary">
          Go to my orders
        </Link>
      </div>
    );

  const step = ORDER_STEPS.findIndex((s) => s.id === order.status);
  const items = order.items as unknown as OrderLine[];
  return (
    <div className="container-x max-w-3xl py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <CheckCircle2 className="mx-auto h-16 w-16 text-leaf" />
        <h1 className="mt-4 font-display text-4xl font-bold">Order placed!</h1>
        <p className="mt-2 text-muted-foreground">
          Order <span className="font-mono font-bold text-foreground">#{order.order_number}</span> ·{" "}
          {new Date(order.created_at).toLocaleString("en-IN")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.fulfilment === "pickup"
            ? "We'll have it ready for pickup in about 15 minutes."
            : "Your dosas will reach you in 30–40 minutes."}{" "}
          Pay on {order.fulfilment === "pickup" ? "pickup" : "delivery"}.
        </p>
      </motion.div>

      <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Order status">
        {ORDER_STEPS.map((s, i) => (
          <li key={s.id} className="text-center">
            <div className={`mx-auto h-2 rounded-full ${i <= step ? "bg-saffron" : "bg-muted"}`} />
            <p
              className={`mt-2 text-xs font-semibold ${i <= step ? "text-foreground" : "text-muted-foreground"}`}
            >
              {s.label}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10 space-y-3 rounded-3xl border border-border bg-card p-6 text-sm">
        {items.map((l, i) => (
          <div key={i} className="flex justify-between gap-3">
            <span>
              <span className="font-semibold">
                {l.quantity} × {l.name}
              </span>
              <span className="block text-xs capitalize text-muted-foreground">
                {l.spice}
                {l.addons.length ? ` · ${l.addons.join(", ")}` : ""}
              </span>
            </span>
            <span className="font-semibold">{formatINR(l.unitPrice * l.quantity)}</span>
          </div>
        ))}
        <div className="space-y-2 border-t border-border pt-3">
          <Row label="Subtotal" value={formatINR(order.subtotal)} />
          {order.discount > 0 && (
            <Row
              accent
              label={`Discount (${order.coupon_code})`}
              value={`− ${formatINR(order.discount)}`}
            />
          )}
          <Row label="Delivery & packing" value={formatINR(order.delivery_fee)} />
          <Row label="GST" value={formatINR(order.taxes)} />
          <div className="flex justify-between pt-2 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/account"
          hash="orders"
          className="rounded-full border border-border px-6 py-3 font-semibold"
        >
          My orders
        </Link>
        <Link
          to="/menu"
          className="rounded-full bg-saffron px-6 py-3 font-bold text-primary-foreground"
        >
          Order more
        </Link>
      </div>
    </div>
  );
}
