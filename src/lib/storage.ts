import { parseBoard } from "@/lib/board";
import type { BoardState, Session } from "@/lib/types";

export const BOARD_KEY = "nextup-board-v1";
export const BOARDS_KEY = "nextup-boards-v1";
export const SESSION_KEY = "nextup-session-v1";

export function boardNameKey(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

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

function readBoardMap(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BOARDS_KEY);
    if (!raw) return {};
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return value as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeBoardMap(map: Record<string, unknown>) {
  window.localStorage.setItem(BOARDS_KEY, JSON.stringify(map));
}

function profileNameKeys(board: BoardState) {
  const first = board.profile.firstName.trim();
  const last = board.profile.lastName.trim();
  const keys = new Set<string>();
  if (first) keys.add(boardNameKey(first));
  if (first && last) keys.add(boardNameKey(`${first} ${last}`));
  keys.delete("");
  return keys;
}

/** Move the old shared board onto the name stored in it, so a new sign-in does not inherit it. */
export function parkLegacyBoard(sessionName?: string | null) {
  if (typeof window === "undefined") return;
  const legacy = loadBoard();
  if (!legacy) return;
  const keys = profileNameKeys(legacy);
  if (keys.size === 0 && sessionName) {
    const key = boardNameKey(sessionName);
    if (key) keys.add(key);
  }
  if (keys.size === 0) return;
  const map = readBoardMap();
  for (const key of keys) {
    if (!map[key]) map[key] = legacy;
  }
  writeBoardMap(map);
  window.localStorage.removeItem(BOARD_KEY);
}

export function loadNamedBoard(name: string): BoardState | null {
  const wanted = boardNameKey(name);
  if (!wanted || typeof window === "undefined") return null;
  const map = readBoardMap();
  const direct = parseBoard(map[wanted]);
  if (direct) return direct;

  const matches: BoardState[] = [];
  for (const value of Object.values(map)) {
    const board = parseBoard(value);
    if (!board) continue;
    const keys = profileNameKeys(board);
    if (keys.has(wanted)) matches.push(board);
  }
  if (matches.length === 1) return matches[0];
  return null;
}

export function saveNamedBoard(name: string, board: BoardState) {
  if (typeof window === "undefined") return;
  const key = boardNameKey(name);
  if (!key) return;
  const map = readBoardMap();
  map[key] = board;
  writeBoardMap(map);
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
