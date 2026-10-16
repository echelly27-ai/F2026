import { parseBoard } from "@/lib/board";
import type { BoardState, Session } from "@/lib/types";

export const BOARD_KEY = "nextup-board-v1";
export const SESSION_KEY = "nextup-session-v1";

export function storageAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const key = "__nextup_probe";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadBoard(): BoardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BOARD_KEY);
    if (!raw) return null;
    return parseBoard(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveBoard(board: BoardState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOARD_KEY, JSON.stringify(board));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Session;
    if (!value || (value.mode !== "demo" && value.mode !== "supabase")) return null;
    if (typeof value.email !== "string" || typeof value.name !== "string") return null;
    return value;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
