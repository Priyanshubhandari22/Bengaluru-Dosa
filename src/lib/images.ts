import masala from "@/assets/food/masala.jpg";
import plain from "@/assets/food/plain.jpg";
import cheese from "@/assets/food/cheese.jpg";
import paneer from "@/assets/food/paneer.jpg";
import signature from "@/assets/food/signature.jpg";
import mysore from "@/assets/food/mysore.jpg";
import set from "@/assets/food/set.jpg";
import rava from "@/assets/food/rava.jpg";
import combo from "@/assets/food/combo.jpg";
import coffee from "@/assets/food/coffee.jpg";
import chutney from "@/assets/food/chutney.jpg";

const map: Record<string, string> = {
  masala,
  plain,
  cheese,
  paneer,
  signature,
  mysore,
  set,
  rava,
  combo,
  coffee,
  chutney,
};

/** Resolves a menu image_key (or a full URL uploaded later by an admin) to a src. */
export function foodImage(key: string | null | undefined): string {
  if (!key) return masala;
  if (key.startsWith("http")) return key;
  return map[key] ?? masala;
}
