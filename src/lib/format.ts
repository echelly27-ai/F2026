export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatHeight(inches: number) {
  const feet = Math.floor(inches / 12);
  const remainder = inches % 12;
  return `${feet}'${remainder}"`;
}

export function formatHeightParts(feet: string, inches: string) {
  if (!feet.trim() && !inches.trim()) return "";
  const feetNum = Number(feet);
  const inchesNum = Number(inches || "0");
  if (!Number.isFinite(feetNum)) return "";
  return `${feetNum}'${Number.isFinite(inchesNum) ? inchesNum : 0}"`;
}

export function formatDate(iso: string) {
  if (!iso) return "Not set";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function todayISO() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function locationLabel(city: string, state: string) {
  return [city, state].filter(Boolean).join(", ");
}
