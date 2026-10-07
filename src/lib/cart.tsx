import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Spice = "mild" | "medium" | "hot";
export type CartLine = {
  key: string;
  itemId: string;
  name: string;
  imageKey: string;
  basePrice: number;
  addons: { id: string; name: string; price: number }[];
  spice: Spice;
  notes: string;
  quantity: number;
};

export const lineUnitPrice = (l: Pick<CartLine, "basePrice" | "addons">) =>
  l.basePrice + l.addons.reduce((s, a) => s + a.price, 0);

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (l: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  bumpKey: number;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "bd-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [bumpKey, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Ignore invalid or corrupted localStorage data
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((l: Omit<CartLine, "key">) => {
    const key = [l.itemId, l.spice, ...l.addons.map((a) => a.id).sort(), l.notes.trim()].join("|");
    setLines((prev) => {
      const ex = prev.find((p) => p.key === key);
      if (ex)
        return prev.map((p) =>
          p.key === key ? { ...p, quantity: Math.min(20, p.quantity + l.quantity) } : p,
        );
      return [...prev, { ...l, key }];
    });
    setBump((b) => b + 1);
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((p) => p.key !== key)
        : prev.map((p) => (p.key === key ? { ...p, quantity: Math.min(20, qty) } : p)),
    );
  }, []);
  const remove = useCallback((key: string) => setLines((p) => p.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + lineUnitPrice(l) * l.quantity, 0);
    return { lines, count, subtotal, add, setQty, remove, clear, open, setOpen, bumpKey };
  }, [lines, add, setQty, remove, clear, open, bumpKey]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
