import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/format";
import type { Prospect } from "@/lib/types";

const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);

export function hasPlayerPhoto(photo: string) {
  return photo.startsWith("/images/players/");
}

export function playerInitials(name: string) {
  const parts = name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter((part) => part && !SUFFIXES.has(part.toLowerCase()));
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export function PlayerPortrait({
  player,
  frameClassName,
  sizes,
  priority = false,
  initialsClassName,
  decorative = false,
}: {
  player: Pick<Prospect, "name" | "photo" | "photoAlt">;
  frameClassName?: string;
  sizes?: string;
  priority?: boolean;
  initialsClassName?: string;
  decorative?: boolean;
}) {
  if (!hasPlayerPhoto(player.photo)) {
    return (
      <div
        className={cn("flex items-center justify-center bg-navy", frameClassName)}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `No photo available for ${player.name}`}
        aria-hidden={decorative ? true : undefined}
      >
        <span className={cn("font-display leading-none text-lime", initialsClassName ?? "text-3xl")}>
          {playerInitials(player.name)}
        </span>
      </div>
    );
  }

  return (
    <SafeImage
      src={player.photo}
      alt={decorative ? "" : player.photoAlt}
      frameClassName={frameClassName}
      sizes={sizes}
      priority={priority}
    />
  );
}
