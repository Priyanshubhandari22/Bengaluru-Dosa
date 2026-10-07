import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2" aria-label="Avighna Bengaluru Dosa home">
      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-saffron text-primary-foreground shadow-soft transition-transform group-hover:rotate-12">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path d="M3 16c4-8 14-10 18-8-2 6-10 11-18 8Z" />
          <path d="M7 14c2-2 5-3.5 9-4" />
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-lg font-bold ${light ? "text-ink-foreground" : "text-foreground"}`}
        >
          Avighna Bengaluru Dosa
        </span>
        <span
          className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? "text-turmeric" : "text-primary"}`}
        >
          Since the first ghee roast
        </span>
      </span>
    </Link>
  );
}
