import Link from "next/link";
import { PlayerPortrait } from "@/components/players/PlayerPortrait";
import { formatHeight, locationLabel } from "@/lib/format";
import type { Prospect } from "@/lib/types";

export function PlayerCard({ player }: { player: Prospect }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <PlayerPortrait
        player={player}
        frameClassName="aspect-[4/5]"
        sizes="(max-width: 768px) 100vw, 33vw"
        initialsClassName="text-5xl"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">
          No. {player.rank} · {player.stars}-star
        </p>
        <div>
          <h2 className="font-display text-3xl uppercase leading-none text-paper">{player.name}</h2>
          <p className="mt-1 text-sm text-mist">
            {player.positionAbbr} · {player.position}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-mist">Height</dt>
            <dd className="text-paper">{formatHeight(player.heightInches)}</dd>
          </div>
          <div>
            <dt className="text-mist">Class</dt>
            <dd className="text-paper">{player.gradYear}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-mist">Location</dt>
            <dd className="text-paper">{locationLabel(player.city, player.state)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-mist">School</dt>
            <dd className="text-paper">{player.school}</dd>
          </div>
        </dl>
        <Link
          href={`/players/${player.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-lime-2"
        >
          View full profile
        </Link>
      </div>
    </article>
  );
}
