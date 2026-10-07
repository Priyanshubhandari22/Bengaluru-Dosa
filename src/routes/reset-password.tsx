import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, authBtn, authField } from "@/components/site/AuthShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Choose a new password for your Avighna Bengaluru Dosa account.",
      },
      { property: "og:title", content: "Set a new password — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Choose a new password." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return setError("This reset link has expired. Please request a new one.");
    toast.success("Password updated");
    navigate({ to: "/account" });
  };
  return (
    <AuthShell title="Set a new password" subtitle="Pick something you'll remember.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">
          New password
          <input
            className={authField}
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold">
          Confirm password
          <input
            className={authField}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button className={authBtn} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}Update password
        </button>
      </form>
    </AuthShell>
  );
}
