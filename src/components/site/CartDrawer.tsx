import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart, lineUnitPrice, type CartLine } from "@/lib/cart";
import { foodImage } from "@/lib/images";
import { computeTotals, formatINR, FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import { QtyStepper } from "./ProductDialog";

export function CartLineRow({ l }: { l: CartLine }) {
  const { setQty, remove } = useCart();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 py-4"
    >
      <img
        src={foodImage(l.imageKey)}
        alt=""
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight">{l.name}</p>
          <button
            onClick={() => remove(l.key)}
            aria-label={`Remove ${l.name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
          {l.spice}
          {l.addons.length ? ` · ${l.addons.map((a) => a.name).join(", ")}` : ""}
          {l.notes ? ` · "${l.notes}"` : ""}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <QtyStepper small value={l.quantity} onChange={(n) => setQty(l.key, n)} />
          <span className="font-bold">{formatINR(lineUnitPrice(l) * l.quantity)}</span>
        </div>
      </div>
    </motion.li>
  );
}

export function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
        <ShoppingBag className="h-9 w-9 text-primary" />
      </div>
      <p className="font-display text-xl">Your plate is empty</p>
      <p className="max-w-60 text-sm text-muted-foreground">
        A hot, crispy dosa is just a tap away.
      </p>
      <Link
        to="/menu"
        onClick={onBrowse}
        className="mt-2 rounded-full bg-saffron px-6 py-3 font-bold text-primary-foreground"
      >
        Browse the menu
      </Link>
    </div>
  );
}

export function CartDrawer() {
  const { lines, open, setOpen, subtotal } = useCart();
  const t = computeTotals(subtotal, "delivery", null);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-display text-2xl">Your order</SheetTitle>
          <SheetDescription>
            {lines.length ? "Review your items before checkout." : "Nothing here yet."}
          </SheetDescription>
        </SheetHeader>
        {lines.length === 0 ? (
          <EmptyCart onBrowse={() => setOpen(false)} />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <CartLineRow key={l.key} l={l} />
                ))}
              </AnimatePresence>
            </ul>
            <div className="space-y-2 border-t border-border bg-muted/50 p-5 text-sm">
              <Row label="Item subtotal" value={formatINR(t.subtotal)} />
              <Row label="Delivery fee" value={t.deliveryFee ? formatINR(t.deliveryFee) : "Free"} />
              <Row label="Packing" value={formatINR(t.packing)} />
              <Row label="GST (5%)" value={formatINR(t.taxes)} />
              <div className="flex justify-between pt-2 text-base font-extrabold">
                <span>Total</span>
                <span>{formatINR(t.total)}</span>
              </div>
              {subtotal < FREE_DELIVERY_ABOVE && (
                <p className="text-xs text-leaf">
                  Add {formatINR(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  onClick={() => setOpen(false)}
                  className="h-12 rounded-full border border-border bg-card font-semibold"
                >
                  Continue shopping
                </button>
                <Link
                  to="/checkout"
                  onClick={() => setOpen(false)}
                  className="grid h-12 place-items-center rounded-full bg-saffron font-bold text-primary-foreground"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`flex justify-between ${accent ? "font-semibold text-leaf" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span className={accent ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
