import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel px-6 py-10 text-center">
      <h2 className="font-display text-3xl uppercase text-paper">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
