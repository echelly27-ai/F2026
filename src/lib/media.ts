const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export function safeHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function youtubeId(value: string): string | null {
  const safe = safeHttpsUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  let id = "";
  if (url.hostname === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v") ?? "";
  } else if (url.pathname.startsWith("/embed/")) {
    id = url.pathname.split("/")[2] ?? "";
  } else if (url.pathname.startsWith("/shorts/")) {
    id = url.pathname.split("/")[2] ?? "";
  }

  return /^[\w-]{11}$/.test(id) ? id : null;
}

export function isHudlUrl(value: string) {
  const safe = safeHttpsUrl(value);
  if (!safe) return false;
  const host = new URL(safe).hostname;
  return host === "hudl.com" || host.endsWith(".hudl.com");
}

export const SAMPLE_FILM_NOTE =
  "Sample public skills video for this layout. It is not film of the fictional player.";
