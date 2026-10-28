"use client";

import Link from "next/link";
import { useState } from "react";
import { FilmFrame } from "@/components/players/FilmFrame";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { hasPlayerPhoto, PlayerPortrait } from "@/components/players/PlayerPortrait";
import { WatchToggle } from "@/components/players/WatchToggle";
import { inputClass } from "@/components/ui/Field";
import { formatHeight, formatWhen, locationLabel } from "@/lib/format";
import { safeHttpsUrl } from "@/lib/media";
import { RANKING_SOURCE, rankLabel } from "@/lib/rankings";
import type { Prospect } from "@/lib/types";

export function PlayerProfileView({ player }: { player: Prospect }) {
  const { ready, board, savePlayerNote } = useApp();
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
          <PlayerPortrait
            player={player}
            priority
            frameClassName="aspect-[4/5] min-h-[320px] rounded-3xl border border-line lg:min-h-[560px]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            initialsClassName="text-7xl"
          />
          <p className="mt-2 text-xs leading-relaxed text-mist">
            {hasPlayerPhoto(player.photo)
              ? "Public recruiting photo from 247Sports. It is not from a private account."
              : "No verified public photo was available, so initials are shown on a plain dark placeholder."}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            {rankLabel(player)} · class of {player.gradYear}
          </p>
          <h1 className="mt-2 font-display text-5xl uppercase leading-none text-paper sm:text-7xl">{player.name}</h1>
          <p className="mt-3 text-lg text-paper">
            {player.positionAbbr} · {player.position}
          </p>
          <p className="mt-1 text-sm text-mist">{player.school}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <a href="#highlights" className="text-lime hover:text-lime-2">
              Highlights
            </a>
            <a href="#inquiry" className="text-lime hover:text-lime-2">
              Recruiting inquiry
            </a>
          </div>
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
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <WatchToggle playerId={player.id} playerName={player.name} />
            <ButtonLink href="/dashboard#watchlist" variant="secondary">
              View watchlist
            </ButtonLink>
          </div>
          <p className="mt-3 text-sm text-mist">
            {saved
              ? "On your watchlist in this browser. NEXTUP does not email the player or publish your note."
              : "Saving adds this player to a watchlist stored on this device. It does not contact anyone."}
          </p>
        </div>
      </div>

      <section id="highlights" className="mt-10 scroll-mt-24" aria-labelledby="film-heading">
        <h2 id="film-heading" className="font-display text-4xl uppercase text-paper">
          Highlights
        </h2>
        {videoUrl ? (
          <div className="mt-4 max-w-3xl">
            <FilmFrame title={`${player.name} highlight`} url={videoUrl} note="Public link stored with this profile." />
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-4 py-6 text-sm text-mist">
            No highlight URL is stored for {player.name}. The ranking row checked {RANKING_SOURCE.checkedOn} does not
            include a working video link, so nothing is embedded.
          </p>
        )}
        {reportUrl ? (
          <a
            href={reportUrl}
            className="mt-4 inline-flex rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-paper transition hover:border-lime hover:text-lime"
            target="_blank"
            rel="noopener noreferrer"
          >
            Public scouting report
          </a>
        ) : null}
      </section>

      <section id="inquiry" className="mt-8 scroll-mt-24 rounded-2xl border border-line bg-panel p-5 sm:p-6" aria-labelledby="note-heading">
        <h2 id="note-heading" className="font-display text-3xl uppercase text-paper">
          Recruiting inquiry
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
          Save {player.name} to the watchlist on this device and keep a private note. NEXTUP does not publish a phone
          number, email, or street address, and it does not send this note.
        </p>
        <div className="mt-4">
          <WatchToggle playerId={player.id} playerName={player.name} />
        </div>
        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            savePlayerNote(player.id, note, player.name);
            setNoteMessage(note.trim() ? "Note saved on this device." : "Note cleared.");
          }}
        >
          <label htmlFor="player-note" className="text-sm font-medium text-paper">
            Private note
          </label>
          <textarea
            id="player-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={4}
            className={inputClass}
            placeholder="What you want to remember about this player"
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

      <section className="mt-8 rounded-2xl border border-line bg-panel p-5" aria-labelledby="commitment-heading">
        <h2 id="commitment-heading" className="font-display text-3xl uppercase text-paper">
          Recruiting status
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

      <section className="mt-8" aria-labelledby="record-heading">
        <h2 id="record-heading" className="font-display text-4xl uppercase text-paper">
          Stored record
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-mist">Season stats</dt>
            <dd className="mt-1 text-paper">Not on the public ranking row.</dd>
          </div>
          <div>
            <dt className="text-mist">Academics</dt>
            <dd className="mt-1 text-paper">Not published. GPA and test scores are not stored here.</dd>
          </div>
        </dl>
        {profileUrl ? (
          <a
            href={profileUrl}
            className="mt-4 inline-flex text-sm font-semibold text-lime hover:text-lime-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            ESPN ranking profile
          </a>
        ) : null}
      </section>
    </div>
  );
}
