"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import colleges from "@/data/colleges.json";
import mapPaths from "@/data/us-map.json";
import { Container, PageHeader } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import {
  CHECKED_COLLEGE_FACTS,
  DEMONSTRATION_OPENINGS,
  OPENING_POSITIONS,
} from "@/lib/college-facts";
import { US_STATES } from "@/lib/profile-options";
import { cn } from "@/lib/format";

type DirectoryCollege = {
  id: string;
  name: string;
  state: string;
  control: "Public" | "Private" | null;
};

const DIRECTORY = colleges as DirectoryCollege[];
const PATHS = mapPaths as { id: string; d: string }[];
const BY_ID = new Map(DIRECTORY.map((college) => [college.id, college]));
const CONFERENCES = [...new Set(Object.values(CHECKED_COLLEGE_FACTS).map((fact) => fact.conference))].sort();

function stateLabel(code: string) {
  return US_STATES.find((state) => state.value === code)?.label ?? code;
}

function locationLine(college: DirectoryCollege) {
  const fact = CHECKED_COLLEGE_FACTS[college.id];
  if (fact) return `${fact.city}, ${college.state}`;
  return stateLabel(college.state);
}

export function FindColleges() {
  const router = useRouter();
  const params = useSearchParams();
  const schoolId = params.get("school");
  const { ready, board, addCollege } = useApp();
  const [tab, setTab] = useState<"colleges" | "openings">("colleges");
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [control, setControl] = useState<"any" | "Public" | "Private">("any");
  const [division, setDivision] = useState("any");
  const [conference, setConference] = useState("any");
  const [visibleCount, setVisibleCount] = useState(24);
  const [saveMessage, setSaveMessage] = useState("");
  const [openingPosition, setOpeningPosition] = useState("any");
  const [openingYear, setOpeningYear] = useState("any");
  const [openingState, setOpeningState] = useState("any");

  const selected = schoolId ? BY_ID.get(schoolId) : undefined;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DIRECTORY.filter((college) => {
      if (states.length > 0 && !states.includes(college.state)) return false;
      if (control !== "any" && college.control !== control) return false;
      const fact = CHECKED_COLLEGE_FACTS[college.id];
      if (division !== "any" && fact?.division !== division) return false;
      if (conference !== "any" && fact?.conference !== conference) return false;
      if (!needle) return true;
      return college.name.toLowerCase().includes(needle);
    });
  }, [conference, control, division, query, states]);

  const openings = useMemo(() => {
    return DEMONSTRATION_OPENINGS.filter((opening) => {
      const college = BY_ID.get(opening.collegeId);
      if (!college) return false;
      if (openingPosition !== "any" && opening.position !== openingPosition) return false;
      if (openingYear !== "any" && opening.gradYear !== openingYear) return false;
      if (openingState !== "any" && college.state !== openingState) return false;
      return true;
    });
  }, [openingPosition, openingState, openingYear]);

  function toggleState(code: string) {
    setVisibleCount(24);
    setStates((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  }

  function openSchool(id: string) {
    const next = new URLSearchParams(params.toString());
    next.set("school", id);
    router.push(`/find-colleges?${next.toString()}`, { scroll: false });
  }

  function clearSchool() {
    const next = new URLSearchParams(params.toString());
    next.delete("school");
    const queryString = next.toString();
    router.push(queryString ? `/find-colleges?${queryString}` : "/find-colleges", { scroll: false });
  }

  function saveCollege(college: DirectoryCollege) {
    const fact = CHECKED_COLLEGE_FACTS[college.id];
    const error = addCollege({
      name: college.name,
      location: locationLine(college),
      division: fact?.division ?? "",
      conference: fact?.conference ?? "",
      status: "interested",
      notes: "Saved from the college directory. NEXTUP did not contact this school.",
      contactDate: "",
      followUpDate: "",
    });
    setSaveMessage(error ?? `${college.name} saved to My Colleges.`);
  }

  const savedNames = new Set(board.colleges.map((college) => college.name.toLowerCase()));

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Directory"
        title="Find colleges"
        lede="Search degree-granting institutions by name and state. Names, states, and public or private control come from the IPEDS list collected February 2, 2023. This is not a ranking."
      />
      <div className="mt-6">
        <DemoNote>
          City, division, and conference show only for programs with a checked public fact. Roster openings on the
          second tab are demonstration data. NEXTUP does not list coach contacts.
        </DemoNote>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="College search">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "colleges"}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold",
            tab === "colleges" ? "bg-lime text-ink" : "border border-line text-paper",
          )}
          onClick={() => setTab("colleges")}
        >
          Search Colleges
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "openings"}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold",
            tab === "openings" ? "bg-lime text-ink" : "border border-line text-paper",
          )}
          onClick={() => setTab("openings")}
        >
          Search Roster Openings
        </button>
      </div>

      {tab === "colleges" ? (
        <div className="mt-6 space-y-6">
          <form
            className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(draftQuery);
              setVisibleCount(24);
            }}
          >
            <div className="flex-1">
              <Field label="College name" id="college-search">
                <input
                  id="college-search"
                  value={draftQuery}
                  onChange={(event) => setDraftQuery(event.target.value)}
                  className={inputClass}
                  placeholder="Search by name"
                />
              </Field>
            </div>
            <Button type="submit">Search</Button>
          </form>

          <section className="rounded-2xl border border-line bg-panel p-4" aria-labelledby="map-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="map-heading" className="font-display text-3xl uppercase text-paper">
                States
              </h2>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setStates(US_STATES.map((state) => state.value))}>
                  Select all
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setStates([])}>
                  Remove all
                </Button>
              </div>
            </div>
            <p className="mt-1 text-sm text-mist">
              {states.length === 0 ? "No state filter. Search covers the full directory." : `${states.length} selected.`}
            </p>
            <svg viewBox="0 0 959 593" className="mt-4 h-auto w-full" role="group" aria-label="United States map">
              {PATHS.map((path) => {
                const active = states.includes(path.id);
                return (
                  <path
                    key={path.id}
                    d={path.d}
                    tabIndex={0}
                    role="button"
                    aria-pressed={active}
                    aria-label={stateLabel(path.id)}
                    className="cursor-pointer outline-none focus-visible:stroke-lime"
                    fill={active ? "#3e74ff" : "#1a2438"}
                    stroke="#2a3548"
                    strokeWidth="1"
                    onClick={() => toggleState(path.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleState(path.id);
                      }
                    }}
                  />
                );
              })}
            </svg>
            <ul className="mt-4 grid max-h-64 grid-cols-2 gap-2 overflow-auto sm:grid-cols-3 lg:grid-cols-4">
              {US_STATES.map((state) => (
                <li key={state.value}>
                  <label className="flex items-center gap-2 text-sm text-paper">
                    <input
                      type="checkbox"
                      checked={states.includes(state.value)}
                      onChange={() => toggleState(state.value)}
                      className="size-4 accent-[#3e74ff]"
                    />
                    {state.label}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-3" aria-label="Filters">
            <Field label="Public or private" id="filter-control">
              <select
                id="filter-control"
                className={inputClass}
                value={control}
                onChange={(event) => {
                  setControl(event.target.value as typeof control);
                  setVisibleCount(24);
                }}
              >
                <option value="any">Any</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </Field>
            <Field label="Division, when checked" id="filter-division">
              <select
                id="filter-division"
                className={inputClass}
                value={division}
                onChange={(event) => {
                  setDivision(event.target.value);
                  setVisibleCount(24);
                }}
              >
                <option value="any">Any</option>
                <option value="NCAA Division I">NCAA Division I</option>
              </select>
            </Field>
            <Field label="Conference, when checked" id="filter-conference">
              <select
                id="filter-conference"
                className={inputClass}
                value={conference}
                onChange={(event) => {
                  setConference(event.target.value);
                  setVisibleCount(24);
                }}
              >
                <option value="any">Any</option>
                {CONFERENCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <p className="sm:col-span-3 text-xs leading-relaxed text-mist">
              Division and conference filters use the checked facts only. Most rows do not list either one. Reset
              clears those filters and keeps the states you selected.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setControl("any");
                setDivision("any");
                setConference("any");
                setVisibleCount(24);
              }}
            >
              Reset filters
            </Button>
          </section>

          {selected ? (
            <CollegeDetail
              college={selected}
              saved={savedNames.has(selected.name.toLowerCase())}
              ready={ready}
              message={saveMessage}
              onBack={clearSchool}
              onSave={() => saveCollege(selected)}
            />
          ) : null}

          <section aria-labelledby="results-heading">
            <h2 id="results-heading" className="font-display text-3xl uppercase text-paper">
              Results
            </h2>
            <p className="mt-1 text-sm text-mist">{results.length} colleges</p>
            {results.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No colleges match" body="Try another name, clear a filter, or remove a state." />
              </div>
            ) : (
              <ul className="mt-4 grid gap-3">
                {results.slice(0, visibleCount).map((college) => {
                  const fact = CHECKED_COLLEGE_FACTS[college.id];
                  return (
                    <li key={college.id} className="rounded-2xl border border-line bg-panel p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-paper">{college.name}</h3>
                          <p className="mt-1 text-sm text-mist">
                            {locationLine(college)}
                            {college.control ? ` · ${college.control}` : ""}
                            {fact ? ` · ${fact.division} · ${fact.conference}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" size="sm" onClick={() => openSchool(college.id)}>
                            View
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={!ready || savedNames.has(college.name.toLowerCase())}
                            onClick={() => saveCollege(college)}
                          >
                            {savedNames.has(college.name.toLowerCase()) ? "Saved" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {visibleCount < results.length ? (
              <Button type="button" variant="secondary" className="mt-4" onClick={() => setVisibleCount((count) => count + 24)}>
                Show more
              </Button>
            ) : null}
            {saveMessage ? (
              <p role="status" className="mt-3 text-sm text-lime">
                {saveMessage}
              </p>
            ) : null}
          </section>
        </div>
      ) : (
        <section className="mt-6 space-y-4" aria-labelledby="openings-heading">
          <h2 id="openings-heading" className="font-display text-3xl uppercase text-paper">
            Demonstration openings
          </h2>
          <DemoNote>
            Every card below is a sample roster spot for the layout. It is not a live opening, and there is no coach
            contact.
          </DemoNote>
          <div className="grid gap-3 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-3">
            <Field label="Position" id="opening-position">
              <select id="opening-position" className={inputClass} value={openingPosition} onChange={(event) => setOpeningPosition(event.target.value)}>
                <option value="any">Any</option>
                {OPENING_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Class year" id="opening-year">
              <select id="opening-year" className={inputClass} value={openingYear} onChange={(event) => setOpeningYear(event.target.value)}>
                <option value="any">Any</option>
                {["2026", "2027", "2028", "2029"].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State" id="opening-state">
              <select id="opening-state" className={inputClass} value={openingState} onChange={(event) => setOpeningState(event.target.value)}>
                <option value="any">Any</option>
                {US_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {openings.length === 0 ? (
            <EmptyState title="No demonstration openings" body="Change the position, class year, or state." />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {openings.map((opening) => {
                const college = BY_ID.get(opening.collegeId);
                if (!college) return null;
                const fact = CHECKED_COLLEGE_FACTS[college.id];
                return (
                  <li key={opening.id} className="rounded-2xl border border-line bg-panel p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Demonstration</p>
                    <h3 className="mt-2 text-lg font-semibold text-paper">{college.name}</h3>
                    <p className="mt-1 text-sm text-mist">
                      {locationLine(college)}
                      {fact ? ` · ${fact.division} · ${fact.conference}` : ""}
                    </p>
                    <p className="mt-3 text-sm text-paper">
                      Position {opening.position} · Class of {opening.gradYear} · Status: demonstration
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-mist">
                      Not a live roster spot. No coach email or phone is attached.
                    </p>
                    <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => {
                      setTab("colleges");
                      openSchool(college.id);
                    }}>
                      View program
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </Container>
  );
}

function CollegeDetail({
  college,
  saved,
  ready,
  message,
  onBack,
  onSave,
}: {
  college: DirectoryCollege;
  saved: boolean;
  ready: boolean;
  message: string;
  onBack: () => void;
  onSave: () => void;
}) {
  const fact = CHECKED_COLLEGE_FACTS[college.id];
  return (
    <article className="rounded-2xl border border-line bg-navy p-5" aria-labelledby="college-detail-heading">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-lime">
        Back to results
      </button>
      <h2 id="college-detail-heading" className="mt-3 font-display text-4xl uppercase text-paper">
        {college.name}
      </h2>
      <p className="mt-2 text-sm text-mist">{locationLine(college)}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-mist">Control</dt>
          <dd className="text-paper">{college.control ?? "Not listed"}</dd>
        </div>
        <div>
          <dt className="text-mist">State</dt>
          <dd className="text-paper">{stateLabel(college.state)}</dd>
        </div>
        <div>
          <dt className="text-mist">Division</dt>
          <dd className="text-paper">{fact?.division ?? "Not listed"}</dd>
        </div>
        <div>
          <dt className="text-mist">Conference</dt>
          <dd className="text-paper">{fact?.conference ?? "Not listed"}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        Tuition, roster, and coaching staff are not included. NEXTUP does not invent those and does not contact the
        school.
      </p>
      <Button type="button" className="mt-4" disabled={!ready || saved} onClick={onSave}>
        {saved ? "Saved to My Colleges" : "Save to My Colleges"}
      </Button>
      {message ? (
        <p role="status" className="mt-3 text-sm text-lime">
          {message}
        </p>
      ) : null}
    </article>
  );
}
