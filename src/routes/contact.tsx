import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content:
          "Find Avighna Bengaluru Dosa on Sahastradhara Road, Dehradun, call to order, or send us a message.",
      },
      { property: "og:title", content: "Contact Avighna Bengaluru Dosa" },
      {
        property: "og:description",
        content: "Address, hours and phone for Avighna Bengaluru Dosa.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const field =
    "mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-primary";
  return (
    <>
      <PageHeader eyebrow="Say hello" title="Contact us">
        Questions, bulk orders or feedback — we'd love to hear from you.
      </PageHeader>
      <div className="container-x grid gap-10 py-14 md:grid-cols-2">
        <div className="space-y-5">
          <a
            href={RESTAURANT.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-lg hover:text-primary"
          >
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <span>{RESTAURANT.address}</span>
          </a>
          <a
            href={`tel:${RESTAURANT.phone}`}
            className="flex items-center gap-3 text-lg hover:text-primary"
          >
            <Phone className="h-5 w-5 shrink-0 text-primary" />
            {RESTAURANT.phoneDisplay}
          </a>
          <p className="flex items-center gap-3 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            {RESTAURANT.hours}
          </p>
          <iframe
            title="Map"
            className="h-72 w-full rounded-3xl border border-border"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=78.040%2C30.328%2C78.090%2C30.358&layer=mapnik&marker=30.343%2C78.065"
          />
        </div>
        {sent ? (
          <div className="rounded-3xl bg-secondary p-8">
            <p className="font-display text-2xl">Thanks!</p>
            <p className="mt-2 text-muted-foreground">
              Your message is noted. For urgent order issues, please call us.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4 rounded-3xl border border-border bg-card p-6"
          >
            <label className="block text-sm font-semibold">
              Name
              <input required className={field} />
            </label>
            <label className="block text-sm font-semibold">
              Email
              <input required type="email" className={field} />
            </label>
            <label className="block text-sm font-semibold">
              Message
              <textarea required rows={5} className={field} />
            </label>
            <button className="w-full rounded-full bg-saffron py-3 font-bold text-primary-foreground">
              Send message
            </button>
          </form>
        )}
      </div>
    </>
  );
}
