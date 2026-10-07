import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, MapPin, Package, Trash2, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { statusLabel, type OrderLine } from "@/lib/orders";
import { formatINR } from "@/lib/pricing";
import { PAYMENT_PROVIDERS } from "@/lib/payments";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Avighna Bengaluru Dosa" },
      {
        name: "description",
        content: "Your profile, orders, saved addresses and payment preferences.",
      },
      { property: "og:title", content: "My account — Avighna Bengaluru Dosa" },
      { property: "og:description", content: "Manage your Avighna Bengaluru Dosa account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

const field =
  "mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary";
const statusColor: Record<string, string> = {
  placed: "bg-secondary text-secondary-foreground",
  preparing: "bg-turmeric text-accent-foreground",
  out_for_delivery: "bg-primary text-primary-foreground",
  delivered: "bg-leaf text-leaf-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

function Account() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () =>
      (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const orders = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: async () => {
      const r = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (r.error) throw r.error;
      return r.data;
    },
  });
  const addresses = useQuery({
    queryKey: ["addresses", user.id],
    queryFn: async () =>
      (await supabase.from("addresses").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });

  const [p, setP] = useState({ full_name: "", phone: "", preferred_payment: "cod" });
  useEffect(() => {
    if (profile.data)
      setP({
        full_name: profile.data.full_name ?? "",
        phone: profile.data.phone ?? "",
        preferred_payment: profile.data.preferred_payment ?? "cod",
      });
  }, [profile.data]);
  const [addr, setAddr] = useState({ label: "Home", line1: "", city: "Dehradun", pincode: "" });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...p });
    if (error) toast.error("Couldn't save your profile");
    else {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    }
  };
  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addr.line1.trim() || !/^\d{6}$/.test(addr.pincode)) {
      toast.error("Enter an address and 6-digit pincode");
      return;
    }
    const { error } = await supabase.from("addresses").insert({ ...addr, user_id: user.id });
    if (error) {
      toast.error("Could not save address");
      return;
    }
    setAddr({ label: "Home", line1: "", city: "Dehradun", pincode: "" });
    qc.invalidateQueries({ queryKey: ["addresses"] });
  };
  const delAddress = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["addresses"] });
  };
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const current =
    orders.data?.filter((o) => o.status !== "delivered" && o.status !== "cancelled") ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={`Namaskara, ${(p.full_name || user.email || "").split(" ")[0]}`}
      >
        Manage your profile, orders and addresses.
      </PageHeader>
      <div className="container-x grid gap-6 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {current.length > 0 && (
            <Panel icon={Package} title="Current orders">
              {current.map((o) => (
                <Link
                  key={o.id}
                  to="/order/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-2xl bg-secondary p-4 font-semibold"
                >
                  <span>
                    #{o.order_number} · {formatINR(o.total)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs ${statusColor[o.status]}`}>
                    {statusLabel(o.status)}
                  </span>
                </Link>
              ))}
            </Panel>
          )}
          <section id="orders">
            <Panel icon={Package} title="Order history">
              {orders.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading orders…</p>
              ) : orders.isError ? (
                <p className="text-sm text-destructive">
                  Couldn't load your orders. Please refresh.
                </p>
              ) : !orders.data?.length ? (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">No orders yet.</p>
                  <Link to="/menu" className="mt-2 inline-block font-semibold text-primary">
                    Order your first dosa
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2">Order</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.data.map((o) => (
                        <tr key={o.id}>
                          <td className="py-3">
                            <Link
                              to="/order/$id"
                              params={{ id: o.id }}
                              className="font-mono font-semibold text-primary"
                            >
                              #{o.order_number}
                            </Link>
                          </td>
                          <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                          <td className="max-w-48 truncate">
                            {(o.items as unknown as OrderLine[])
                              .map((l) => `${l.quantity}× ${l.name}`)
                              .join(", ")}
                          </td>
                          <td className="font-semibold">{formatINR(o.total)}</td>
                          <td>
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[o.status]}`}
                            >
                              {statusLabel(o.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </section>
          <Panel icon={MapPin} title="Saved addresses">
            <ul className="space-y-2">
              {addresses.data?.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4 text-sm"
                >
                  <span>
                    <span className="font-bold">{a.label}</span>
                    <span className="block text-muted-foreground">
                      {a.line1}, {a.city} {a.pincode}
                    </span>
                  </span>
                  <button
                    onClick={() => delAddress(a.id)}
                    aria-label="Delete address"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={addAddress} className="mt-4 grid gap-3 sm:grid-cols-4">
              <label className="text-sm font-semibold">
                Label
                <input
                  className={field}
                  value={addr.label}
                  onChange={(e) => setAddr({ ...addr, label: e.target.value })}
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-3">
                Address
                <input
                  className={field}
                  value={addr.line1}
                  onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                City
                <input
                  className={field}
                  value={addr.city}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                />
              </label>
              <label className="text-sm font-semibold">
                Pincode
                <input
                  className={field}
                  inputMode="numeric"
                  maxLength={6}
                  value={addr.pincode}
                  onChange={(e) => setAddr({ ...addr, pincode: e.target.value })}
                />
              </label>
              <button className="self-end rounded-full bg-ink py-3 font-semibold text-ink-foreground">
                Add
              </button>
            </form>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel icon={User} title="Profile">
            <form onSubmit={saveProfile} className="space-y-3">
              <label className="block text-sm font-semibold">
                Name
                <input
                  className={field}
                  value={p.full_name}
                  onChange={(e) => setP({ ...p, full_name: e.target.value })}
                />
              </label>
              <label className="block text-sm font-semibold">
                Phone
                <input
                  className={field}
                  value={p.phone}
                  onChange={(e) => setP({ ...p, phone: e.target.value })}
                />
              </label>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
              <div className="flex items-center gap-2 pt-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">Payment preference</span>
              </div>
              <select
                className={field}
                value={p.preferred_payment}
                onChange={(e) => setP({ ...p, preferred_payment: e.target.value })}
                aria-label="Preferred payment"
              >
                {PAYMENT_PROVIDERS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
              <button className="w-full rounded-full bg-saffron py-3 font-bold text-primary-foreground">
                Save
              </button>
            </form>
          </Panel>
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 font-semibold hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

function Panel({
  icon: I,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-xl">
        <I className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}
