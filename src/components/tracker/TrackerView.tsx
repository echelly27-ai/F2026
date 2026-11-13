"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { SignedOutState } from "@/components/auth/SignedOutState";
import { SchoolMark } from "@/components/colleges/SchoolMark";
import { Container, PageHeader } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { directoryCollegeByName } from "@/lib/college-results";
import { formatDate } from "@/lib/format";
import { schoolLogo } from "@/lib/school-logo";
import type { CollegeEntry, RecruitStatus } from "@/lib/types";
import { DIVISIONS, STATUSES } from "@/lib/types";
import { validateCollege } from "@/lib/validate";

const STATUS_LABEL: Record<RecruitStatus, string> = {
  interested: "Interested",
  contacted: "Contacted",
  evaluating: "Evaluating",
};

const SAMPLE_LINES = [
  "Sample view counted for this row. Not a visit by a program.",
  "Sample search counted for this row. Not someone looking up your file.",
  "Sample follow counted for this row. Not a program following you.",
  "Sample open counted for this row. Not a message that was opened.",
] as const;

type SortKey = "name" | "division" | "views" | "searches" | "follows" | "opens";

function sampleHash(id: string) {
  let hash = 0;
  for (const char of id) hash = (Math.imul(hash, 33) + char.charCodeAt(0)) >>> 0;
  return hash;
}

function sampleActivity(college: CollegeEntry) {
  const hash = sampleHash(college.id);
  return {
    line: SAMPLE_LINES[hash % SAMPLE_LINES.length],
    views: hash % 5,
    searches: Math.floor(hash / 8) % 4,
    follows: Math.floor(hash / 64) % 3,
    opens: Math.floor(hash / 512) % 3,
  };
}

const EMPTY_FORM = {
  name: "",
  location: "",
  division: "",
  conference: "",
  status: "interested" as RecruitStatus,
  notes: "",
  contactDate: "",
  followUpDate: "",
};

