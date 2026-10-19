"use client";

import Link from "next/link";
import { useState } from "react";
import { FilmFrame } from "@/components/players/FilmFrame";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { inputClass } from "@/components/ui/Field";
import { formatHeight, formatWhen, locationLabel } from "@/lib/format";
import { safeHttpsUrl } from "@/lib/media";
import { RANKING_SOURCE } from "@/lib/prospects";
import type { Prospect } from "@/lib/types";

export function PlayerProfileView({ player }: { player: Prospect }) {
  const { ready, board, toggleWatch, savePlayerNote } = useApp();
  const saved = board.watchlist.includes(player.id);
  const storedNote = board.notes.find((item) => item.playerId === player.id);
  const [note, setNote] = useState(storedNote?.note ?? "");
  const [noteFor, setNoteFor] = useState(player.id);
  const [noteMessage, setNoteMessage] = useState("");
  const reportUrl = safeHttpsUrl(player.reportUrl);
  const profileUrl = safeHttpsUrl(player.profileUrl);
  const videoUrl = player.videoUrl ? safeHttpsUrl(player.videoUrl) : null;

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

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SafeImage
            src={player.photo}
            alt={player.photoAlt}
            priority
            frameClassName="aspect-[4/5] min-h-[320px] rounded-3xl border border-line lg:min-h-[560px]"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <p className="mt-2 text-xs leading-relaxed text-mist">
            {player.photo.endsWith("/fallback.jpg")
              ? "No separate public recruiting photo was available for this player, so the generic basketball image is shown."
              : "Public recruiting photo from 247Sports. It is not from a private account."}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            No. {player.rank} · class of {player.gradYear}
          </p>
          <h1 className="mt-2 font-display text-5xl uppercase leading-none text-paper sm:text-7xl">{player.name}</h1>
          <p className="mt-3 text-lg text-paper">
            {player.positionAbbr} · {player.position}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-mist">Height</dt>
              <dd className="mt-1 text-lg text-paper">{formatHeight(player.heightInches)}</dd>
            </div>
            <div>
              <dt className="text-mist">Weight</dt>
              <dd className="mt-1 text-lg text-paper">{player.weight} lb</dd>
            </div>
            <div>
              <dt className="text-mist">Stars</dt>
              <dd className="mt-1 text-lg text-paper">{player.stars}-star</dd>
            </div>
            <div>
              <dt className="text-mist">Grade</dt>
              <dd className="mt-1 text-lg text-paper">{player.grade}</dd>
            </div>
            <div>
              <dt className="text-mist">Graduation year</dt>
              <dd className="mt-1 text-lg text-paper">{player.gradYear}</dd>
            </div>
            <div>
              <dt className="text-mist">Hometown</dt>
              <dd className="mt-1 text-lg text-paper">{locationLabel(player.city, player.state)}</dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-mist">High school</dt>
              <dd className="mt-1 text-lg text-paper">{player.school}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            Facts are from the {RANKING_SOURCE.publisher} {RANKING_SOURCE.title}, checked {RANKING_SOURCE.checkedOn}.
            Rankings change. NEXTUP did not write a scouting report for {player.name}.
          </p>
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
              ? "Saved on your board. This does not notify a coach or the player."
              : "Save interest keeps this prospect on your dashboard. It does not contact anyone."}
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-panel p-5" aria-labelledby="commitment-heading">
        <h2 id="commitment-heading" className="font-display text-3xl uppercase text-paper">
          Listed commitment
        </h2>
        {player.listedCommitment ? (
          <p className="mt-3 text-sm leading-relaxed text-mist">
            The ranking row lists a commitment to{" "}
            <span className="text-paper">{player.listedCommitment.school}</span> dated{" "}
            <span className="text-paper">{player.listedCommitment.date}</span>. That is the school name and date
            published on the row. NEXTUP did not record an offer, a visit, or a coach contact.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-mist">
            No college commitment is listed on this ranking row. NEXTUP does not add offers or coach contacts.
          </p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="links-heading">
        <h2 id="links-heading" className="font-display text-4xl uppercase text-paper">
          Public links
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {reportUrl ? (
            <li>
              <a
                href={reportUrl}
                className="inline-flex rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-lime-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Scouting report
              </a>
            </li>
          ) : null}
          {profileUrl ? (
            <li>
              <a
                href={profileUrl}
                className="inline-flex rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-paper transition hover:border-lime hover:text-lime"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ranking profile
              </a>
            </li>
          ) : null}
        </ul>
        <p className="mt-3 max-w-3xl text-sm text-mist">
          The report opens on {RANKING_SOURCE.publisher}. NEXTUP does not paste that writeup.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="film-heading">
        <h2 id="film-heading" className="font-display text-4xl uppercase text-paper">
          Highlight video
        </h2>
        {videoUrl ? (
          <div className="mt-4 max-w-3xl">
            <FilmFrame title={`${player.name} highlight`} url={videoUrl} note="Public link stored with this profile." />
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-4 py-6 text-sm text-mist">
            No stable highlight URL was published on the ranking row checked {RANKING_SOURCE.checkedOn}. The row
            labels a video, but that label is not a link, so nothing is embedded here.
          </p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="omitted-heading">
        <h2 id="omitted-heading" className="font-display text-4xl uppercase text-paper">
          Not on this ranking row
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist">
          GPA, test scores, season statistics, and a playing-style writeup were not on the public ranking row.
          Those fields stay blank instead of being estimated.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-panel p-5" aria-labelledby="note-heading">
        <h2 id="note-heading" className="font-display text-3xl uppercase text-paper">
          Your private note
        </h2>
        <p className="mt-2 text-sm text-mist">
          Saved to your board only. NEXTUP does not send this to a coach or to {player.name}.
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
            placeholder="Why this prospect is on your list"
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
      </section>
    </div>
  );
}
