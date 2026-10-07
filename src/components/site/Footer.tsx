import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { RESTAURANT } from "@/lib/restaurant";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm text-ink-foreground/70">{RESTAURANT.tagline}</p>
          <div className="flex gap-2">
            {[Instagram, Facebook, Twitter, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label={["Instagram", "Facebook", "Twitter", "YouTube"][i]}
                className="grid h-10 w-10 place-items-center rounded-full bg-ink-foreground/10 transition hover:bg-primary"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-display text-lg">Menu</h3>
          <ul className="space-y-2 text-sm text-ink-foreground/70">
            {[
              ["masala", "Masala Dosas"],
              ["mysore", "Mysore Dosas"],
              ["signature", "Signature Dosas"],
              ["combo", "Family Combos"],
              ["beverages", "Filter Kaapi"],
            ].map(([c, l]) => (
              <li key={c}>
                <Link to="/menu" search={{ category: c }} className="hover:text-turmeric">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-display text-lg">Support</h3>
          <ul className="space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/account" className="hover:text-turmeric">
                Track my order
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-turmeric">
                Contact us
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-turmeric">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-turmeric">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/refunds" className="hover:text-turmeric">
                Refund & Cancellation
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-display text-lg">Visit us</h3>
          <ul className="space-y-3 text-sm text-ink-foreground/70">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-turmeric" />
              {RESTAURANT.address}
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 shrink-0 text-turmeric" />
              <a href={`tel:${RESTAURANT.phone}`}>{RESTAURANT.phoneDisplay}</a>
            </li>
            <li className="flex gap-2">
              <Clock className="h-4 w-4 shrink-0 text-turmeric" />
              {RESTAURANT.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-5 text-center text-xs text-ink-foreground/50">
        © {new Date().getFullYear()} Avighna Bengaluru Dosa. Made with ghee in Dehradun.
      </div>
    </footer>
  );
}
