import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "@/components/site/Legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Avighna Bengaluru Dosa" },
      { name: "description", content: "How Avighna Bengaluru Dosa handles your personal data." },
      { property: "og:title", content: "Privacy Policy — Avighna Bengaluru Dosa" },
      {
        property: "og:description",
        content: "How Avighna Bengaluru Dosa handles your personal data.",
      },
    ],
  }),
  component: () => (
    <Legal
      title="Privacy Policy"
      sections={[
        [
          "What we collect",
          "Your name, phone, email, delivery addresses and order history — only what we need to deliver your food.",
        ],
        [
          "How we use it",
          "To prepare and deliver orders, send order updates and improve our service. We never sell your data.",
        ],
        [
          "Security",
          "Passwords are securely hashed and never stored in plain text. Card details are never stored by us.",
        ],
        [
          "Your choices",
          "You can edit or delete saved addresses anytime from your account, or contact us to delete your account.",
        ],
      ]}
    />
  ),
});
