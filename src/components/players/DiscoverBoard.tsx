"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/Container";
import { PlayerPortrait } from "@/components/players/PlayerPortrait";
import { PlayerCard } from "@/components/players/PlayerCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { formatHeight } from "@/lib/format";
import { safeHttpsUrl } from "@/lib/media";
import {
  filterPlayers,
  INITIAL_FILTERS,
  type PlayerFilters,
  type RankFilter,
  type StarFilter,
} from "@/lib/filters";
import { groupByGraduationClass, RANKING_SOURCE } from "@/lib/rankings";
import { PROSPECTS } from "@/lib/prospects";
import { POSITIONS, type Position } from "@/lib/types";

const YEARS = Array.from(new Set(PROSPECTS.map((player) => String(player.gradYear)))).sort();
const STATES = Array.from(new Set(PROSPECTS.map((player) => player.state))).sort();

export function DiscoverBoard() {
  const [filters, setFilters] = useState<PlayerFilters>(INITIAL_FILTERS);
  const players = useMemo(() => filterPlayers(PROSPECTS, filters), [filters]);
  const sourceUrl = safeHttpsUrl(RANKING_SOURCE.url);

  function update<K extends keyof PlayerFilters>(key: K, value: PlayerFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Browse and explore"
        title="Find players"
        lede="Search the public directory, filter with the fields that are stored, and open a full profile. The published ranking is below, grouped by class."
      />
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-mist">
        {PROSPECTS.length} players are stored from the {RANKING_SOURCE.publisher} {RANKING_SOURCE.title}, checked{" "}
        {RANKING_SOURCE.checkedOn}. Rankings change. Missing stats and academics stay blank.{" "}
        <a href="#rankings" className="text-lime hover:text-lime-2">
          Compare the ranking
        </a>
        {sourceUrl ? (
          <>
            {" "}
            or{" "}
            <a href={sourceUrl} className="text-lime hover:text-lime-2" target="_blank" rel="noopener noreferrer">
              open the ESPN source
            </a>
          </>
        ) : null}
        .
      </p>

      <form
        className="mt-6 grid gap-4 rounded-2xl border border-line bg-panel p-4 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field label="Search by name" id="player-search">
          <input
            id="player-search"
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            className={inputClass}
            placeholder="Name, school, or city"
            autoComplete="off"
          />
        </Field>
        <Field label="School" id="player-school">
          <input
            id="player-school"
            value={filters.school}
            onChange={(event) => update("school", event.target.value)}
            className={inputClass}
            placeholder="Montverde Academy"
            autoComplete="off"
          />
        </Field>
        <Field label="Position" id="player-position">
          <select
            id="player-position"
            value={filters.position}
            onChange={(event) => update("position", event.target.value as Position | "any")}
            className={inputClass}
          >
            <option value="any">All positions</option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Graduation year" id="player-year">
          <select
            id="player-year"
            value={filters.gradYear}
            onChange={(event) => update("gradYear", event.target.value)}
            className={inputClass}
          >
            <option value="any">All classes</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Height" id="player-height">
          <select
            id="player-height"
            value={filters.height}
            onChange={(event) => update("height", event.target.value as PlayerFilters["height"])}
            className={inputClass}
          >
            <option value="any">Any height</option>
            <option value="lt70">Under 5&apos;10&quot;</option>
            <option value="70-74">5&apos;10&quot; – 6&apos;2&quot;</option>
            <option value="75-78">6&apos;3&quot; – 6&apos;6&quot;</option>
            <option value="79plus">6&apos;7&quot; and taller</option>
          </select>
        </Field>
        <Field label="Location" id="player-state">
          <select
            id="player-state"
            value={filters.state}
            onChange={(event) => update("state", event.target.value)}
            className={inputClass}
          >
            <option value="any">All locations</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rank" id="player-rank">
          <select
            id="player-rank"
            value={filters.rank}
            onChange={(event) => update("rank", event.target.value as RankFilter)}
            className={inputClass}
          >
            <option value="any">All ranks</option>
            <option value="1-10">1–10</option>
            <option value="11-25">11–25</option>
            <option value="26-50">26–50</option>
            <option value="51-100">51–100</option>
            <option value="unranked">Unranked</option>
          </select>
        </Field>
        <Field label="Stars" id="player-stars">
          <select
            id="player-stars"
            value={filters.stars}
            onChange={(event) => update("stars", event.target.value as StarFilter)}
            className={inputClass}
          >
            <option value="any">All star ratings</option>
            <option value="5">5-star</option>
            <option value="4">4-star</option>
          </select>
        </Field>
        <Field label="Sort" id="player-sort">
          <select
            id="player-sort"
            value={filters.sort}
            onChange={(event) => update("sort", event.target.value as PlayerFilters["sort"])}
            className={inputClass}
          >
            <option value="rank">Rank</option>
            <option value="stars">Stars</option>
            <option value="name">Name (A–Z)</option>
            <option value="height">Height</option>
            <option value="position">Position</option>
            <option value="year">Graduation year</option>
          </select>
        </Field>
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={() => setFilters(INITIAL_FILTERS)}>
            Clear filters
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-mist" role="status">
        Showing {players.length} of {PROSPECTS.length} publicly listed prospects
      </p>

      {players.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No profiles match"
            body="Try another name, school, class, or rank band. Clear the filters to see everyone stored from the public list."
            action={
              <Button variant="primary" onClick={() => setFilters(INITIAL_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          <section id="rankings" className="mt-16 scroll-mt-24 border-t border-line pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Secondary</p>
            <h2 className="mt-2 font-display text-5xl uppercase text-paper">Rankings</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist">
              {RANKING_SOURCE.publisher} {RANKING_SOURCE.title}, checked {RANKING_SOURCE.checkedOn}. Classes are grouped
              from the stored graduation year. A player without a published rank stays marked Unranked. This table uses
              the same filters as the cards above.
            </p>
            {groupByGraduationClass(players).map((group) => (
              <div key={group.year} className="mt-8">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h3 className="font-display text-3xl uppercase text-paper">Class of {group.year}</h3>
                  <p className="text-sm text-mist">
                    {group.ranked} ranked
                    {group.unranked > 0 ? ` · ${group.unranked} unranked` : ""}
                  </p>
                </div>
                <p className="mt-2 text-xs text-mist sm:hidden">Swipe sideways to compare columns.</p>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-ink">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <caption className="sr-only">
                      Class of {group.year} from the {RANKING_SOURCE.title}, checked {RANKING_SOURCE.checkedOn}
                    </caption>
                    <thead className="bg-navy text-[11px] uppercase tracking-[0.14em] text-mist">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Player
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Position
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Hometown
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Height
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Weight
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Stars
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Grade
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    School
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Links
                  </th>
                </tr>
              </thead>
                    <tbody>
                      {group.players.map((player) => {
                        const report = safeHttpsUrl(player.reportUrl);
                        const video = player.videoUrl ? safeHttpsUrl(player.videoUrl) : null;
                        return (
                          <tr key={player.id} className="border-t border-line odd:bg-ink even:bg-navy/60">
                            <td className="px-3 py-2 font-display text-2xl text-lime">
                              {player.rank == null ? (
                                <span className="text-sm font-semibold tracking-normal text-mist">Unranked</span>
                              ) : (
                                player.rank
                              )}
                            </td>
                      <th scope="row" className="px-3 py-2 font-medium text-paper">
                        <div className="flex items-center gap-3">
                          <PlayerPortrait
                            player={player}
                            decorative
                            frameClassName="h-12 w-10 shrink-0 rounded-md"
                            sizes="40px"
                            initialsClassName="text-xs"
                          />
                          <Link href={`/players/${player.id}`} className="hover:text-lime">
                            {player.name}
                          </Link>
                        </div>
                      </th>
                      <td className="px-3 py-2 font-semibold text-paper" title={player.position}>
                        {player.positionAbbr}
                      </td>
                      <td className="px-3 py-2 text-paper">{player.hometown}</td>
                      <td className="px-3 py-2 text-paper">{formatHeight(player.heightInches)}</td>
                      <td className="px-3 py-2 text-paper">{player.weight}</td>
                      <td className="px-3 py-2">
                        <span aria-label={`${player.stars} stars`} className="text-lime">
                          {"★".repeat(player.stars)}
                          <span className="text-line">{"★".repeat(Math.max(0, 5 - player.stars))}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-paper">{player.grade}</td>
                      <td className="px-3 py-2 text-paper">{player.school}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          {video ? (
                            <a href={video} className="text-lime hover:text-lime-2" target="_blank" rel="noopener noreferrer">
                              Video
                            </a>
                          ) : null}
                          {report ? (
                            <a href={report} className="text-lime hover:text-lime-2" target="_blank" rel="noopener noreferrer">
                              Scouting report
                            </a>
                          ) : (
                            <span className="text-mist">—</span>
                          )}
                        </div>
                      </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </Container>
  );
}
