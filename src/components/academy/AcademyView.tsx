"use client";

import { useMemo, useState } from "react";
import { Container, PageHeader } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { inputClass } from "@/components/ui/Field";

const ARTICLES = [
  {
    category: "How recruiting works",
    title: "The work is yours",
    body: "Build one profile, add film you control, list schools you are researching, and write down the dates you reach out. NXTUP Academy explains those steps. It does not contact coaches for you.",
  },
  {
    category: "NCAA divisions",
    title: "Division is a rulebook, not a ranking",
    body: "NCAA Division I, II, and III are different sets of rules for scholarships, seasons, and eligibility. Read the current NCAA guide before you treat a division label as a promise.",
  },
  {
    category: "Eligibility",
    title: "Eligibility starts with your coursework",
    body: "Core courses, grades, and amateur status are checked by the association you are entering. Keep your own transcript notes. This page does not certify eligibility.",
  },
  {
    category: "NAIA and JUCO",
    title: "NAIA and junior colleges are separate paths",
    body: "NAIA and two-year colleges use their own eligibility rules. If you are comparing them with the NCAA, use each association's published guide rather than a shortcut.",
  },
  {
    category: "Contacting coaches",
    title: "You send the message",
    body: "A short note with your profile and film is something you send. Record the date on your tracker. NEXTUP does not email programs and does not assign a coach to do it.",
  },
  {
    category: "Highlight video",
    title: "Keep the film link with the profile",
    body: "Paste a YouTube or Hudl link you control. A highlight is useful when the measurable facts sit next to it. The link is not a scholarship offer.",
  },
  {
    category: "Scholarships",
    title: "Aid is decided by the school",
    body: "Athletic aid, academic aid, and need-based aid are awarded by the institution. A directory listing is not an offer and does not estimate your package.",
  },
  {
    category: "Applications",
    title: "The application is separate from the sports note",
    body: "Admissions forms, deadlines, and transcripts belong to the college. Track the date you applied in My Colleges. NEXTUP does not submit the application.",
  },
  {
    category: "Timelines",
    title: "Use dates you choose",
    body: "Follow-up dates are reminders you set after you reach out. They are not a coach's calendar and they are not a signing deadline.",
  },
  {
    category: "International athletes",
    title: "Ask the school about academic records",
    body: "Transcripts, English testing, and amateurism reviews vary by destination. Bring the documents the school lists. This guide does not replace that school's international office.",
  },
] as const;

export function AcademyView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(ARTICLES.map((article) => article.category)))];
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      if (category !== "All" && article.category !== category) return false;
      if (!needle) return true;
      return `${article.title} ${article.body} ${article.category}`.toLowerCase().includes(needle);
    });
  }, [category, query]);

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="NXTUP Academy"
        title="Recruiting lessons"
        lede="Short original notes on the steps you do yourself. NEXTUP does not contact coaches or file applications for you."
      />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={inputClass}
          placeholder="Search lessons"
          aria-label="Search lessons"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={inputClass}
          aria-label="Lesson category"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No lessons match" body="Try another word or show every category." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((article) => (
            <article key={article.title} className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{article.category}</p>
              <h2 className="mt-2 text-xl font-semibold text-paper">{article.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">{article.body}</p>
            </article>
          ))}
        </div>
      )}
      <ButtonLink href="/profile#profile-editor" className="mt-6">
        Build your profile
      </ButtonLink>
    </Container>
  );
}
