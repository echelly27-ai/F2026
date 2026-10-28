"use client";

import Link from "next/link";
import { useState } from "react";
import { HighlightsManager } from "@/components/dashboard/HighlightsManager";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Container } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getPlayer } from "@/lib/prospects";
import { nextFollowUp, profileCompletion, statusCounts } from "@/lib/board";
import { formatDate, formatHeightParts, formatWhen, locationLabel } from "@/lib/format";

function focusSection(id: string) {
  const node = document.getElementById(id);
  node?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (node instanceof HTMLElement) {
    const field = node.querySelector("input, textarea, select");
    if (field instanceof HTMLElement) field.focus();
  }
}

export function DashboardView() {
  const {
    ready,
    session,
    board,
    storageOk,
    warning,
    supabaseEnabled,
    toggleChecklist,
    toggleWatch,
    resetDemo,
    resetNonce,
  } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const completion = profileCompletion(board.profile);
  const counts = statusCounts(board.colleges);
  const checklistDone = board.checklist.filter((item) => item.done).length;
  const followUp = nextFollowUp(board.colleges);
  const displayName = board.profile.firstName || session?.name || "";
  const height = formatHeightParts(board.profile.heightFeet, board.profile.heightInches);
  const strengths = board.profile.strengths
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const savedPlayers = board.watchlist
    .map((id) => getPlayer(id))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  if (!ready) {
    return (
      <Container className="space-y-4 py-10">
        <div className="h-16 animate-pulse rounded-2xl bg-panel" />
        <div className="h-40 animate-pulse rounded-2xl bg-panel" />
        <div className="h-64 animate-pulse rounded-2xl bg-panel" />
      </Container>
    );
  }

  return (
    <Container className="space-y-6 py-10 sm:py-14">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Your board</p>
        <h1 className="mt-2 font-display text-5xl uppercase leading-none text-paper sm:text-6xl">
          {displayName ? `Welcome, ${displayName}.` : "Welcome to your board."}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
          {session
            ? session.mode === "demo"
              ? `Demo session for ${session.email}. Nothing here is a real recruiting account.`
              : `Supabase session for ${session.email}. Your board also stays on this device.`
            : "You can edit without signing in. Start a demo session if you want your name attached."}
        </p>
      </header>

      {!storageOk ? (
        <p className="rounded-xl border border-rose-300/40 bg-panel px-4 py-3 text-sm text-rose-200">
          This browser blocked local storage, so edits last only until you refresh.
        </p>
      ) : null}
      {warning ? <p className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-mist">{warning}</p> : null}
      {!session ? (
        <p className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-mist">
          Working without a session.{" "}
          <Link href="/sign-in" className="font-semibold text-lime">
            Sign in
          </Link>{" "}
          to label the board. {supabaseEnabled ? "Supabase is configured." : "Supabase is not configured, so demo mode is the account path."}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Recruiting progress">
        <article className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-sm text-mist">Profile completion</p>
          <p className="mt-1 font-display text-5xl text-paper">{completion.percent}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy" aria-hidden="true">
            <div className="h-full bg-lime" style={{ width: `${completion.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-mist">
            {completion.filled} of {completion.total} fields
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-sm text-mist">Checklist</p>
          <p className="mt-1 font-display text-5xl text-paper">
            {checklistDone}/{board.checklist.length}
          </p>
          <p className="mt-2 text-xs text-mist">Checks you mark yourself</p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-sm text-mist">Schools on your list</p>
          <p className="mt-1 font-display text-5xl text-paper">{board.colleges.length}</p>
          <p className="mt-2 text-xs text-mist">
            {counts.interested} interested · {counts.contacted} contacted · {counts.evaluating} evaluating
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-sm text-mist">Next follow-up you set</p>
          <p className="mt-2 text-lg font-semibold text-paper">{followUp ? formatDate(followUp) : "None yet"}</p>
          <p className="mt-2 text-xs text-mist">A date you choose, not a coach&apos;s calendar</p>
        </article>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="font-display text-4xl uppercase text-paper">
            Profile overview
          </h2>
          <p className="mt-1 text-sm text-mist">Updates after you save the form below.</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-mist">Name</dt>
              <dd className="text-paper">
                {[board.profile.firstName, board.profile.lastName].filter(Boolean).join(" ") || "Not added yet"}
              </dd>
            </div>
            <div>
              <dt className="text-mist">Position</dt>
              <dd className="text-paper">{board.profile.position || "Not added yet"}</dd>
            </div>
            <div>
              <dt className="text-mist">Height</dt>
              <dd className="text-paper">{height || "Not added yet"}</dd>
            </div>
            <div>
              <dt className="text-mist">Class</dt>
              <dd className="text-paper">{board.profile.gradYear || "Not added yet"}</dd>
            </div>
            <div>
              <dt className="text-mist">School</dt>
              <dd className="text-paper">{board.profile.school || "Not added yet"}</dd>
            </div>
            <div>
              <dt className="text-mist">Location</dt>
              <dd className="text-paper">
                {locationLabel(board.profile.city, board.profile.state) || "Not added yet"}
              </dd>
            </div>
            <div>
              <dt className="text-mist">GPA</dt>
              <dd className="text-paper">{board.profile.gpa || "Not supplied"}</dd>
            </div>
            <div>
              <dt className="text-mist">Major</dt>
              <dd className="text-paper">{board.profile.intendedMajor || "Not added yet"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            {board.profile.playingStyle || "Playing style has not been added."}
          </p>
          {strengths.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {strengths.map((strength) => (
                <li key={strength} className="rounded-full border border-line px-3 py-1 text-sm text-paper">
                  {strength}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4 text-sm text-paper">
            {[
              board.profile.ppg && `${board.profile.ppg} PPG`,
              board.profile.rpg && `${board.profile.rpg} RPG`,
              board.profile.apg && `${board.profile.apg} APG`,
              board.profile.spg && `${board.profile.spg} SPG`,
              board.profile.bpg && `${board.profile.bpg} BPG`,
            ]
              .filter(Boolean)
              .join(" · ") || "Season statistics have not been added."}
          </p>
          {completion.missing.length > 0 ? (
            <p className="mt-4 text-sm text-mist">Still open: {completion.missing.slice(0, 6).join(", ")}.</p>
          ) : (
            <p className="mt-4 text-sm text-lime">Every tracked profile field is filled.</p>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="font-display text-3xl uppercase text-paper">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="secondary" onClick={() => focusSection("profile-editor")}>
                Edit profile
              </Button>
              <Button variant="secondary" onClick={() => focusSection("highlights")}>
                Add a film link
              </Button>
              <ButtonLink href="/tracker" variant="secondary">
                Open recruiting tracker
              </ButtonLink>
              <ButtonLink href="/players" variant="secondary">
                Browse the public list
              </ButtonLink>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="font-display text-3xl uppercase text-paper">
              Recent activity
            </h2>
            <ul className="mt-4 space-y-3">
              {board.activity.map((item) => (
                <li key={item.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-paper">{item.text}</p>
                  <p className="text-xs text-mist">{formatWhen(item.at)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <ProfileForm key={resetNonce} />

      <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className="font-display text-4xl uppercase text-paper">
          Recruiting checklist
        </h2>
        <p className="mt-2 text-sm text-mist">Checking an item updates this list and stays on this device.</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {board.checklist.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-line bg-navy px-3 py-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-lime"
                  checked={item.done}
                  onChange={() => toggleChecklist(item.id)}
                />
                <span>
                  <span className={item.done ? "text-sm font-medium text-mist line-through" : "text-sm font-medium text-paper"}>
                    {item.label}
                  </span>
                  <span className="mt-1 block text-sm text-mist">{item.detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <HighlightsManager />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="schools-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="schools-heading" className="font-display text-3xl uppercase text-paper">
              Saved colleges
            </h2>
            <Link href="/tracker" className="text-sm font-semibold text-lime">
              Manage
            </Link>
          </div>
          {board.colleges.length === 0 ? (
            <p className="mt-3 text-sm text-mist">No schools yet. Add the programs you are researching.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {board.colleges.slice(0, 4).map((college) => (
                <li key={college.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="block text-paper">{college.name}</span>
                    <span className="text-mist">{college.division}</span>
                  </span>
                  <span className="rounded-full border border-line px-2 py-1 capitalize text-paper">
                    {college.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section id="watchlist" className="rounded-2xl border border-line bg-panel p-5" aria-labelledby="watch-heading">
          <h2 id="watch-heading" className="font-display text-3xl uppercase text-paper">
            Saved players
          </h2>
          {savedPlayers.length === 0 ? (
            <p className="mt-3 text-sm text-mist">
              Save a player from Explore or a profile. The watchlist stays in this browser.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {savedPlayers.map((player) => (
                <li key={player.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/players/${player.id}`} className="text-paper hover:text-lime">
                    {player.name}
                    <span className="mt-0.5 block text-mist">{player.position}</span>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => toggleWatch(player.id, player.name)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-line p-5">
        <h2 className="text-sm font-semibold text-paper">Reset demo board</h2>
        <p className="mt-1 text-sm text-mist">Clears profile edits, checklist marks, schools, film links, and saved players on this device.</p>
        {confirmReset ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
              }}
            >
              Confirm reset
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="mt-3" onClick={() => setConfirmReset(true)}>
            Reset demo board
          </Button>
        )}
      </section>
    </Container>
  );
}
