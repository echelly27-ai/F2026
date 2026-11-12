"use client";

import { useApp } from "@/components/providers/AppProviders";

export function RecruitingChecklist() {
  const { board, toggleChecklist } = useApp();

  return (
    <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="checklist-heading">
      <h2 id="checklist-heading" className="font-display text-4xl uppercase text-paper">
        Recruiting checklist
      </h2>
      <p className="mt-2 text-sm text-mist">Checking an item updates this list and stays on this device.</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {board.checklist.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-line bg-navy px-3 py-3">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-lime"
                checked={item.done}
                onChange={() => toggleChecklist(item.id)}
              />
              <span>
                <span className={item.done ? "text-sm font-medium text-mist line-through" : "text-sm font-medium text-paper"}>
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-mist">{item.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