export function TrackerView() {
  const { ready, session, board, addCollege, updateCollege, removeCollege, restoreCollege } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RecruitStatus | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [undo, setUndo] = useState<CollegeEntry | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = board.colleges.filter((college) => {
      if (favoritesOnly && !college.favorite) return false;
      if (statusFilter !== "all" && college.status !== statusFilter) return false;
      if (!needle) return true;
      return [college.name, college.location, college.conference, college.notes, college.division]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return rows.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "division") return (a.division || "zzz").localeCompare(b.division || "zzz") || a.name.localeCompare(b.name);
      const left = sampleActivity(a)[sortKey];
      const right = sampleActivity(b)[sortKey];
      return right - left || a.name.localeCompare(b.name);
    });
  }, [board.colleges, favoritesOnly, query, sortKey, statusFilter]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  if (!session) {
    return <SignedOutState pageTitle="My Colleges" />;
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="My Colleges"
        title="My Colleges"
        lede="Schools you save from Find Colleges. Interested, Contacted, and Evaluating still sort the same list."
      />
      <div className="mt-6">
        <DemoNote>
          The activity on this page is a sample. Counts are not coach actions. No coach name, email, or opened message
          is attached to a school.
        </DemoNote>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
          <Field label="Search your list" id="tracker-search">
            <input
              id="tracker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={inputClass}
              placeholder="School, city, conference, or note"
            />
          </Field>
          </div>
          <div className="w-full sm:w-48">
          <Field label="Sort" id="college-sort">
            <select
              id="college-sort"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className={inputClass}
            >
              <option value="name">Name</option>
              <option value="division">Division</option>
              <option value="views">Views</option>
              <option value="searches">Searches</option>
              <option value="follows">Follows</option>
              <option value="opens">Opens</option>
            </select>
          </Field>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-paper">
          <input
            id="favorites-only"
            type="checkbox"
            className="size-4 accent-[#3e74ff]"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          Favorites only
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {(["all", ...STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? "rounded-full bg-lime px-3 py-2 text-sm font-semibold text-ink"
                  : "rounded-full border border-line px-3 py-2 text-sm font-semibold text-paper"
              }
            >
              {status === "all" ? "All" : STATUS_LABEL[status]}
            </button>
          ))}
        </div>

      {undo ? (
        <p role="status" className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 text-sm text-mist">
          Removed {undo.name}.
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              restoreCollege(undo);
              setUndo(null);
            }}
          >
            Undo
          </Button>
        </p>
      ) : null}

      {board.colleges.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No colleges yet"
            body="Search on Find Colleges and save a school. It will show up on this list."
            action={<ButtonLink href="/find-colleges">Find Colleges</ButtonLink>}
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nothing matches"
            body="No schools match that filter. Clear it to see the full list."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setFavoritesOnly(false);
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3" aria-label="Colleges">
          {visible.map((college) => {
            const activity = sampleActivity(college);
            const place = college.location.trim() || "City and state not listed";
            const division = college.division.trim() || "Division not listed";
            const directory = directoryCollegeByName(college.name, college.location);
            return (
              <li key={college.id} className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={college.favorite ? "mt-1 text-lime" : "mt-1 text-mist"}
                    aria-pressed={Boolean(college.favorite)}
                    aria-label={college.favorite ? `Remove ${college.name} from favorites` : `Save ${college.name} as a favorite`}
                    disabled={!ready}
                    onClick={() =>
                      updateCollege(
                        college.id,
                        { favorite: !college.favorite },
                        college.favorite
                          ? `Removed ${college.name} from favorites.`
                          : `Saved ${college.name} as a favorite.`,
                      )
                    }
                  >
                    <Star className="size-5" fill={college.favorite ? "currentColor" : "none"} aria-hidden="true" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        {directory ? (
                          <Link
                            href={`/find-colleges/${directory.id}`}
                            className="flex min-w-0 items-center gap-3 text-paper hover:text-lime"
                          >
                            <SchoolMark name={college.name} logo={schoolLogo(directory.id)} />
                            <h2 className="text-lg font-semibold">{college.name}</h2>
                          </Link>
                        ) : (
                          <h2 className="text-lg font-semibold text-paper">{college.name}</h2>
                        )}
                        <p className="mt-1 text-sm text-mist">
                          {division} · {place}
                        </p>
                        <p className="mt-2 text-sm text-paper">{activity.line}</p>
                      </div>
                      <dl className="grid grid-cols-4 gap-3 text-center">
                        {(
                          [
                            ["Views", activity.views],
                            ["Searches", activity.searches],
                            ["Follows", activity.follows],
                            ["Opens", activity.opens],
                          ] as const
                        ).map(([label, value]) => (
                          <div key={label}>
                            <dt className="text-xs uppercase tracking-[0.14em] text-mist">{label}</dt>
                            <dd className="mt-1 text-lg font-semibold text-paper">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <Field label="Status" id={`status-${college.id}`}>
                        <select
                          id={`status-${college.id}`}
                          value={college.status}
                          className={inputClass}
                          onChange={(event) => {
                            const next = event.target.value as RecruitStatus;
                            updateCollege(college.id, { status: next }, `Moved ${college.name} to ${STATUS_LABEL[next]}.`);
                          }}
                        >
                          {STATUSES.map((option) => (
                            <option key={option} value={option}>
                              {STATUS_LABEL[option]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-lime">Dates and notes</summary>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="Date you reached out" id={`contact-${college.id}`}>
                          <input
                            id={`contact-${college.id}`}
                            type="date"
                            value={college.contactDate}
                            className={inputClass}
                            onChange={(event) => {
                              const contactDate = event.target.value;
                              if (contactDate) {
                                const problem = validateCollege({ ...college, contactDate }).contactDate;
                                if (problem) {
                                  setMessage(problem);
                                  return;
                                }
                              }
                              updateCollege(
                                college.id,
                                { contactDate },
                                contactDate
                                  ? `Recorded your outreach to ${college.name} on ${formatDate(contactDate)}.`
                                  : `Cleared the outreach date for ${college.name}.`,
                              );
                            }}
                          />
                        </Field>
                        <Field label="Your follow-up date" id={`follow-${college.id}`}>
                          <input
                            id={`follow-${college.id}`}
                            type="date"
                            value={college.followUpDate}
                            className={inputClass}
                            onChange={(event) => {
                              const followUpDate = event.target.value;
                              if (followUpDate && college.contactDate && followUpDate < college.contactDate) {
                                setMessage("Follow-up should be on or after the outreach date.");
                                return;
                              }
                              updateCollege(
                                college.id,
                                { followUpDate },
                                followUpDate
                                  ? `Set a follow-up for ${college.name} on ${formatDate(followUpDate)}.`
                                  : `Cleared the follow-up for ${college.name}.`,
                              );
                            }}
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Notes" id={`notes-${college.id}`}>
                            <textarea
                              id={`notes-${college.id}`}
                              value={college.notes}
                              rows={3}
                              maxLength={500}
                              className={inputClass}
                              onChange={(event) => updateCollege(college.id, { notes: event.target.value })}
                            />
                          </Field>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setUndo(college);
                          removeCollege(college.id);
                        }}
                      >
                        Remove {college.name}
                      </Button>
                    </details>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <form
        className="mt-8 grid gap-4 rounded-2xl border border-line bg-panel p-4 md:grid-cols-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const nextErrors = validateCollege(form);
          if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setMessage("");
            const first = Object.keys(nextErrors)[0];
            document.getElementById(`college-${first}`)?.focus();
            return;
          }
          const error = addCollege({
            name: form.name.trim(),
            location: form.location.trim(),
            division: form.division,
            conference: form.conference.trim(),
            status: form.status,
            notes: form.notes.trim(),
            contactDate: form.contactDate,
            followUpDate: form.followUpDate,
          });
          if (error) {
            setErrors({ name: error });
            setMessage("");
            return;
          }
          setForm(EMPTY_FORM);
          setErrors({});
          setMessage(`${form.name.trim()} added to ${STATUS_LABEL[form.status]}.`);
        }}
      >
        <Field label="School name" id="college-name" error={errors.name}>
          <input
            id="college-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "college-name-error" : undefined}
            required
          />
        </Field>
        <Field label="Location" id="college-location" hint="Optional campus or city.">
          <input
            id="college-location"
            value={form.location}
            onChange={(event) => setField("location", event.target.value)}
            className={inputClass}
            aria-describedby="college-location-hint"
          />
        </Field>
        <Field label="Division" id="college-division" error={errors.division}>
          <select
            id="college-division"
            value={form.division}
            onChange={(event) => setField("division", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.division)}
            aria-describedby={errors.division ? "college-division-error" : undefined}
          >
            <option value="">Select a division</option>
            {DIVISIONS.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Conference" id="college-conference" hint="Optional.">
          <input
            id="college-conference"
            value={form.conference}
            onChange={(event) => setField("conference", event.target.value)}
            className={inputClass}
            aria-describedby="college-conference-hint"
          />
        </Field>
        <Field label="Status" id="college-status">
          <select
            id="college-status"
            value={form.status}
            onChange={(event) => setField("status", event.target.value as RecruitStatus)}
            className={inputClass}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date you reached out" id="college-contactDate" error={errors.contactDate} hint="Leave blank until you actually reach out.">
          <input
            id="college-contactDate"
            type="date"
            value={form.contactDate}
            onChange={(event) => setField("contactDate", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.contactDate)}
            aria-describedby={errors.contactDate ? "college-contactDate-error" : "college-contactDate-hint"}
          />
        </Field>
        <Field label="Your follow-up date" id="college-followUpDate" error={errors.followUpDate}>
          <input
            id="college-followUpDate"
            type="date"
            value={form.followUpDate}
            onChange={(event) => setField("followUpDate", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.followUpDate)}
            aria-describedby={errors.followUpDate ? "college-followUpDate-error" : undefined}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notes" id="college-notes" error={errors.notes}>
            <textarea
              id="college-notes"
              value={form.notes}
              onChange={(event) => setField("notes", event.target.value)}
              className={inputClass}
              rows={3}
              maxLength={500}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "college-notes-error" : undefined}
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit">Add school</Button>
          {message ? (
            <p role="status" className="text-sm text-lime">
              {message}
            </p>
          ) : null}
        </div>
      </form>

    </Container>
  );
}
