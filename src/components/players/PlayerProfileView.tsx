"use client";

import Link from "next/link";
import { useState } from "react";
import { FilmFrame } from "@/components/players/FilmFrame";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { SafeImage } from "@/components/ui/SafeImage";
import { inputClass } from "@/components/ui/Field";
import { formatHeight, formatWhen, locationLabel } from "@/lib/format";
import { SAMPLE_FILM_NOTE } from "@/lib/media";
import type { DemoPlayer } from "@/lib/types";

const STATS: Array<{ key: keyof DemoPlayer["stats"]; label: string }> = [
  { key: "ppg", label: "PPG" },
  { key: "rpg", label: "RPG" },
  { key: "apg", label: "APG" },
  { key: "spg", label: "SPG" },
  { key: "bpg", label: "BPG" },
  { key: "fgPct", label: "FG%" },
  { key: "threePct", label: "3P%" },
  { key: "ftPct", label: "FT%" },
];

export function PlayerProfileView({ player }: { player: DemoPlayer }) {
  const { ready, board, toggleWatch, savePlayerNote } = useApp();
  const saved = board.watchlist.includes(player.id);
  const storedNote = board.notes.find((item) => item.playerId === player.id);
  const [note, setNote] = useState(storedNote?.note ?? "");
  const [noteFor, setNoteFor] = useState(player.id);
  const [noteMessage, setNoteMessage] = useState("");

  if (noteFor !== player.id) {
    setNoteFor(player.id);
    setNote(storedNote?.note ?? "");
    setNoteMessage("");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/players" className="text-sm font-medium text-mist hover:text-paper">
        Back to players
      </Link>
      <div className="mt-4">
        <DemoNote>
          {player.name} is a fictional demonstration profile. Statistics, academics, and school names
          are sample content. Saving interest stores a note on your device and does not contact anyone.
        </DemoNote>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SafeImage
          src={player.photo}
          alt={player.photoAlt}
          priority
          frameClassName="aspect-[4/5] min-h-[320px] rounded-3xl border border-line lg:min-h-[560px]"
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Demonstration profile</p>
          <h1 className="mt-2 font-display text-5xl uppercase leading-none text-paper sm:text-7xl">{player.name}</h1>
          <p className="mt-3 text-lg text-paper">{player.position}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-mist">Height</dt>
              <dd className="mt-1 text-lg text-paper">{formatHeight(player.heightInches)}</dd>
            </div>
            <div>
              <dt className="text-mist">Graduation year</dt>
              <dd className="mt-1 text-lg text-paper">{player.gradYear}</dd>
            </div>
            <div>
              <dt className="text-mist">Location</dt>
              <dd className="mt-1 text-lg text-paper">{locationLabel(player.city, player.state)}</dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-mist">Current school</dt>
              <dd className="mt-1 text-lg text-paper">{player.school}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => toggleWatch(player.id, player.name)}
              disabled={!ready}
              aria-pressed={saved}
            >
              {saved ? "Interest saved" : "Save interest"}
            </Button>
            <ButtonLink href="/dashboard#watchlist" variant="secondary">
              View saved players
            </ButtonLink>
          </div>
          <p className="mt-3 text-sm text-mist">
            {saved
              ? "Saved on your board. This does not notify a coach or the fictional player."
              : "Save interest to keep this demonstration profile on your dashboard."}
          </p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="stats-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="stats-heading" className="font-display text-4xl uppercase text-paper">
            Basketball statistics
          </h2>
          <p className="text-sm text-mist">{player.stats.games} sample games</p>
        </div>
        <p className="mt-2 text-sm text-mist">Illustrative demo numbers, not an official box score.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {STATS.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-line bg-panel px-3 py-4">
              <dt className="text-xs uppercase tracking-wide text-mist">{stat.label}</dt>
              <dd className="mt-1 font-display text-3xl text-paper">{player.stats[stat.key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="style-heading">
          <h2 id="style-heading" className="font-display text-3xl uppercase text-paper">
            Playing style
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist">{player.playingStyle}</p>
          <h3 className="mt-5 text-sm font-semibold text-paper">Strengths in this demo note</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {player.strengths.map((strength) => (
              <li key={strength} className="rounded-full border border-line px-3 py-1 text-sm text-paper">
                {strength}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="academics-heading">
          <h2 id="academics-heading" className="font-display text-3xl uppercase text-paper">
            Academics
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-mist">GPA</dt>
              <dd className="text-paper">{player.gpa === null ? "Not supplied" : player.gpa.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist">SAT</dt>
              <dd className="text-paper">{player.sat === null ? "Not supplied" : player.sat}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mist">Intended major</dt>
              <dd className="text-right text-paper">{player.intendedMajor || "Not supplied"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-mist">Sample academic fields for the layout. Not an official transcript.</p>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="bio-heading">
        <h2 id="bio-heading" className="font-display text-4xl uppercase text-paper">
          Biography
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-mist">{player.bio}</p>
      </section>

      <section className="mt-8" aria-labelledby="film-heading">
        <h2 id="film-heading" className="font-display text-4xl uppercase text-paper">
          Highlight video
        </h2>
        {player.highlights.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-4 py-6 text-sm text-mist">
            No film link is attached to this demonstration profile.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {player.highlights.map((highlight) => (
              <FilmFrame key={highlight.id} title={highlight.title} url={highlight.url} note={SAMPLE_FILM_NOTE} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="interests-heading">
        <h2 id="interests-heading" className="font-display text-4xl uppercase text-paper">
          College interests
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-mist">
          Fictional programs this demonstration profile lists as interests. These are not offers, visits, or
          records of a college contacting the player.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {player.collegeInterests.map((school) => (
            <li key={school} className="rounded-full bg-panel-2 px-4 py-2 text-sm text-paper">
              {school}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-panel p-5" aria-labelledby="note-heading">
        <h2 id="note-heading" className="font-display text-3xl uppercase text-paper">
          Your private note
        </h2>
        <p className="mt-2 text-sm text-mist">
          Saved to your board only. NEXTUP does not send this to a coach or to the demonstration profile.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            savePlayerNote(player.id, note, player.name);
            setNoteMessage(note.trim() ? "Note saved on your board." : "Note cleared.");
          }}
        >
          <label htmlFor="player-note" className="text-sm font-medium text-paper">
            Recruiting note
          </label>
          <textarea
            id="player-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={4}
            className={inputClass}
            placeholder="Why this demonstration profile is on your list"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!ready}>
              Save note
            </Button>
            {noteMessage ? (
              <p role="status" className="text-sm text-lime">
                {noteMessage}
              </p>
            ) : null}
          </div>
          {storedNote ? (
            <p className="text-sm text-mist">Last saved {formatWhen(storedNote.savedAt)}.</p>
          ) : null}
        </form>
        <p className="mt-4 text-sm text-mist">
          Follow-up dates for schools you contact live on the tracker. You record those dates yourself.
        </p>
      </section>
    </div>
  );
}
