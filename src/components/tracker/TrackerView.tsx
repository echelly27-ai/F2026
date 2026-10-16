"use client";

import { useMemo, useState } from "react";
import { Container, PageHeader } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { formatDate } from "@/lib/format";
import type { CollegeEntry, RecruitStatus } from "@/lib/types";
import { DIVISIONS, STATUSES } from "@/lib/types";
import { validateCollege } from "@/lib/validate";

const STATUS_LABEL: Record<RecruitStatus, string> = {
  interested: "Interested",
  contacted: "Contacted",
  evaluating: "Evaluating",
};

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
  const { ready, board, addCollege, updateCollege, removeCollege, restoreCollege } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RecruitStatus | "all">("all");
  const [undo, setUndo] = useState<CollegeEntry | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return board.colleges.filter((college) => {
      if (statusFilter !== "all" && college.status !== statusFilter) return false;
      if (!needle) return true;
      return [college.name, college.location, college.conference, college.notes, college.division]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [board.colleges, query, statusFilter]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  if (!ready) {
    return (
      <Container className="space-y-4 py-10">
        <div className="h-16 animate-pulse rounded-2xl bg-panel" />
        <div className="h-48 animate-pulse rounded-2xl bg-panel" />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Tracker"
        title="College recruiting tracker"
        lede="Add schools you are researching, sort them into Interested, Contacted, and Evaluating, and record the dates you choose for outreach and follow-up."
      />
      <div className="mt-6">
        <DemoNote>
          Sample schools on a fresh board are fictional placeholders. A contact date means the day you reached out.
          NEXTUP does not store coach phone numbers and does not claim a program contacted you.
        </DemoNote>
      </div>

      <form
        className="mt-6 grid gap-4 rounded-2xl border border-line bg-panel p-4 md:grid-cols-2"
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

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Field label="Search your list" id="tracker-search">
          <input
            id="tracker-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={inputClass}
            placeholder="School, city, conference, or note"
          />
        </Field>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
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
            title="No schools yet"
            body="Add a program you are researching. The new card shows up in the column that matches the status you pick."
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nothing matches"
            body="No schools match that search or status. Clear the search to see the full list."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear search
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {STATUSES.filter((status) => statusFilter === "all" || statusFilter === status).map((status) => {
            const column = visible.filter((college) => college.status === status);
            return (
              <section key={status} aria-labelledby={`column-${status}`} className="space-y-3">
                <h2 id={`column-${status}`} className="font-display text-3xl uppercase text-paper">
                  {STATUS_LABEL[status]}
                  <span className="ml-2 text-lg text-mist">{column.length}</span>
                </h2>
                {column.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-mist">
                    None in {STATUS_LABEL[status]}.
                  </p>
                ) : (
                  column.map((college) => (
                    <article key={college.id} className="space-y-3 rounded-2xl border border-line bg-panel p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-paper">{college.name}</h3>
                        <p className="text-sm text-mist">
                          {[college.location, college.division, college.conference].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <Field label="Status" id={`status-${college.id}`}>
                        <select
                          id={`status-${college.id}`}
                          value={college.status}
                          className={inputClass}
                          onChange={(event) => {
                            const next = event.target.value as RecruitStatus;
                            updateCollege(
                              college.id,
                              { status: next },
                              `Moved ${college.name} to ${STATUS_LABEL[next]}.`,
                            );
                          }}
                        >
                          {STATUSES.map((option) => (
                            <option key={option} value={option}>
                              {STATUS_LABEL[option]}
                            </option>
                          ))}
                        </select>
                      </Field>
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
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setUndo(college);
                          removeCollege(college.id);
                        }}
                      >
                        Remove {college.name}
                      </Button>
                    </article>
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}
    </Container>
  );
}
