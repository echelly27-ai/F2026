"use client";

import { useMemo, useState } from "react";
import { Container, PageHeader } from "@/components/layout/Container";
import { PlayerCard } from "@/components/players/PlayerCard";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { DEMO_PLAYERS } from "@/lib/demo-players";
import { filterPlayers, INITIAL_FILTERS, type PlayerFilters } from "@/lib/filters";
import { POSITIONS, type Position } from "@/lib/types";

const YEARS = Array.from(new Set(DEMO_PLAYERS.map((player) => String(player.gradYear)))).sort();
const STATES = Array.from(new Set(DEMO_PLAYERS.map((player) => player.state))).sort();

export function DiscoverBoard() {
  const [filters, setFilters] = useState<PlayerFilters>(INITIAL_FILTERS);
  const players = useMemo(() => filterPlayers(DEMO_PLAYERS, filters), [filters]);

  function update<K extends keyof PlayerFilters>(key: K, value: PlayerFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Discover"
        title="Demonstration players"
        lede="Search fictional profiles by name, then narrow by position, class, height, and location. Every card is product demo data."
      />
      <div className="mt-6">
        <DemoNote>
          These are not real recruits, seasons, or academic records. Photos are stock basketball images.
        </DemoNote>
      </div>

      <form
        className="mt-6 grid gap-4 rounded-2xl border border-line bg-panel p-4 md:grid-cols-2 xl:grid-cols-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="xl:col-span-2">
          <Field label="Search by name" id="player-search">
            <input
              id="player-search"
              value={filters.query}
              onChange={(event) => update("query", event.target.value)}
              className={inputClass}
              placeholder="Jordan Hale"
              autoComplete="off"
            />
          </Field>
        </div>
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
        <Field label="Sort" id="player-sort">
          <select
            id="player-sort"
            value={filters.sort}
            onChange={(event) => update("sort", event.target.value as PlayerFilters["sort"])}
            className={inputClass}
          >
            <option value="name">Name (A–Z)</option>
            <option value="year">Graduation year</option>
            <option value="height">Height</option>
            <option value="position">Position</option>
          </select>
        </Field>
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={() => setFilters(INITIAL_FILTERS)}>
            Clear filters
          </Button>
        </div>
      </form>

      <p className="mt-5 text-sm text-mist" role="status">
        Showing {players.length} of {DEMO_PLAYERS.length} demonstration profiles
      </p>

      {players.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No profiles match"
            body="Try a different name, or clear the filters to see the full demonstration roster."
            action={
              <Button variant="primary" onClick={() => setFilters(INITIAL_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </Container>
  );
}
