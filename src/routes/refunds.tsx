import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/site/Legal";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Cancellation and refund policy for Avighna Bengaluru Dosa orders.",
      },
      { property: "og:title", content: "Refund & Cancellation — Avighna Bengaluru Dosa" },
      {
        property: "og:description",
        content: "Cancellation and refund policy for Avighna Bengaluru Dosa orders.",
      },
    ],
  }),
  component: () => (
    <Legal
      title="Refund & Cancellation"
      sections={[
        [
          "Cancellations",
          "You can cancel within 2 minutes of placing an order by calling us. After the kitchen starts preparing, orders cannot be cancelled.",
        ],
        [
          "Wrong or missing items",
          "Tell us within 2 hours with a photo and we will replace the item or refund it.",
        ],
        [
          "Refunds",
          "Approved refunds for online payments are returned to the original method within 5–7 working days.",
        ],
      ]}
    />
  ),
});
