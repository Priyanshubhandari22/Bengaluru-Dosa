import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, authBtn, authField } from "@/components/site/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Avighna Bengaluru Dosa" },
      { name: "description", content: "Get a link to reset your Avighna Bengaluru Dosa password." },
      { property: "og:title", content: "Reset password — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Reset your Avighna Bengaluru Dosa password." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setState(error ? "error" : "sent");
  };
  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {state === "sent" ? (
        <p className="rounded-2xl bg-secondary p-5">
          If an account exists for {email}, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold">
            Email
            <input
              className={authField}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {state === "error" && (
            <p role="alert" className="text-sm text-destructive">
              Couldn't send the email. Please try again.
            </p>
          )}
          <button className={authBtn} disabled={state === "loading"}>
            {state === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}Send reset link
          </button>
        </form>
      )}
      <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-primary">
        Back to login
      </Link>
    </AuthShell>
  );
}
