import Link from "next/link";
import { PlayerPortrait } from "@/components/players/PlayerPortrait";
import { WatchToggle } from "@/components/players/WatchToggle";
import { formatHeight } from "@/lib/format";
import { rankLabel } from "@/lib/rankings";
import type { Prospect } from "@/lib/types";

export function PlayerCard({ player }: { player: Prospect }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <Link href={`/players/${player.id}`} className="group flex flex-1 flex-col">
        <PlayerPortrait
          player={player}
          frameClassName="aspect-[4/3]"
          sizes="(max-width: 640px) 100vw, 33vw"
          initialsClassName="text-5xl"
        />
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">
            {rankLabel(player)}
            {player.rank == null ? "" : ` · ${player.stars}-star`}
          </p>
          <div>
            <h2 className="font-display text-3xl uppercase leading-none text-paper group-hover:text-lime">
              {player.name}
            </h2>
            <p className="mt-1.5 text-sm text-mist">
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
              <dt className="text-mist">School</dt>
              <dd className="text-paper">{player.school}</dd>
            </div>
          </dl>
          <span className="mt-auto pt-2 text-sm font-semibold text-lime">View full profile</span>
        </div>
      </Link>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <WatchToggle playerId={player.id} playerName={player.name} compact />
      </div>
    </article>
  );
}
