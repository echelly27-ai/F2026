import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{eyebrow}</p>
      <h1 className="mt-2 font-display text-5xl uppercase leading-[0.9] text-paper sm:text-6xl">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-mist">{lede}</p>
    </header>
  );
}
