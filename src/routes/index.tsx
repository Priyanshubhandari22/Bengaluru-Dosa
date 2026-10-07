import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Bike,
  ChefHat,
  Clock,
  Flame,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Utensils,
} from "lucide-react";
import heroDosa from "@/assets/hero-dosa.jpg";
import { menuQuery } from "@/lib/menu.queries";
import type { MenuItem } from "@/lib/menu.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { foodImage } from "@/lib/images";
import { RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avighna Bengaluru Dosa — Crispy. Fresh. Authentic. Order online" },
      {
        name: "description",
        content:
          "Order ghee roast, Mysore masala, benne dosa and filter kaapi from Avighna Bengaluru Dosa. Fast delivery or pickup across Dehradun.",
      },
      { property: "og:title", content: "Avighna Bengaluru Dosa — Crispy. Fresh. Authentic." },
      {
        property: "og:description",
        content: "Authentic Bengaluru dosas, delivered hot. Order online in minutes.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(menuQuery),
  component: Home,
});

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

function Home() {
  const { data } = useSuspenseQuery(menuQuery);
  const [active, setActive] = useState<MenuItem | null>(null);
  const popular = data.items.filter((i) => i.is_popular).slice(0, 8);
  const best = data.items.filter((i) => i.is_bestseller).slice(0, 4);

  return (
    <>
      <Hero />
      <Section eyebrow="Fan favourites" title="Popular dosas" cta>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((i, n) => (
            <ProductCard key={i.id} item={i} index={n} onOpen={setActive} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Browse" title="Pick your craving">
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-6">
          {data.categories.map((c, n) => (
            <motion.div
              key={c.id}
              {...fade}
              transition={{ delay: n * 0.03 }}
              className="snap-start"
            >
              <Link
                to="/menu"
                search={{ category: c.id }}
                className="group block w-36 shrink-0 text-center sm:w-auto"
              >
                <div className="mx-auto aspect-square overflow-hidden rounded-full border-4 border-card shadow-soft transition group-hover:-translate-y-1 group-hover:shadow-lift">
                  <img
                    src={foodImage(c.image_key)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-110"
                  />
                </div>
                <p className="mt-3 font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      <section className="container-x mt-20">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-ink text-ink-foreground md:grid-cols-2">
          <div className="kolam absolute inset-0 opacity-20" aria-hidden />
          <div className="relative space-y-4 p-8 sm:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-turmeric px-3 py-1 text-xs font-bold text-accent-foreground">
              <Flame className="h-3.5 w-3.5" /> Special offers
            </span>
            <h2 className="font-display text-4xl font-bold">
              Flat 20% off <br />
              on feasts above ₹499
            </h2>
            <p className="text-ink-foreground/70">Use these codes at checkout:</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["BENGALURU20", "20% off ₹499+"],
                ["DOSA10", "10% off ₹199+"],
                ["FIRSTORDER", "₹75 off first order"],
              ].map(([c, d]) => (
                <div
                  key={c}
                  className="rounded-xl border border-dashed border-turmeric/60 px-3 py-2"
                >
                  <p className="font-mono font-bold text-turmeric">{c}</p>
                  <p className="text-xs text-ink-foreground/60">{d}</p>
                </div>
              ))}
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 font-bold text-primary-foreground"
            >
              Order now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img
            src={foodImage("combo")}
            alt="A South Indian feast with dosas, vadas and filter coffee"
            loading="lazy"
            className="relative h-72 w-full object-cover md:h-full"
          />
        </div>
      </section>

      <Section eyebrow="Most ordered" title="Best sellers this week">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {best.map((i, n) => (
            <ProductCard key={i.id} item={i} index={n} onOpen={setActive} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Why Avighna Bengaluru Dosa" title="Made the slow way, served fast">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              ChefHat,
              "Stone-ground batter",
              "Rice and urad ground fresh every morning, fermented 14 hours.",
            ],
            [
              Leaf,
              "100% vegetarian",
              "Pure veg kitchen, cold-pressed oils, real Amul butter and ghee.",
            ],
            [
              Bike,
              "Hot in 30 minutes",
              "Packed in vented boxes so your dosa stays crisp on the way.",
            ],
            [
              ShieldCheck,
              "Hygiene first",
              "FSSAI-certified kitchen with daily audits and sealed packaging.",
            ],
          ].map(([I, t, d], n) => {
            const Icon = I as typeof ChefHat;
            return (
              <motion.div
                key={t as string}
                {...fade}
                transition={{ delay: n * 0.08 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl">{t as string}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </motion.div>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Easy as 1-2-3" title="How it works">
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            ["Pick your dosas", "Browse 30+ dosas, add butter, cheese or extra chutney."],
            ["Checkout in seconds", "Delivery or pickup, apply a coupon, pay on delivery."],
            ["Eat it hot", "Track your order live from tawa to doorstep."],
          ].map(([t, d], n) => (
            <motion.li
              key={t}
              {...fade}
              transition={{ delay: n * 0.1 }}
              className="relative rounded-3xl bg-warm p-6"
            >
              <span className="font-display text-6xl font-bold text-primary/25">0{n + 1}</span>
              <h3 className="mt-2 font-display text-xl">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Love letters" title="What Bengaluru says">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              "Ananya R.",
              "Indiranagar",
              "The benne masala is exactly like Davangere. Arrived crisp — unbelievable for delivery.",
            ],
            [
              "Karthik S.",
              "Jayanagar",
              "Our Sunday family feast is now a ritual. The filter kaapi alone is worth it.",
            ],
            [
              "Meera P.",
              "Whitefield",
              "Mysore masala with proper red chutney. Spicy, buttery, perfect.",
            ],
          ].map(([n, a, q], i) => (
            <motion.figure
              key={n}
              {...fade}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex gap-0.5" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-turmeric text-turmeric" />
                ))}
              </div>
              <blockquote className="mt-3 text-lg leading-snug">"{q}"</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {n} <span className="font-normal text-muted-foreground">· {a}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Section>

      <section className="container-x mt-20">
        <motion.div
          {...fade}
          className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-saffron p-8 text-primary-foreground sm:flex-row sm:p-12"
        >
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Hungry? Your tawa is heating up.
            </h2>
            <p className="mt-2 opacity-90">Free delivery on orders above ₹499.</p>
          </div>
          <Link
            to="/menu"
            className="rounded-full bg-ink px-8 py-4 font-bold text-ink-foreground transition hover:scale-105"
          >
            Order now
          </Link>
        </motion.div>
      </section>

      <section className="container-x mt-20 grid items-center gap-10 md:grid-cols-2">
        <motion.img
          {...fade}
          src={foodImage("signature")}
          alt="Benne dosa with podi"
          loading="lazy"
          className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift"
        />
        <motion.div {...fade} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our story</p>
          <h2 className="font-display text-4xl font-bold">A Dehradun tawa, now on your phone</h2>
          <p className="text-muted-foreground">
            We started with one cast-iron tawa and a family recipe for benne dosa. Today we still
            grind our batter by hand-tended wet grinders and roast every dosa to order.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 font-bold text-primary">
            Read our story <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <section className="container-x mt-20 grid gap-6 md:grid-cols-3">
        <a
          href={RESTAURANT.mapsLink}
          target="_blank"
          rel="noreferrer"
          className="flex gap-4 rounded-3xl border border-border bg-card p-6 transition hover:border-primary"
        >
          <MapPin className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-display text-lg">Find us</p>
            <p className="text-sm text-muted-foreground">{RESTAURANT.address}</p>
          </div>
        </a>
        <div className="flex gap-4 rounded-3xl border border-border bg-card p-6">
          <Clock className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-display text-lg">Hours</p>
            <p className="text-sm text-muted-foreground">{RESTAURANT.hours}</p>
          </div>
        </div>
        <a
          href={`tel:${RESTAURANT.phone}`}
          className="flex gap-4 rounded-3xl border border-border bg-card p-6 transition hover:border-primary"
        >
          <Phone className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-display text-lg">Call to order</p>
            <p className="text-sm text-muted-foreground">{RESTAURANT.phoneDisplay}</p>
          </div>
        </a>
      </section>

      <ProductDialog
        item={active}
        addons={data.addons}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 12]);
  return (
    <section ref={ref} className="relative overflow-hidden bg-warm">
      <div className="kolam absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 px-3 py-1.5 text-xs font-bold text-primary"
          >
            <Utensils className="h-3.5 w-3.5" /> Delivering hot across Dehradun
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl"
          >
            Crispy. Fresh.
            <br />
            <span className="text-primary">Authentic</span> Avighna Bengaluru Dosa.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-lg text-lg text-muted-foreground"
          >
            Slow-fermented batter, roasted golden in pure ghee and butter, with coconut chutney and
            sambar made fresh every morning.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/menu"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-saffron px-8 text-lg font-bold text-primary-foreground shadow-lift transition hover:scale-[1.03]"
            >
              Order now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/menu"
              className="inline-flex h-14 items-center rounded-full border-2 border-foreground/15 bg-card/60 px-8 text-lg font-bold transition hover:border-primary"
            >
              Explore menu
            </Link>
          </motion.div>
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-8 pt-2"
          >
            {[
              ["4.8★", "12k+ ratings"],
              ["30 min", "avg. delivery"],
              ["30+", "dosa varieties"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-bold">{v}</dt>
                <dd className="text-xs text-muted-foreground">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <motion.div style={{ y }} className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ rotate: rot }}
          >
            <div
              className="absolute -inset-6 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow"
              aria-hidden
            />
            <img
              src={heroDosa}
              alt="A golden crispy dosa on a banana leaf with coconut chutney, sambar and tomato chutney"
              width={1600}
              height={1200}
              className="relative aspect-square w-full rounded-full object-cover shadow-lift"
            />
          </motion.div>
          <div
            className="absolute -left-2 bottom-10 rounded-2xl bg-card p-3 shadow-lift sm:left-0"
          >
            <p className="text-xs text-muted-foreground">Bestseller</p>
            <p className="font-display font-bold">Benne Masala · ₹129</p>
          </div>
          <div
            className="absolute right-0 top-8 rounded-2xl bg-ink p-3 text-ink-foreground shadow-lift"
          >
            <p className="flex items-center gap-1 text-sm font-bold">
              <Flame className="h-4 w-4 text-turmeric" /> Fresh off the tawa
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  cta,
  children,
}: {
  eyebrow: string;
  title: string;
  cta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="container-x mt-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
        </div>
        {cta && (
          <Link to="/menu" className="hidden items-center gap-1 font-bold text-primary sm:flex">
            Full menu <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
