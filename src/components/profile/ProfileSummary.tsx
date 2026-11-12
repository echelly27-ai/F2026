"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { HighlightsManager } from "@/components/dashboard/HighlightsManager";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Container } from "@/components/layout/Container";
import { RecruitingChecklist } from "@/components/profile/RecruitingChecklist";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { profileCompletion } from "@/lib/board";
import { formatHeightParts } from "@/lib/format";
import {
  COUNTRIES,
  US_STATES,
  graduationClassOptions,
  optionsIncludingCurrent,
  type ProfileOption,
} from "@/lib/profile-options";
import type { AthleteProfile } from "@/lib/types";
import { POSITIONS } from "@/lib/types";

const SECTIONS = [
  { id: "summary", label: "Profile summary" },
  { id: "video", label: "Video" },
  { id: "athletics", label: "Athletics" },
  { id: "academics", label: "Academics" },
  { id: "information", label: "My information" },
  { id: "stats", label: "Key stats" },
  { id: "preferences", label: "Preferences" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const ROWS = [
  { id: "position", title: "Primary position" },
  { id: "school", title: "High school" },
  { id: "stats", title: "Key stats" },
  { id: "gpa", title: "GPA" },
  { id: "contact", title: "Contact info" },
  { id: "size", title: "Height and weight" },
] as const;

type RowId = (typeof ROWS)[number]["id"];

function line(value: string, empty: string) {
  const text = value.trim();
  return { text: text || empty, filled: Boolean(text) };
}

function rowStatus(id: RowId, profile: AthleteProfile) {
  if (id === "position") return line(profile.position, "Add your primary position.");
  if (id === "school") {
    if (!profile.school.trim()) return line("", "Add your high school.");
    const place = [profile.city, profile.state].map((part) => part.trim()).filter(Boolean).join(", ");
    return line(place ? `${profile.school.trim()} · ${place}` : profile.school.trim(), "");
  }
  if (id === "stats") {
    const parts = [
      profile.ppg.trim() && `${profile.ppg.trim()} PPG`,
      profile.rpg.trim() && `${profile.rpg.trim()} RPG`,
      profile.apg.trim() && `${profile.apg.trim()} APG`,
      profile.spg.trim() && `${profile.spg.trim()} SPG`,
      profile.bpg.trim() && `${profile.bpg.trim()} BPG`,
    ].filter(Boolean);
    return line(parts.join(" · "), "Add your season averages.");
  }
  if (id === "gpa") return line(profile.gpa.trim() ? `${profile.gpa.trim()} GPA` : "", "Add your GPA.");
  if (id === "contact") return line(profile.email, "Add contact info.");
  const height = formatHeightParts(profile.heightFeet, profile.heightInches);
  const weight = profile.weight.trim() ? `${profile.weight.trim()} lb` : "";
  return line([height, weight].filter(Boolean).join(" · "), "Add your height and weight.");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileSummary() {
  const { ready, session, board, updateProfile } = useApp();
  const [section, setSection] = useState<SectionId>("summary");
  const [editing, setEditing] = useState<RowId | null>(null);
  const [draft, setDraft] = useState<AthleteProfile>(board.profile);
  const [synced, setSynced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const profile = board.profile;
  const completion = profileCompletion(profile);
  const profileName = [profile.firstName, profile.lastName].map((part) => part.trim()).filter(Boolean).join(" ");
  const displayName = profileName || session?.name?.trim() || "";
  const classYear = profile.gradYear.trim();

  useEffect(() => {
    if (!ready || synced) return;
    setDraft(board.profile);
    setSynced(true);
  }, [board.profile, ready, synced]);

  function setField<K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) {
    setMessage("");
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function showSection(next: SectionId) {
    if (next === "video") {
      setSection("summary");
      setEditing(null);
      setDraft(board.profile);
      setErrors({});
      setMessage("");
      document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSection(next);
    setEditing(null);
    setDraft(board.profile);
    setErrors({});
    setMessage("");
  }

  function openRow(id: RowId) {
    setDraft(board.profile);
    setEditing(id);
    setErrors({});
    setMessage("");
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const result = updateProfile(draft);
    if (result) {
      setErrors(result);
      setMessage("");
      const first = Object.keys(result)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setMessage("Saved on this device.");
    setEditing(null);
  }

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">My profile</p>
        <h1 className="mt-2 font-display text-5xl uppercase leading-[0.9] text-paper sm:text-6xl">My profile</h1>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Profile sections">
        {SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink"
                  : "rounded-full border border-line px-4 py-2 text-sm font-semibold text-paper"
              }
              onClick={() => showSection(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-line bg-panel p-5">
          <PhotoPlaceholder name={displayName} />
          <h2 className={displayName ? "mt-4 font-display text-4xl uppercase leading-none text-paper" : "mt-4 font-display text-4xl uppercase leading-none text-mist"}>
            {displayName || "Your name"}
          </h2>
          <p className="mt-3 text-sm text-mist">
            Basketball
            {classYear ? ` · Class of ${classYear}` : " · Class year not added"}
          </p>
          <div className="mt-5 rounded-xl border border-line bg-navy p-4">
            <h3 className="text-sm font-semibold text-paper">Your profile</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              This file stays on your board. Contact details are not added to public prospect pages.
            </p>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-semibold text-paper">Profile completion</p>
              <p className="text-mist">{completion.percent}%</p>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-panel-2"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion.percent}
            >
              <div className="h-full rounded-full bg-lime" style={{ width: `${completion.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-mist">
              {completion.filled} of {completion.total} details
            </p>
          </div>
        </aside>

        <div>
          {section === "summary" ? (
            editing ? (
              <SectionForm
                title={ROWS.find((row) => row.id === editing)?.title ?? "Update"}
                message={message}
                errors={errors}
                onSubmit={save}
                onBack={() => {
                  setEditing(null);
                  setErrors({});
                  setMessage("");
                }}
              >
                <RowFields id={editing} draft={draft} errors={errors} setField={setField} />
              </SectionForm>
            ) : (
              <div>
                {message ? (
                  <p role="status" className="mb-3 text-sm font-medium text-lime">
                    {message}
                  </p>
                ) : null}
              <ul className="space-y-3" aria-label="Profile details">
                {ROWS.map((row) => {
                  const status = rowStatus(row.id, profile);
                  return (
                    <li key={row.id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-4">
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openRow(row.id)} disabled={!ready}>
                        <span className="block text-base font-semibold text-paper">{row.title}</span>
                        <span className={status.filled ? "mt-1 block truncate text-sm text-paper" : "mt-1 block truncate text-sm text-mist"}>
                          {status.text}
                        </span>
                      </button>
                      <Button type="button" variant="secondary" size="sm" disabled={!ready} onClick={() => openRow(row.id)}>
                        Update
                      </Button>
                    </li>
                  );
                })}
              </ul>
              </div>
            )
          ) : null}

          {section === "athletics" ? (
            <SectionForm title="Athletics" lede="Position and size saved on this device." message={message} errors={errors} onSubmit={save}>
              <PositionField value={draft.position} onChange={(value) => setField("position", value)} />
              <SizeFields draft={draft} errors={errors} setField={setField} />
            </SectionForm>
          ) : null}

          {section === "academics" ? (
            <SectionForm title="Academics" lede="Grades and class year you choose to record." message={message} errors={errors} onSubmit={save}>
              <GpaField value={draft.gpa} error={errors.gpa} onChange={(value) => setField("gpa", value)} />
              <TextField id="intendedMajor" label="Intended major" value={draft.intendedMajor} onChange={(value) => setField("intendedMajor", value)} />
              <SelectField
                id="gradYear"
                label="Graduation class"
                value={draft.gradYear}
                placeholder="Select a class"
                error={errors.gradYear}
                options={graduationClassOptions(draft.gradYear)}
                onChange={(value) => setField("gradYear", value)}
              />
            </SectionForm>
          ) : null}

          {section === "information" ? (
            <SectionForm
              title="My information"
              lede="Name and contact details stay on your board. They are not added to public prospect pages."
              message={message}
              errors={errors}
              onSubmit={save}
            >
              <TextField id="firstName" label="First name" value={draft.firstName} error={errors.firstName} autoComplete="given-name" onChange={(value) => setField("firstName", value)} />
              <TextField id="lastName" label="Last name" value={draft.lastName} error={errors.lastName} autoComplete="family-name" onChange={(value) => setField("lastName", value)} />
              <TextField id="email" label="Email" type="email" value={draft.email} error={errors.email} autoComplete="email" hint="Stored on your board only." onChange={(value) => setField("email", value)} />
              <TextField id="school" label="High school" value={draft.school} onChange={(value) => setField("school", value)} />
              <TextField id="city" label="City" value={draft.city} onChange={(value) => setField("city", value)} />
              <SelectField
                id="state"
                label="State"
                value={draft.state}
                placeholder="Select a state"
                options={optionsIncludingCurrent(US_STATES, draft.state)}
                onChange={(value) => setField("state", value)}
              />
              <SelectField
                id="country"
                label="Country"
                value={draft.country}
                placeholder="Select a country"
                options={optionsIncludingCurrent(COUNTRIES, draft.country)}
                onChange={(value) => setField("country", value)}
              />
            </SectionForm>
          ) : null}

          {section === "stats" ? (
            <SectionForm title="Key stats" lede="Season averages you enter. These are not a published ranking." message={message} errors={errors} onSubmit={save}>
              <StatFields draft={draft} errors={errors} setField={setField} />
            </SectionForm>
          ) : null}

          {section === "preferences" ? (
            <SectionForm
              title="Preferences"
              lede="How you describe your game. NEXTUP does not contact coaches for you."
              message={message}
              errors={errors}
              onSubmit={save}
            >
              <TextField id="playingStyle" label="Playing style" value={draft.playingStyle} error={errors.playingStyle} multiline onChange={(value) => setField("playingStyle", value)} />
              <TextField id="strengths" label="Strengths" value={draft.strengths} hint="Separate traits with commas." onChange={(value) => setField("strengths", value)} />
              <TextField id="bio" label="Biography" value={draft.bio} error={errors.bio} hint={`${draft.bio.length}/600`} multiline onChange={(value) => setField("bio", value)} />
            </SectionForm>
          ) : null}
        </div>
      </div>

      {section === "summary" && !editing ? (
        <div className="mt-8">
          <ProfileForm />
        </div>
      ) : null}
      <div className="mt-8 space-y-8">
        <RecruitingChecklist />
        <HighlightsManager />
      </div>
    </Container>
  );
}

function PhotoPlaceholder({ name }: { name: string }) {
  const letters = initials(name);
  return (
    <div className="flex size-28 items-center justify-center rounded-2xl border border-line bg-panel-2" role="img" aria-label="Profile photo placeholder">
      {letters ? (
        <span className="font-display text-4xl text-lime" aria-hidden="true">
          {letters}
        </span>
      ) : (
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" className="text-lime">
          <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M10 40c2.2-7 7.4-10 14-10s11.8 3 14 10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

function SectionForm({
  title,
  lede,
  message,
  errors,
  onSubmit,
  onBack,
  children,
}: {
  title: string;
  lede?: string;
  message: string;
  errors: Record<string, string>;
  onSubmit: (event: FormEvent) => void;
  onBack?: () => void;
  children: ReactNode;
}) {
  const needsName = title !== "My information" && Boolean(errors.firstName || errors.lastName);
  return (
    <form className="rounded-2xl border border-line bg-panel p-5" noValidate onSubmit={onSubmit}>
      <h2 className="font-display text-4xl uppercase text-paper">{title}</h2>
      {lede ? <p className="mt-2 text-sm leading-relaxed text-mist">{lede}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
      {needsName ? (
        <p className="mt-4 text-sm text-rose-300">Add your name under My information, then save this item again.</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit">Save</Button>
        {onBack ? (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        ) : null}
      </div>
      {message ? (
        <p role="status" className="mt-3 text-sm font-medium text-lime">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function RowFields({
  id,
  draft,
  errors,
  setField,
}: {
  id: RowId;
  draft: AthleteProfile;
  errors: Record<string, string>;
  setField: <K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) => void;
}) {
  if (id === "position") return <PositionField value={draft.position} onChange={(value) => setField("position", value)} />;
  if (id === "school") return <TextField id="school" label="High school" value={draft.school} onChange={(value) => setField("school", value)} />;
  if (id === "stats") return <StatFields draft={draft} errors={errors} setField={setField} />;
  if (id === "gpa") return <GpaField value={draft.gpa} error={errors.gpa} onChange={(value) => setField("gpa", value)} />;
  if (id === "contact") {
    return (
      <TextField
        id="email"
        label="Email"
        type="email"
        value={draft.email}
        error={errors.email}
        autoComplete="email"
        hint="Stored on your board only. Public prospect pages do not show it."
        onChange={(value) => setField("email", value)}
      />
    );
  }
  return <SizeFields draft={draft} errors={errors} setField={setField} />;
}

function PositionField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <SelectField
      id="position"
      label="Primary position"
      value={value}
      placeholder="Select a position"
      options={POSITIONS.map((position) => ({ value: position, label: position }))}
      onChange={onChange}
    />
  );
}

function SizeFields({
  draft,
  errors,
  setField,
}: {
  draft: AthleteProfile;
  errors: Record<string, string>;
  setField: <K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) => void;
}) {
  return (
    <>
      <TextField id="heightFeet" label="Height, feet" value={draft.heightFeet} error={errors.heightFeet} inputMode="numeric" onChange={(value) => setField("heightFeet", value)} />
      <TextField id="heightInches" label="Height, inches" value={draft.heightInches} error={errors.heightInches} inputMode="numeric" onChange={(value) => setField("heightInches", value)} />
      <TextField id="weight" label="Weight, pounds" value={draft.weight} error={errors.weight} inputMode="numeric" onChange={(value) => setField("weight", value)} />
    </>
  );
}

function StatFields({
  draft,
  errors,
  setField,
}: {
  draft: AthleteProfile;
  errors: Record<string, string>;
  setField: <K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) => void;
}) {
  const fields = [
    ["ppg", "Points per game"],
    ["rpg", "Rebounds per game"],
    ["apg", "Assists per game"],
    ["spg", "Steals per game"],
    ["bpg", "Blocks per game"],
  ] as const;
  return (
    <>
      {fields.map(([key, label]) => (
        <TextField
          key={key}
          id={key}
          label={label}
          value={draft[key]}
          error={errors[key]}
          inputMode="decimal"
          onChange={(value) => setField(key, value)}
        />
      ))}
    </>
  );
}

function GpaField({ value, error, onChange }: { value: string; error?: string; onChange: (value: string) => void }) {
  return <TextField id="gpa" label="GPA" value={value} error={error} inputMode="decimal" hint="Optional. Use your own number, 0 to 5.00." onChange={onChange} />;
}

function TextField({
  id,
  label,
  value,
  error,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  multiline = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  type?: string;
  inputMode?: "numeric" | "decimal" | "email" | "text";
  autoComplete?: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={multiline ? "sm:col-span-2" : undefined}>
      <Field label={label} id={id} error={error} hint={hint}>
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
            rows={4}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            inputMode={inputMode}
            autoComplete={autoComplete}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
        )}
      </Field>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly ProfileOption[];
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} id={id} error={error}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
