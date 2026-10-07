import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth, safeRedirect } from "@/lib/auth";
import { AuthShell, authBtn, authField } from "@/components/site/AuthShell";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Login — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Sign in to order dosas, track orders and use saved addresses.",
      },
      { property: "og:title", content: "Login — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Sign in to your Avighna Bengaluru Dosa account." },
    ],
  }),
  component: Login,
});

export function GoogleButton({ label }: { label: string }) {
  const [err, setErr] = useState("");
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          setErr("");
          const r = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin,
          });
          if (r.error) setErr("Google sign-in didn't work. Please try again.");
        }}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card font-semibold hover:bg-muted"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8Z"
          />
          <path
            fill="#34A853"
            d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23Z"
          />
          <path fill="#FBBC05" d="M5.7 14a6.6 6.6 0 0 1 0-4.2V7H2a11 11 0 0 0 0 9.9L5.7 14Z" />
          <path
            fill="#EA4335"
            d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.9C6.6 7.4 9.1 5.4 12 5.4Z"
          />
        </svg>
        {label}
      </button>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
    </>
  );
}

function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const target = safeRedirect(redirect ? redirect.replace(/^https?:\/\/[^/]+/, "") : "/");

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user, target, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Email not confirmed")
          ? "Please confirm your email first — check your inbox."
          : "That email and password don't match. Please try again.",
      );
      return;
    }
    if (!remember) sessionStorage.setItem("bd-session-only", "1");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to order, track deliveries and reuse saved addresses."
    >
      <GoogleButton label="Continue with Google" />
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Email
          <input
            className={authField}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            className={authField}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-primary">
            Forgot password?
          </Link>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <button className={authBtn} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}Login
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" search={{ redirect }} className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
