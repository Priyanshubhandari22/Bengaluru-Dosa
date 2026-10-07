import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/site/Legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Avighna Bengaluru Dosa" },
      { name: "description", content: "Terms for ordering from Avighna Bengaluru Dosa." },
      { property: "og:title", content: "Terms & Conditions — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Terms for ordering from Avighna Bengaluru Dosa." },
    ],
  }),
  component: () => (
    <Legal
      title="Terms & Conditions"
      sections={[
        [
          "Orders",
          "Orders are confirmed once you see an order number. Prices include all menu charges; GST and delivery fees are shown at checkout.",
        ],
        [
          "Delivery",
          "We deliver within our Dehradun service area. Delivery times are estimates and may vary with traffic and weather.",
        ],
        [
          "Coupons",
          "One coupon per order. Coupons cannot be exchanged for cash and may be withdrawn at any time.",
        ],
        [
          "Accounts",
          "Keep your login details private. You are responsible for orders placed from your account.",
        ],
      ]}
    />
  ),
});
