import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Addon = Database["public"]["Tables"]["addons"]["Row"];
export type Menu = { categories: Category[]; items: MenuItem[]; addons: Addon[] };

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getMenu = createServerFn({ method: "GET" }).handler(async (): Promise<Menu> => {
  const sb = publicClient();
  const [c, i, a] = await Promise.all([
    sb.from("categories").select("*").order("sort_order"),
    sb.from("menu_items").select("*").order("name"),
    sb.from("addons").select("*").order("sort_order"),
  ]);
  if (c.error || i.error || a.error) {
    console.error(c.error ?? i.error ?? a.error);
    throw new Error("We couldn't load the menu right now.");
  }
  return { categories: c.data, items: i.data, addons: a.data };
});
