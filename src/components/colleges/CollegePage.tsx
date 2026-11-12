"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { SchoolMark } from "@/components/colleges/SchoolMark";
import { DemoNote } from "@/components/ui/DemoNote";
import { schoolLogo } from "@/lib/school-logo";
import { Field, inputClass } from "@/components/ui/Field";
import { verifiedStaff } from "@/lib/basketball-staff";
import { CHECKED_COLLEGE_FACTS, DEMONSTRATION_OPENINGS } from "@/lib/college-facts";
import {
  collegeLocation,
  collegeSearchParams,
  formatSampleCount,
  formatSampleDollars,
  parseCollegeSearch,
  sampleMetrics,
  stateName,
  type DirectoryCollege,
} from "@/lib/college-results";
import { cn } from "@/lib/format";

const TABS = [
  { id: "recruiting", label: "Recruiting" },
  { id: "overview", label: "Overview" },
  { id: "academics", label: "Academics" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CollegePage({ college }: { college: DirectoryCollege }) {
  const { ready, board, addCollege, updateCollege } = useApp();
  const [tab, setTab] = useState<TabId>("recruiting");
  const [draft, setDraft] = useState("");
  const [syncedKey, setSyncedKey] = useState("");
  const [message, setMessage] = useState("");

  const fact = CHECKED_COLLEGE_FACTS[college.id];
  const sample = sampleMetrics(college.id, college.control);
  const opening = DEMONSTRATION_OPENINGS.find((item) => item.collegeId === college.id);
  const staff = verifiedStaff(college.id);
  const saved = board.colleges.find((item) => item.name.toLowerCase() === college.name.toLowerCase());
  const place = fact ? `${fact.city}, ${stateName(college.state)}` : `City not listed · ${stateName(college.state)}`;
  const division = fact?.division ?? "Division not listed";
  const conference = fact?.conference ?? "Not listed";
  const control = college.control ?? "Not listed";
  const noteSaved = (saved?.notes ?? "").trim();
  const noteDirty = draft.trim() !== noteSaved;
  const savedKey = ready ? `${saved?.id ?? "new"}:${saved?.notes ?? ""}` : "";
  if (savedKey && savedKey !== syncedKey) {
    setSyncedKey(savedKey);
    setDraft(saved?.notes ?? "");
  }

  function entryFields(notes: string, favorite: boolean) {
    return {
      name: college.name,
      location: collegeLocation(college),
      division: fact?.division ?? "",
      conference: fact?.conference ?? "",
      status: "interested" as const,
      notes,
      contactDate: "",
      followUpDate: "",
      favorite,
    };
  }

  function saveFavorite() {
    if (!saved) {
      const error = addCollege(entryFields(draft.trim(), true));
      setMessage(error ?? `Saved ${college.name} to My Colleges.`);
      return;
    }
    updateCollege(
      saved.id,
      { favorite: !saved.favorite },
      saved.favorite ? `Cleared the favorite on ${college.name}.` : `Saved ${college.name} as a favorite.`,
    );
    setMessage(saved.favorite ? `Cleared the favorite on ${college.name}.` : `Saved ${college.name} to My Colleges.`);
  }

  function saveNote() {
    const notes = draft.trim();
    if (saved) {
      updateCollege(saved.id, { notes }, notes ? `Updated the note for ${college.name}.` : `Cleared the note for ${college.name}.`);
      setMessage("Note saved on your board.");
      return;
    }
    if (!notes) return;
    const error = addCollege(entryFields(notes, false));
    setMessage(error ?? "Note saved on your board.");
  }

  return (
    <Container className="py-10 sm:py-14">
      <Suspense fallback={<ResultsLink href="/find-colleges/results" />}>
        <ResultsBackLink />
      </Suspense>
      <header className="mt-4 rounded-2xl border border-line bg-navy p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <SchoolMark name={college.name} logo={schoolLogo(college.id)} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-5xl uppercase leading-[0.9] text-paper sm:text-6xl">{college.name}</h1>
            <p className="mt-3 text-base text-mist">{place}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-lime">{division}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start">
          <Button
            type="button"
            disabled={!ready}
            aria-pressed={Boolean(saved?.favorite)}
            aria-label={saved?.favorite ? `Saved ${college.name}` : `Save ${college.name} as a favorite`}
            onClick={saveFavorite}
          >
            <Star className="size-4" fill={saved?.favorite ? "currentColor" : "none"} aria-hidden="true" />
            {saved?.favorite ? "Saved" : "Save"}
          </Button>
          <form
            className="w-full max-w-xl"
            onSubmit={(event) => {
              event.preventDefault();
              saveNote();
            }}
          >
            <Field label="Note" id="college-note" hint="Saved on your board with this college.">
              <textarea
                id="college-note"
                className={cn(inputClass, "min-h-24 resize-y")}
                value={draft}
                maxLength={500}
                disabled={!ready}
                onChange={(event) => setDraft(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="secondary" className="mt-3" disabled={!ready || !noteDirty}>
              Save note
            </Button>
          </form>
        </div>
        {saved ? <p className="mt-4 text-sm text-mist">On My Colleges.</p> : null}
        {message ? (
          <p role="status" className="mt-3 text-sm text-lime">
            {message}
          </p>
        ) : null}
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="College sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === item.id ? "bg-lime text-ink" : "border border-line text-paper",
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "recruiting" ? (
        <section
          id="panel-recruiting"
          role="tabpanel"
          aria-labelledby="tab-recruiting"
          className="mt-4 rounded-2xl border border-line bg-panel p-5"
        >
          <h2 className="font-display text-3xl uppercase text-paper">Recruiting</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <Fact label="Sport" value="Basketball" />
            <Fact label="Division" value={fact?.division ?? "Not listed"} />
            <Fact label="Conference" value={conference} />
            <Fact label="Public or private" value={control} />
            <Fact label="Athletic selectivity" value={sample.athletic} sample />
          </dl>
          {opening ? (
            <p className="mt-4 text-sm text-paper">
              Sample roster mark: {opening.position}, class of {opening.gradYear}. Not a live opening.
            </p>
          ) : null}
          <div className="mt-6 rounded-xl border border-line bg-navy p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-paper">Coaching staff</h3>
            {staff.length ? (
              <ul className="mt-4 space-y-4">
                {staff.map((coach) => {
                  const roleLabel = coach.role === "head" ? "Head coach" : "Assistant coach";
                  const showTitle = coach.title.toLowerCase() !== roleLabel.toLowerCase();
                  return (
                    <li key={`${coach.name}-${coach.email}`} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                      <p className="font-semibold text-paper">{coach.name}</p>
                      <p className="mt-1 text-sm text-mist">{roleLabel}</p>
                      {showTitle ? <p className="text-sm text-mist">{coach.title}</p> : null}
                      <a className="mt-1 inline-block text-sm font-semibold text-lime" href={`mailto:${coach.email}`}>
                        {coach.email}
                      </a>
                      <p className="mt-1 break-all text-xs text-mist">
                        Source{" "}
                        <a className="text-lime" href={coach.sourceUrl} rel="noreferrer">
                          {coach.sourceUrl}
                        </a>
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-mist">Staff contacts are not published here.</p>
            )}
          </div>
          <div className="mt-4">
            <DemoNote>
              Athletic selectivity is a sample. It is not a coach rating, and a roster mark is not a live opening.
            </DemoNote>
          </div>
        </section>
      ) : null}

      {tab === "overview" ? (
        <section
          id="panel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
          className="mt-4 rounded-2xl border border-line bg-panel p-5"
        >
          <h2 className="font-display text-3xl uppercase text-paper">Overview</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <Fact label="College" value={college.name} />
            <Fact label="City" value={fact?.city ?? "Not listed"} />
            <Fact label="State" value={stateName(college.state)} />
            <Fact label="Public or private" value={control} />
            <Fact label="Division" value={fact?.division ?? "Not listed"} />
            <Fact label="Conference" value={conference} />
          </dl>
        </section>
      ) : null}

      {tab === "academics" ? (
        <section
          id="panel-academics"
          role="tabpanel"
          aria-labelledby="tab-academics"
          className="mt-4 rounded-2xl border border-line bg-panel p-5"
        >
          <h2 className="font-display text-3xl uppercase text-paper">Academics</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <Fact label="Academic selectivity" value={sample.academic} sample />
            <Fact label="In-state tuition" value={formatSampleDollars(sample.inStateTuition)} sample />
            <Fact label="Out-of-state tuition" value={formatSampleDollars(sample.outStateTuition)} sample />
            <Fact label="Undergraduate enrollment" value={formatSampleCount(sample.enrollment)} sample />
          </dl>
          <div className="mt-4">
            <DemoNote>
              Academic selectivity, tuition, and undergraduate enrollment are samples. They are not this school’s
              published costs or admission rates.
            </DemoNote>
          </div>
        </section>
      ) : null}
    </Container>
  );
}

function ResultsBackLink() {
  const params = useSearchParams();
  const backQuery = collegeSearchParams(parseCollegeSearch(params)).toString();
  const href = backQuery ? `/find-colleges/results?${backQuery}` : "/find-colleges/results";
  return <ResultsLink href={href} />;
}

function ResultsLink({ href }: { href: string }) {
  return (
    <Link href={href} className="text-sm font-semibold text-lime">
      Back to results
    </Link>
  );
}

function Fact({ label, value, sample = false }: { label: string; value: string; sample?: boolean }) {
  return (
    <div>
      <dt className="text-mist">
        {label}
        {sample ? <span className="text-lime"> (sample)</span> : null}
      </dt>
      <dd className="mt-1 text-paper">{value}</dd>
    </div>
  );
}
