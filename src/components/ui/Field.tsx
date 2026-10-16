import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export const inputClass =
  "w-full rounded-xl border border-line bg-navy px-3 py-2.5 text-sm text-paper outline-none transition placeholder:text-mist/70 focus-visible:border-lime";

export function Field({
  label,
  id,
  error,
  hint,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-paper">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cn("text-sm text-mist")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
