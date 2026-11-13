"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Star } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { SchoolMark } from "@/components/colleges/SchoolMark";
import { DemoNote } from "@/components/ui/DemoNote";
import { schoolLogo } from "@/lib/school-logo";
import { Field, inputClass } from "@/components/ui/Field";
import { verifiedStaff, type VerifiedCoach } from "@/lib/basketball-staff";
import { DEMONSTRATION_OPENINGS, publishedCollegeFact } from "@/lib/college-facts";
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

function roleLabel(role: VerifiedCoach["role"]) {
  return role === "head" ? "Head coach" : "Assistant coach";
}

function coachKey(coach: VerifiedCoach) {
  return `${coach.name}\n${coach.email}`;
}

function mailtoFor(coach: VerifiedCoach, subject: string, message: string) {
  const parts: string[] = [];
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  if (trimmedSubject) parts.push(`subject=${encodeURIComponent(trimmedSubject)}`);
  if (trimmedMessage) parts.push(`body=${encodeURIComponent(trimmedMessage)}`);
  return `mailto:${coach.email}${parts.length ? `?${parts.join("&")}` : ""}`;
}

export function CollegePage({ college }: { college: DirectoryCollege }) {
  const { ready, board, addCollege, updateCollege } = useApp();
  const [tab, setTab] = useState<TabId>("recruiting");
  const [message, setMessage] = useState("");
  const [composing, setComposing] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");

  const fact = publishedCollegeFact(college.id);
  const sample = sampleMetrics(college.id, college.control);
  const opening = DEMONSTRATION_OPENINGS.find((item) => item.collegeId === college.id);
  const staff = verifiedStaff(college.id);
  const saved = board.colleges.find((item) => item.name.toLowerCase() === college.name.toLowerCase());
  const place = fact ? `${fact.city}, ${stateName(college.state)}` : `City not listed · ${stateName(college.state)}`;
  const division = fact?.division ?? "Division not listed";
  const conference = fact?.conference ?? "Not listed";
  const control = college.control ?? "Not listed";
  const selected = staff.find((coach) => coachKey(coach) === selectedKey) ?? staff.find((coach) => coach.role === "head") ?? staff[0];

  useEffect(() => {
    if (!composing) return;
    document.getElementById("coach-email-subject")?.focus();
  }, [composing]);

  function entryFields(favorite: boolean) {
    return {
      name: college.name,
      location: collegeLocation(college),
      division: fact?.division ?? "",
      conference: fact?.conference ?? "",
      status: "interested" as const,
      notes: "",
      contactDate: "",
      followUpDate: "",
      favorite,
    };
  }

  function saveFavorite() {
    if (!saved) {
      const error = addCollege(entryFields(true));
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

  function openCompose() {
    if (!selected) return;
    setSelectedKey(coachKey(selected));
    setComposing(true);
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
        <div className="mt-6 flex flex-wrap items-center gap-3">
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
          {staff.length ? (
            <Button
              type="button"
              variant="secondary"
              aria-expanded={composing}
              aria-controls="email-coach"
              onClick={() => (composing ? setComposing(false) : openCompose())}
            >
              <Mail className="size-4" aria-hidden="true" />
              Email coach
            </Button>
          ) : (
            <Button type="button" variant="secondary" disabled>
              No coach email is published
            </Button>
          )}
        </div>
        {saved ? <p className="mt-4 text-sm text-mist">On My Colleges.</p> : null}
        {message ? (
          <p role="status" className="mt-3 text-sm text-lime">
            {message}
          </p>
        ) : null}
      </header>

      {composing && selected ? (
        <section
          id="email-coach"
          aria-labelledby="email-coach-title"
          className="mt-6 overflow-hidden rounded-2xl border border-line bg-navy"
        >
          <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="border-b border-line bg-ink p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3">
                <SchoolMark name={college.name} logo={schoolLogo(college.id)} />
                <div className="min-w-0">
                  <p className="font-display text-2xl uppercase leading-none text-paper">{college.name}</p>
                  <p className="mt-2 text-sm text-mist">{place}</p>
                </div>
              </div>
              <p id="email-coach-coaches" className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-lime">
                Coach
              </p>
              <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto lg:max-h-[28rem]" aria-labelledby="email-coach-coaches">
                {staff.map((coach) => {
                  const active = coachKey(coach) === coachKey(selected);
                  const title = coach.title.toLowerCase() !== roleLabel(coach.role).toLowerCase() ? coach.title : null;
                  return (
                    <li key={coachKey(coach)}>
                      <button
                        type="button"
                        aria-pressed={active}
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-left",
                          active ? "border-lime bg-lime/10" : "border-line hover:border-lime",
                        )}
                        onClick={() => setSelectedKey(coachKey(coach))}
                      >
                        <span className="block font-semibold text-paper">{coach.name}</span>
                        <span className="mt-0.5 block text-sm text-mist">{roleLabel(coach.role)}</span>
                        {title ? <span className="block text-sm text-mist">{title}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
            <form
              className="flex flex-col gap-4 p-5 sm:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                window.location.href = mailtoFor(selected, subject, draft);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 id="email-coach-title" className="font-display text-3xl uppercase text-paper">
                  Email coach
                </h2>
                <Button type="button" variant="ghost" size="sm" onClick={() => setComposing(false)}>
                  Close
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-mist">To</span>
                <span className="inline-flex max-w-full items-center rounded-full border border-line bg-panel px-3 py-1 text-sm font-semibold text-paper">
                  <span className="truncate">{selected.name}</span>
                </span>
                <span className="break-all text-sm text-mist">{selected.email}</span>
              </div>
              <Field label="Subject" id="coach-email-subject">
                <input
                  id="coach-email-subject"
                  className={inputClass}
                  value={subject}
                  maxLength={200}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </Field>
              <Field label="Message" id="coach-email-message">
                <textarea
                  id="coach-email-message"
                  className={cn(inputClass, "min-h-36 resize-y")}
                  value={draft}
                  maxLength={4000}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </Field>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm leading-relaxed text-mist">
                  Send opens your email app with this coach's published address. NEXTUP does not send the message.
                </p>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink hover:bg-lime-2"
                  href={mailtoFor(selected, subject, draft)}
                >
                  Send
                </a>
              </div>
            </form>
          </div>
        </section>
      ) : null}

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
                  const showTitle = coach.title.toLowerCase() !== roleLabel(coach.role).toLowerCase();
                  return (
                    <li key={coachKey(coach)} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                      <p className="font-semibold text-paper">{coach.name}</p>
                      <p className="mt-1 text-sm text-mist">{roleLabel(coach.role)}</p>
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
