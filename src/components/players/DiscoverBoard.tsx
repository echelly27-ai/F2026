"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/Container";
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
import { PROSPECTS, RANKING_SOURCE } from "@/lib/prospects";
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
        eyebrow="Discover"
        title="2027 recruiting database"
        lede="The publicly listed ESPN 2027 SC Next 100. Search by name, then filter by position, class, height, location, school, rank, and stars."
      />
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-mist">
        {PROSPECTS.length} players were on the public {RANKING_SOURCE.title} page checked {RANKING_SOURCE.checkedOn}.
        Rankings change. High school, hometown, height, weight, stars, and grade are the figures from that table.
        Season stats and GPAs were not on the rows, so they are not shown.{" "}
        {sourceUrl ? (
          <a href={sourceUrl} className="text-lime hover:text-lime-2" target="_blank" rel="noopener noreferrer">
            Open the source ranking
          </a>
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
            placeholder="Beckham Black"
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

      <p className="mt-5 text-sm text-mist" role="status">
        Showing {players.length} of {PROSPECTS.length} publicly listed prospects
      </p>

      {players.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No profiles match"
            body="Try a different name, school, or rank band, or clear the filters to see the full public list."
            action={
              <Button variant="primary" onClick={() => setFilters(INITIAL_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Publicly listed rows from the {RANKING_SOURCE.title}, checked {RANKING_SOURCE.checkedOn}
              </caption>
              <thead className="bg-navy text-xs uppercase tracking-wide text-mist">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Player
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Pos
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Hometown
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Ht
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Wt
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
                    Listed commitment
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Links
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const report = safeHttpsUrl(player.reportUrl);
                  return (
                    <tr key={player.id} className="border-t border-line">
                      <td className="px-3 py-3 font-semibold text-lime">{player.rank}</td>
                      <th scope="row" className="px-3 py-3 font-medium text-paper">
                        <Link href={`/players/${player.id}`} className="hover:text-lime">
                          {player.name}
                        </Link>
                      </th>
                      <td className="px-3 py-3 text-paper">{player.positionAbbr}</td>
                      <td className="px-3 py-3 text-paper">{player.hometown}</td>
                      <td className="px-3 py-3 text-paper">{formatHeight(player.heightInches)}</td>
                      <td className="px-3 py-3 text-paper">{player.weight}</td>
                      <td className="px-3 py-3 text-paper">{player.stars}</td>
                      <td className="px-3 py-3 text-paper">{player.grade}</td>
                      <td className="px-3 py-3 text-paper">{player.school}</td>
                      <td className="px-3 py-3 text-mist">
                        {player.listedCommitment
                          ? `${player.listedCommitment.school} · ${player.listedCommitment.date}`
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <Link href={`/players/${player.id}`} className="text-lime hover:text-lime-2">
                            Profile
                          </Link>
                          {report ? (
                            <a href={report} className="text-lime hover:text-lime-2" target="_blank" rel="noopener noreferrer">
                              Report
                            </a>
                          ) : (
                            <span className="text-mist">No report link</span>
                          )}
                          <span className="text-mist">No video URL</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 font-display text-4xl uppercase text-paper">Cards</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
