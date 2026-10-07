import type { ReactNode } from "react";
import { foodImage } from "@/lib/images";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="container-x grid min-h-[80vh] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden rounded-[2rem] lg:block">
        <img src={foodImage("signature")} alt="" className="aspect-[4/5] w-full object-cover" />
        <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-card/90 p-5 backdrop-blur">
          <p className="font-display text-xl">"Best benne dosa outside Davangere."</p>
          <p className="mt-1 text-sm text-muted-foreground">— 12,000+ happy Bengalureans</p>
        </div>
      </div>
    </div>
  );
}

export const authField =
  "mt-1 h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none focus:border-primary";
export const authBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-saffron font-bold text-primary-foreground shadow-soft disabled:opacity-60";
