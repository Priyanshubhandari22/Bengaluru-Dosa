import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { menuQuery } from "@/lib/menu.queries";
import type { MenuItem } from "@/lib/menu.functions";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { PageHeader } from "@/components/site/PageHeader";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["popular", "price-asc", "price-desc"]).optional(),
});

export const Route = createFileRoute("/menu")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Menu — Avighna Bengaluru Dosa | Masala, Mysore, Cheese & Paneer Dosas" },
      {
        name: "description",
        content:
          "Browse 30+ dosas, combos, filter kaapi and sides. Customise with butter, cheese, paneer and spice level.",
      },
      { property: "og:title", content: "The Avighna Bengaluru Dosa Menu" },
      {
        property: "og:description",
        content: "Masala, Mysore, benne, cheese and paneer dosas — customise and order online.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(menuQuery),
  pendingComponent: MenuPending,
  component: MenuPage,
});

function MenuPending() {
  return (
    <div className="container-x grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function MenuPage() {
  const { data } = useSuspenseQuery(menuQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/menu" });
  const [active, setActive] = useState<MenuItem | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [spicy, setSpicy] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(600);
  const [showFilters, setShowFilters] = useState(false);

  const q = search.q ?? "";
  const cat = search.category ?? "all";
  const sort = search.sort ?? "popular";

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const catName = (id: string) =>
      data.categories.find((c) => c.id === id)?.name.toLowerCase() ?? "";
    let r = data.items.filter((i) => {
      if (cat !== "all" && i.category_id !== cat) return false;
      if (vegOnly && !i.is_veg) return false;
      if (spicy && i.spicy_level < 2) return false;
      if (popularOnly && !i.is_popular && !i.is_bestseller) return false;
      if (i.price > maxPrice) return false;
      if (term) {
        const hay = [i.name, i.description, ...i.ingredients, catName(i.category_id)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    r = [...r].sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : Number(b.is_bestseller) * 2 +
            Number(b.is_popular) +
            Number(b.rating) -
            (Number(a.is_bestseller) * 2 + Number(a.is_popular) + Number(a.rating)),
    );
    return r;
  }, [data, q, cat, sort, vegOnly, spicy, popularOnly, maxPrice]);

  const setSearch = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({
      search: (s: Record<string, unknown>) => ({ ...s, ...patch }),
      replace: true,
      resetScroll: false,
    });

  const grouped = cat === "all" && sort === "popular" && !q;
  const resetAll = () => {
    setVegOnly(false);
    setSpicy(false);
    setPopularOnly(false);
    setMaxPrice(600);
    setSearch({ q: undefined, category: undefined });
  };

  return (
    <>
      <PageHeader eyebrow="Our menu" title="Pick your dosa">
        Roasted to order. Tap any dish to customise it with butter, cheese, paneer, chutney and
        spice.
      </PageHeader>

      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="container-x space-y-3 py-3">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search dosas, ingredients or categories</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search masala, paneer, podi, coffee…"
                className="h-11 w-full rounded-full border border-input bg-card pl-9 pr-9 text-sm outline-none focus:border-primary"
              />
              {q && (
                <button
                  onClick={() => setSearch({ q: undefined })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={(e) => setSearch({ sort: e.target.value as "popular" })}
              aria-label="Sort by"
              className="h-11 rounded-full border border-input bg-card px-3 text-sm font-semibold"
            >
              <option value="popular">Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              className="flex h-11 items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <Chip on={vegOnly} onClick={() => setVegOnly((v) => !v)}>
                🟢 Pure veg
              </Chip>
              <Chip on={spicy} onClick={() => setSpicy((v) => !v)}>
                🌶 Spicy
              </Chip>
              <Chip on={popularOnly} onClick={() => setPopularOnly((v) => !v)}>
                ⭐ Popular
              </Chip>
              <label className="ml-2 flex items-center gap-2 font-semibold">
                Under ₹{maxPrice}
                <input
                  type="range"
                  min={50}
                  max={600}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-[var(--primary)]"
                />
              </label>
            </motion.div>
          )}
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
            role="tablist"
            aria-label="Categories"
          >
            {[{ id: "all", name: "All" }, ...data.categories].map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setSearch({ category: c.id === "all" ? undefined : c.id })}
                className="relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
              >
                {cat === c.id && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span
                  className={`relative ${cat === c.id ? "text-ink-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-x py-10">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl">No dosas match that</p>
            <p className="mt-1 text-muted-foreground">
              Try a different search or clear your filters.
            </p>
            <button
              onClick={resetAll}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
            >
              Clear all
            </button>
          </div>
        ) : grouped ? (
          data.categories.map((c) => {
            const list = items.filter((i) => i.category_id === c.id);
            if (!list.length) return null;
            return (
              <section key={c.id} className="mb-14" aria-labelledby={`cat-${c.id}`}>
                <h2 id={`cat-${c.id}`} className="font-display text-3xl font-bold">
                  {c.name}
                </h2>
                <p className="mb-5 text-muted-foreground">{c.description}</p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {list.map((i, n) => (
                    <ProductCard key={i.id} item={i} index={n} onOpen={setActive} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <>
            <p className="mb-5 text-sm text-muted-foreground">{items.length} dishes</p>
            <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((i, n) => (
                <ProductCard key={i.id} item={i} index={n} onOpen={setActive} />
              ))}
            </motion.div>
          </>
        )}
      </div>
      <ProductDialog
        item={active}
        addons={data.addons}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 font-semibold transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
    >
      {children}
    </button>
  );
}
