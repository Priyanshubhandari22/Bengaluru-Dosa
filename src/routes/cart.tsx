import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart";
import { computeTotals, formatINR, FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import { CartLineRow, EmptyCart, Row } from "@/components/site/CartDrawer";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Review your dosas, adjust quantities and head to checkout.",
      },
      { property: "og:title", content: "Your cart — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Review your dosa order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, clear } = useCart();
  const t = computeTotals(subtotal, "delivery", null);
  return (
    <>
      <PageHeader eyebrow="Cart" title="Your order" />
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-border bg-card p-5">
          {lines.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <ul className="divide-y divide-border">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <CartLineRow key={l.key} l={l} />
                  ))}
                </AnimatePresence>
              </ul>
              <div className="flex justify-between border-t border-border pt-4">
                <Link to="/menu" className="font-semibold text-primary">
                  + Add more items
                </Link>
                <button
                  onClick={clear}
                  className="text-sm text-muted-foreground hover:text-destructive"
                >
                  Clear cart
                </button>
              </div>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <aside className="h-fit space-y-2 rounded-3xl border border-border bg-card p-6 text-sm lg:sticky lg:top-24">
            <h2 className="mb-2 font-display text-xl">Bill details</h2>
            <Row label="Item subtotal" value={formatINR(t.subtotal)} />
            <Row label="Delivery fee" value={t.deliveryFee ? formatINR(t.deliveryFee) : "Free"} />
            <Row label="Packing" value={formatINR(t.packing)} />
            <Row label="GST (5%)" value={formatINR(t.taxes)} />
            <div className="flex justify-between border-t border-border pt-3 text-lg font-extrabold">
              <span>To pay</span>
              <span>{formatINR(t.total)}</span>
            </div>
            {subtotal < FREE_DELIVERY_ABOVE && (
              <p className="text-xs text-leaf">
                Add {formatINR(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery.
              </p>
            )}
            <p className="text-xs text-muted-foreground">Have a coupon? Apply it at checkout.</p>
            <Link
              to="/checkout"
              className="mt-3 grid h-14 place-items-center rounded-full bg-saffron text-lg font-bold text-primary-foreground shadow-soft"
            >
              Proceed to checkout
            </Link>
          </aside>
        )}
      </div>
    </>
  );
}
