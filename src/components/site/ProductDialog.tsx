import { useEffect, useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Addon, MenuItem } from "@/lib/menu.functions";
import { foodImage } from "@/lib/images";
import { formatINR } from "@/lib/pricing";
import { useCart, type Spice } from "@/lib/cart";
import { VegMark, SpiceMark } from "./VegMark";

export function ProductDialog({
  item,
  addons,
  open,
  onOpenChange,
}: {
  item: MenuItem | null;
  addons: Addon[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [chosen, setChosen] = useState<string[]>([]);
  const [spice, setSpice] = useState<Spice>("medium");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setQty(1);
      setChosen([]);
      setSpice("medium");
      setNotes("");
    }
  }, [open, item?.id]);

  if (!item) return null;
  const sel = item.customizable ? addons.filter((a) => chosen.includes(a.id)) : [];
  const unit = item.price + sel.reduce((s, a) => s + a.price, 0);

  const submit = () => {
    add({
      itemId: item.id,
      name: item.name,
      imageKey: item.image_key,
      basePrice: item.price,
      addons: sel.map(({ id, name, price }) => ({ id, name, price })),
      spice,
      notes,
      quantity: qty,
    });
    toast.success(`${item.name} added to cart`, { description: `${qty} × ${formatINR(unit)}` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-2xl">
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square sm:aspect-auto">
            <img
              src={foodImage(item.image_key)}
              alt={item.name}
              className="h-full w-full object-cover sm:rounded-l-lg"
            />
          </div>
          <div className="flex flex-col gap-4 p-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <VegMark veg={item.is_veg} />
                <SpiceMark level={item.spicy_level} />
                <span className="ml-auto flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-turmeric text-turmeric" />
                  {item.rating}
                </span>
              </div>
              <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
              <DialogDescription className="mt-1">{item.description}</DialogDescription>
              <p className="mt-2 text-xs text-muted-foreground">
                Ingredients: {item.ingredients.join(", ")}
              </p>
            </div>

            {item.customizable && (
              <>
                <fieldset>
                  <legend className="mb-2 text-sm font-bold">Add-ons</legend>
                  <div className="space-y-2">
                    {addons.map((a) => (
                      <label
                        key={a.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--primary)]"
                          checked={chosen.includes(a.id)}
                          onChange={(e) =>
                            setChosen((c) =>
                              e.target.checked ? [...c, a.id] : c.filter((x) => x !== a.id),
                            )
                          }
                        />
                        <span className="flex-1">{a.name}</span>
                        <span className="font-semibold">+{formatINR(a.price)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-bold">Spice level</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(["mild", "medium", "hot"] as Spice[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={spice === s}
                        onClick={() => setSpice(s)}
                        className={`rounded-xl border py-2 text-sm font-semibold capitalize transition ${spice === s ? "border-chilli bg-chilli text-primary-foreground" : "border-border hover:border-chilli"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="block text-sm font-bold">
                  Special instructions
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                    rows={2}
                    placeholder="Less oil, extra crispy…"
                    className="mt-2 w-full rounded-xl border border-input bg-card p-3 text-sm font-normal outline-none focus:border-primary"
                  />
                </label>
              </>
            )}

            <div className="mt-auto flex items-center gap-3 pt-2">
              <QtyStepper value={qty} onChange={setQty} />
              <button
                onClick={submit}
                disabled={!item.is_available}
                className="flex h-12 flex-1 items-center justify-between rounded-full bg-saffron px-5 font-bold text-primary-foreground shadow-soft transition hover:shadow-lift disabled:opacity-50"
              >
                <span>{item.is_available ? "Add to cart" : "Unavailable"}</span>
                <span>{formatINR(unit * qty)}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QtyStepper({
  value,
  onChange,
  small,
}: {
  value: number;
  onChange: (n: number) => void;
  small?: boolean;
}) {
  const s = small ? "h-8 w-8" : "h-12 w-11";
  return (
    <div className="flex items-center rounded-full border border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(Math.max(small ? 0 : 1, value - 1))}
        className={`${s} grid place-items-center rounded-full hover:bg-muted`}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className={`${s} grid place-items-center rounded-full hover:bg-muted`}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
