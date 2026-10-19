import { ExternalLink } from "lucide-react";
import { isHudlUrl, safeHttpsUrl, youtubeId } from "@/lib/media";

export function FilmFrame({
  title,
  url,
  note,
}: {
  title: string;
  url: string;
  note?: string;
}) {
  const safe = safeHttpsUrl(url);
  const videoId = safe ? youtubeId(safe) : null;
  const hudl = safe ? isHudlUrl(safe) : false;

  return (
    <div className="space-y-2">
      {videoId ? (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : safe ? (
        <a
          href={safe}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-navy px-4 py-4 text-sm font-semibold text-paper transition hover:border-lime"
        >
          <span>{hudl ? "Open Hudl link" : "Open film link"}</span>
          <ExternalLink aria-hidden="true" size={16} />
        </a>
      ) : (
        <p className="rounded-2xl border border-line bg-navy px-4 py-4 text-sm text-mist">
          This link is not a safe https URL, so it is not opened from NEXTUP.
        </p>
      )}
      <p className="text-sm font-medium text-paper">{title}</p>
      {note ? <p className="text-sm text-mist">{note}</p> : null}
    </div>
  );
}
