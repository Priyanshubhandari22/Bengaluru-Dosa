import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Menu as MenuIcon, Search, ShoppingBag, User, X, LogOut, Package } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { count, setOpen, bumpKey } = useCart();
  const { user } = useAuth();
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.removeQueries({ queryKey: ["orders"] });
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/menu", search: { q: q.trim() || undefined } });
    setMobile(false);
  };
  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <nav className="container-x flex h-16 items-center gap-4" aria-label="Main">
        <Logo />
        <ul className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <form onSubmit={search} className="ml-auto hidden lg:block" role="search">
          <label className="relative block">
            <span className="sr-only">Search the menu</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dosas, paneer, podi…"
              className="h-10 w-64 rounded-full border border-input bg-card pl-9 pr-4 text-sm outline-none transition focus:w-72 focus:border-primary"
            />
          </label>
        </form>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold sm:flex"
                aria-label="Account menu"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs">
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{name.split(" ")[0]}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/account" })}>
                  <User className="mr-2 h-4 w-4" />
                  My account
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/account", hash: "orders" })}>
                  <Package className="mr-2 h-4 w-4" />
                  My orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-accent"
              >
                Register
              </Link>
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-saffron text-primary-foreground shadow-soft transition-transform hover:scale-105"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span
                key={bumpKey}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-bump place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-ink-foreground"
              >
                {count}
              </span>
            )}
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-full md:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-label="Toggle menu"
            aria-expanded={mobile}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobile ? "x" : "m"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                {mobile ? <X /> : <MenuIcon />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container-x space-y-2 py-4">
              <form onSubmit={search} role="search">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search the menu"
                  aria-label="Search the menu"
                  className="h-12 w-full rounded-xl border border-input bg-card px-4"
                />
              </form>
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setMobile(false)}
                    className="block rounded-xl px-4 py-3 text-lg font-semibold hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/account"
                    onClick={() => setMobile(false)}
                    className="rounded-xl bg-secondary py-3 text-center font-semibold"
                  >
                    My account
                  </Link>
                  <button
                    onClick={() => {
                      setMobile(false);
                      signOut();
                    }}
                    className="rounded-xl border border-border py-3 font-semibold"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobile(false)}
                    className="rounded-xl border border-border py-3 text-center font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobile(false)}
                    className="rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
