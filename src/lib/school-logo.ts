import logoData from "@/data/school-logos.json";

const LOGOS = logoData as Record<string, string>;

// Header marks that are drawn in dark ink disappear on the navy chip.
const PAPER_CHIP = new Set([
  "/logos/198385.svg",
  "/logos/139959.svg",
  "/logos/178244.svg",
  "/logos/209409.svg",
]);

export function schoolLogo(collegeId: string) {
  return LOGOS[collegeId] ?? null;
}

export function logoOnPaper(logo: string) {
  return PAPER_CHIP.has(logo);
}

export function schoolInitial(name: string) {
  const letter = name.trim().charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(letter) ? letter : "?";
}

export function publicAsset(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/") || !base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}
