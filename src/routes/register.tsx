import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, authBtn, authField } from "@/components/site/AuthShell";
import { GoogleButton } from "./login";

export const Route = createFileRoute("/register")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Create account — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Register for faster checkout, order tracking and exclusive dosa offers.",
      },
      { property: "og:title", content: "Create account — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Join Avighna Bengaluru Dosa for faster ordering." },
    ],
  }),
  component: Register,
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function Register() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const r = schema.safeParse(f);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: r.data.email,
      password: r.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: r.data.name, phone: r.data.phone },
      },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("registered")
          ? "An account with this email already exists. Try logging in."
          : error.message,
      );
      return;
    }
    setSent(true);
  };

  if (sent)
    return (
      <AuthShell title="Check your inbox" subtitle={`We sent a confirmation link to ${f.email}.`}>
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <MailCheck className="mx-auto h-12 w-12 text-leaf" />
          <p className="mt-3">
            Click the link in the email to activate your account, then come back to order.
          </p>
          <Link to="/login" className="mt-4 inline-block font-semibold text-primary">
            Back to login
          </Link>
        </div>
      </AuthShell>
    );

  const err = (k: string) =>
    errors[k] && (
      <span className="mt-1 block text-xs font-normal text-destructive">{errors[k]}</span>
    );
  return (
    <AuthShell
      title="Create your account"
      subtitle="Faster checkout, saved addresses and order tracking."
    >
      <GoogleButton label="Continue with Google" />
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        <label className="block text-sm font-semibold">
          Full name
          <input className={authField} autoComplete="name" value={f.name} onChange={set("name")} />
          {err("name")}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Email
            <input
              className={authField}
              type="email"
              autoComplete="email"
              value={f.email}
              onChange={set("email")}
            />
            {err("email")}
          </label>
          <label className="block text-sm font-semibold">
            Phone
            <input
              className={authField}
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              value={f.phone}
              onChange={set("phone")}
            />
            {err("phone")}
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              className={authField}
              type="password"
              autoComplete="new-password"
              value={f.password}
              onChange={set("password")}
            />
            {err("password")}
          </label>
          <label className="block text-sm font-semibold">
            Confirm password
            <input
              className={authField}
              type="password"
              autoComplete="new-password"
              value={f.confirm}
              onChange={set("confirm")}
            />
            {err("confirm")}
          </label>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <button className={authBtn} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
