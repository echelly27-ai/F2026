"use client";

import { useEffect, useState } from "react";
import { Container, PageHeader } from "@/components/layout/Container";
import { DemoNote } from "@/components/ui/DemoNote";

const STORAGE_KEY = "nextup-development-v1";

const CATEGORIES = [
  {
    title: "Shooting",
    items: [
      { id: "shoot-form", label: "Sample form shooting checklist" },
      { id: "shoot-spots", label: "Sample spot-up shooting checklist" },
    ],
  },
  {
    title: "Ball handling",
    items: [
      { id: "handle-weak", label: "Sample weak-hand dribble checklist" },
      { id: "handle-change", label: "Sample change-of-direction checklist" },
    ],
  },
  {
    title: "Finishing",
    items: [
      { id: "finish-touch", label: "Sample finishing-touch checklist" },
      { id: "finish-contact", label: "Sample contact-layup checklist" },
    ],
  },
  {
    title: "Defense",
    items: [
      { id: "defense-stance", label: "Sample stance and slide checklist" },
      { id: "defense-closeout", label: "Sample closeout checklist" },
    ],
  },
  {
    title: "Strength",
    items: [{ id: "strength-session", label: "Sample strength session checklist" }],
  },
  {
    title: "Athletic development",
    items: [{ id: "athletic-jump", label: "Sample jump and first-step checklist" }],
  },
  {
    title: "Basketball IQ",
    items: [{ id: "iq-reads", label: "Sample read-and-react checklist" }],
  },
  {
    title: "Film study",
    items: [{ id: "film-notes", label: "Sample film-notes checklist" }],
  },
  {
    title: "Workout plans",
    items: [{ id: "plan-week", label: "Sample weekly plan checklist" }],
  },
] as const;

const ITEM_IDS = CATEGORIES.flatMap((category) => category.items.map((item) => item.id));

function loadDone() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && ITEM_IDS.includes(item as (typeof ITEM_IDS)[number]));
  } catch {
    return [];
  }
}

export function DevelopmentView() {
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(loadDone());
    setReady(true);
  }, []);

  function toggle(id: string) {
    setDone((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Player development"
        title="Practice checks"
        lede="Sample workout checks you can mark off on this device. They are placeholders, not filmed sessions or measured progress."
      />
      <div className="mt-6">
        <DemoNote>
          {ready ? `${done.length} of ${ITEM_IDS.length} sample checks marked.` : "Loading your saved checks."} Nothing
          here is a test result.
        </DemoNote>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {CATEGORIES.map((category) => (
          <section key={category.title} className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-display text-3xl uppercase text-paper">{category.title}</h2>
            <ul className="mt-3 space-y-2">
              {category.items.map((item) => (
                <li key={item.id}>
                  <label className="flex items-start gap-3 text-sm text-paper">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-[#3e74ff]"
                      checked={done.includes(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <span>
                      {item.label}
                      <span className="mt-1 block text-mist">No video is attached. Check it when you do the work.</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
