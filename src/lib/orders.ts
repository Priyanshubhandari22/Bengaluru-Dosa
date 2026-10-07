export const ORDER_STEPS = [
  { id: "placed", label: "Order placed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
] as const;

export const statusLabel = (s: string) =>
  s === "cancelled" ? "Cancelled" : (ORDER_STEPS.find((x) => x.id === s)?.label ?? s);

export type OrderLine = {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  addons: string[];
  spice: string;
  notes: string;
};
