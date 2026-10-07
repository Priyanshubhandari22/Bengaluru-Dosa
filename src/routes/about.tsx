import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { foodImage } from "@/lib/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content:
          "The story of Avighna Bengaluru Dosa: stone-ground batter, cast-iron tawas and pure ghee since day one.",
      },
      { property: "og:title", content: "About Avighna Bengaluru Dosa" },
      {
        property: "og:description",
        content: "A Dehradun dosa kitchen, now delivering across Dehradun.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="One tawa. One recipe. A whole city.">
        We roast dosas the way our grandmothers did — and deliver them the way Bengaluru lives now.
      </PageHeader>
      <div className="container-x grid gap-10 py-14 md:grid-cols-2">
        <img
          src={foodImage("set")}
          alt="Set dosa with sagu"
          loading="lazy"
          className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift"
        />
        <div className="space-y-4 text-lg text-muted-foreground">
          <p>
            Avighna Bengaluru Dosa began on Sahastradhara Road, Dehradun with one cast-iron tawa and
            a family recipe for benne dosa.
          </p>
          <p>
            Every morning we soak rice and urad, stone-grind the batter and let it ferment
            overnight. Chutneys are ground fresh, sambar simmers for hours, and every dosa is
            roasted to order in pure ghee or Amul butter.
          </p>
          <p>Today we deliver that same dosa — still crisp, still hot — across Dehradun.</p>
          <Link
            to="/menu"
            className="inline-block rounded-full bg-saffron px-6 py-3 font-bold text-primary-foreground"
          >
            See the menu
          </Link>
        </div>
      </div>
    </>
  );
}
