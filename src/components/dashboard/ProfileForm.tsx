"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import type { AthleteProfile } from "@/lib/types";
import { POSITIONS } from "@/lib/types";

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function ProfileForm() {
  const { board, ready, updateProfile } = useApp();
  const [draft, setDraft] = useState<AthleteProfile>(board.profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  function setField<K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) {
    setMessage("");
    setDraft((current) => ({ ...current, [key]: value }));
  }

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-panel" />;
  }

  return (
    <form
      id="profile-editor"
      className="rounded-2xl border border-line bg-panel p-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const result = updateProfile(draft);
        if (result) {
          setErrors(result);
          setMessage("");
          const first = Object.keys(result)[0];
          document.getElementById(first)?.focus();
          return;
        }
        setDraft({
          ...draft,
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          email: draft.email.trim(),
          highlights: board.profile.highlights,
        });
        setErrors({});
        setMessage("Profile saved on this device.");
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl uppercase text-paper">Edit profile</h2>
          <p className="mt-1 text-sm text-mist">This is your board, separate from the fictional discovery profiles.</p>
        </div>
        {message ? (
          <p role="status" className="text-sm font-medium text-lime">
            {message}
          </p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="First name" id="firstName" error={errors.firstName}>
          <input
            id="firstName"
            value={draft.firstName}
            onChange={(event) => setField("firstName", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={describedBy("firstName", errors.firstName)}
            autoComplete="given-name"
            required
          />
        </Field>
        <Field label="Last name" id="lastName" error={errors.lastName}>
          <input
            id="lastName"
            value={draft.lastName}
            onChange={(event) => setField("lastName", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={describedBy("lastName", errors.lastName)}
            autoComplete="family-name"
            required
          />
        </Field>
        <Field label="Email" id="email" error={errors.email} hint="Optional. Stored with your board.">
          <input
            id="email"
            type="email"
            value={draft.email}
            onChange={(event) => setField("email", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email", errors.email, "Optional. Stored with your board.")}
            autoComplete="email"
          />
        </Field>
        <Field label="Position" id="position">
          <select
            id="position"
            value={draft.position}
            onChange={(event) => setField("position", event.target.value)}
            className={inputClass}
          >
            <option value="">Select a position</option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Height, feet" id="heightFeet" error={errors.heightFeet}>
          <input
            id="heightFeet"
            inputMode="numeric"
            value={draft.heightFeet}
            onChange={(event) => setField("heightFeet", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.heightFeet)}
            aria-describedby={describedBy("heightFeet", errors.heightFeet)}
          />
        </Field>
        <Field label="Height, inches" id="heightInches" error={errors.heightInches}>
          <input
            id="heightInches"
            inputMode="numeric"
            value={draft.heightInches}
            onChange={(event) => setField("heightInches", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.heightInches)}
            aria-describedby={describedBy("heightInches", errors.heightInches)}
          />
        </Field>
        <Field label="Graduation year" id="gradYear" error={errors.gradYear}>
          <input
            id="gradYear"
            inputMode="numeric"
            value={draft.gradYear}
            onChange={(event) => setField("gradYear", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.gradYear)}
            aria-describedby={describedBy("gradYear", errors.gradYear)}
            placeholder="2027"
          />
        </Field>
        <Field label="Current school or team" id="school">
          <input
            id="school"
            value={draft.school}
            onChange={(event) => setField("school", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="City" id="city">
          <input id="city" value={draft.city} onChange={(event) => setField("city", event.target.value)} className={inputClass} />
        </Field>
        <Field label="State" id="state">
          <input
            id="state"
            value={draft.state}
            onChange={(event) => setField("state", event.target.value.toUpperCase().slice(0, 2))}
            className={inputClass}
            maxLength={2}
            aria-label="State abbreviation"
          />
        </Field>
        <Field label="GPA" id="gpa" error={errors.gpa} hint="Optional. Use your own number, 0 to 5.00.">
          <input
            id="gpa"
            inputMode="decimal"
            value={draft.gpa}
            onChange={(event) => setField("gpa", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.gpa)}
            aria-describedby={describedBy("gpa", errors.gpa, "Optional. Use your own number, 0 to 5.00.")}
          />
        </Field>
        <Field label="Intended major" id="intendedMajor">
          <input
            id="intendedMajor"
            value={draft.intendedMajor}
            onChange={(event) => setField("intendedMajor", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Points per game" id="ppg" error={errors.ppg}>
          <input
            id="ppg"
            inputMode="decimal"
            value={draft.ppg}
            onChange={(event) => setField("ppg", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.ppg)}
            aria-describedby={describedBy("ppg", errors.ppg)}
          />
        </Field>
        <Field label="Rebounds per game" id="rpg" error={errors.rpg}>
          <input
            id="rpg"
            inputMode="decimal"
            value={draft.rpg}
            onChange={(event) => setField("rpg", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.rpg)}
            aria-describedby={describedBy("rpg", errors.rpg)}
          />
        </Field>
        <Field label="Assists per game" id="apg" error={errors.apg}>
          <input
            id="apg"
            inputMode="decimal"
            value={draft.apg}
            onChange={(event) => setField("apg", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.apg)}
            aria-describedby={describedBy("apg", errors.apg)}
          />
        </Field>
        <Field label="Steals per game" id="spg" error={errors.spg}>
          <input
            id="spg"
            inputMode="decimal"
            value={draft.spg}
            onChange={(event) => setField("spg", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.spg)}
            aria-describedby={describedBy("spg", errors.spg)}
          />
        </Field>
        <Field label="Blocks per game" id="bpg" error={errors.bpg}>
          <input
            id="bpg"
            inputMode="decimal"
            value={draft.bpg}
            onChange={(event) => setField("bpg", event.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.bpg)}
            aria-describedby={describedBy("bpg", errors.bpg)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Strengths" id="strengths" hint="Separate traits with commas.">
            <input
              id="strengths"
              value={draft.strengths}
              onChange={(event) => setField("strengths", event.target.value)}
              className={inputClass}
              aria-describedby="strengths-hint"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Playing style" id="playingStyle" error={errors.playingStyle}>
            <textarea
              id="playingStyle"
              value={draft.playingStyle}
              onChange={(event) => setField("playingStyle", event.target.value)}
              className={inputClass}
              rows={3}
              maxLength={300}
              aria-invalid={Boolean(errors.playingStyle)}
              aria-describedby={describedBy("playingStyle", errors.playingStyle)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Biography" id="bio" error={errors.bio} hint={`${draft.bio.length}/600`}>
            <textarea
              id="bio"
              value={draft.bio}
              onChange={(event) => setField("bio", event.target.value)}
              className={inputClass}
              rows={4}
              maxLength={600}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={describedBy("bio", errors.bio, `${draft.bio.length}/600`)}
            />
          </Field>
        </div>
      </div>
      <Button type="submit" className="mt-5">
        Save profile
      </Button>
    </form>
  );
}
