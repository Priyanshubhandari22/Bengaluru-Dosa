import { motion } from "motion/react";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/menu.functions";
import { foodImage } from "@/lib/images";
import { formatINR } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { VegMark, SpiceMark } from "./VegMark";

export function ProductCard({
  item,
  onOpen,
  index = 0,
}: {
  item: MenuItem;
  onOpen: (i: MenuItem) => void;
  index?: number;
}) {
  const { add } = useCart();
  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.customizable) return onOpen(item);
    add({
      itemId: item.id,
      name: item.name,
      imageKey: item.image_key,
      basePrice: item.price,
      addons: [],
      spice: "medium",
      notes: "",
      quantity: 1,
    });
    toast.success(`${item.name} added to cart`);
  };
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition-shadow hover:shadow-lift ${item.is_available ? "" : "opacity-60"}`}
      onClick={() => onOpen(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={foodImage(item.image_key)}
          alt={item.name}
          loading="lazy"
          width={816}
          height={612}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {item.is_bestseller && (
            <span className="rounded-full bg-chilli px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
              Bestseller
            </span>
          )}
          {item.is_popular && !item.is_bestseller && (
            <span className="rounded-full bg-turmeric px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
              Popular
            </span>
          )}
          {!item.is_available && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-ink-foreground">
              Sold out
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <VegMark veg={item.is_veg} />
          <SpiceMark level={item.spicy_level} />
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold">
            <Star className="h-3.5 w-3.5 fill-turmeric text-turmeric" />
            {item.rating}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight">
          <button
            className="text-left focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item);
            }}
          >
            {item.name}
          </button>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-extrabold">{formatINR(item.price)}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={quickAdd}
            disabled={!item.is_available}
            aria-label={`Add ${item.name} to cart`}
            className="flex h-10 items-center gap-1 rounded-full bg-saffron px-4 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
