"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createDefaultBoard, withActivity } from "@/lib/board";
import {
  clearSession,
  loadBoard,
  loadSession,
  saveBoard,
  saveSession,
  storageAvailable,
} from "@/lib/storage";
import { getSupabase, isSupabaseConfigured, pullBoard, pushBoard } from "@/lib/supabase";
import type { AthleteProfile, BoardState, CollegeEntry, Highlight, Session } from "@/lib/types";
import { validateHighlight, validateProfile } from "@/lib/validate";

interface AppContextValue {
  ready: boolean;
  storageOk: boolean;
  supabaseEnabled: boolean;
  warning: string | null;
  session: Session | null;
  board: BoardState;
  resetNonce: number;
  signInDemo: (name: string, email: string) => void;
  signInSupabase: (email: string, password: string) => Promise<string | null>;
  signUpSupabase: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (profile: AthleteProfile) => Record<string, string> | null;
  toggleChecklist: (id: string) => void;
  addHighlight: (title: string, url: string) => Record<string, string> | null;
  removeHighlight: (id: string) => void;
  addCollege: (entry: Omit<CollegeEntry, "id">) => string | null;
  updateCollege: (id: string, patch: Partial<CollegeEntry>, activity?: string) => void;
  removeCollege: (id: string) => void;
  restoreCollege: (entry: CollegeEntry) => void;
  toggleWatch: (playerId: string, playerName: string) => void;
  savePlayerNote: (playerId: string, note: string, playerName: string) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyName(board: BoardState, session: Session | null) {
  if (!session) return board;
  if (session.mode === "demo") {
    const parts = session.name.trim().split(/\s+/);
    return {
      ...board,
      profile: {
        ...board.profile,
        firstName: board.profile.firstName || parts[0] || "",
        lastName: board.profile.lastName || parts.slice(1).join(" "),
        email: board.profile.email || session.email,
      },
    };
  }
  return {
    ...board,
    profile: {
      ...board.profile,
      email: board.profile.email || session.email,
    },
  };
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [board, setBoard] = useState<BoardState>(() => createDefaultBoard());
  const [resetNonce, setResetNonce] = useState(0);
  const supabaseEnabled = isSupabaseConfigured();

  useEffect(() => {
    let cancel = false;
    (async () => {
      const localBoard = loadBoard();
      const localSession = loadSession();
      let nextBoard = localBoard ?? createDefaultBoard();
      let nextSession: Session | null = localSession?.mode === "demo" ? localSession : null;
      let nextWarning: string | null = null;

      if (localSession?.mode !== "demo") {
        try {
          const supabase = await getSupabase();
          if (supabase) {
            const { data, error } = await supabase.auth.getSession();
            if (!error && data.session?.user) {
              const user = data.session.user;
              nextSession = {
                mode: "supabase",
                email: user.email ?? "",
                name: user.email ?? "Account",
                userId: user.id,
              };
              saveSession(nextSession);
              const pulled = await pullBoard(supabase, user.id);
              if (pulled.board) nextBoard = pulled.board;
              if (pulled.warning) nextWarning = pulled.warning;
            } else if (localSession?.mode === "supabase") {
              clearSession();
            }
          }
        } catch {
          nextWarning = "Supabase could not be reached. Using the board stored on this device.";
        }
      }

      if (cancel) return;
      setBoard(applyName(nextBoard, nextSession));
      setSession(nextSession);
      setWarning(nextWarning);
      setStorageOk(storageAvailable());
      setReady(true);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !storageOk) return;
    try {
      saveBoard(board);
    } catch {
      // The board remains in memory for this visit if storage rejects the write.
    }
  }, [board, ready, storageOk]);

  useEffect(() => {
    if (!ready || session?.mode !== "supabase" || !session.userId) return;
    const userId = session.userId;
    const snapshot = board;
    const handle = window.setTimeout(() => {
      void (async () => {
        const supabase = await getSupabase();
        if (!supabase) return;
        const message = await pushBoard(supabase, userId, snapshot);
        if (message) {
          setWarning(
            "Cloud save failed. Your board is still stored on this device. Apply supabase/schema.sql if you have not created athlete_boards.",
          );
        }
      })();
    }, 700);
    return () => window.clearTimeout(handle);
  }, [board, ready, session]);

  const value = useMemo<AppContextValue>(() => {
    const stamp = (next: BoardState) => ({ ...next, updatedAt: new Date().toISOString() });

    return {
      ready,
      storageOk,
      supabaseEnabled,
      warning,
      session,
      board,
      resetNonce,
      signInDemo: (name, email) => {
        const nextSession: Session = { mode: "demo", name: name.trim(), email: email.trim() };
        setSession(nextSession);
        saveSession(nextSession);
        setBoard((prev) => {
          const named = applyName(prev, nextSession);
          return stamp({
            ...named,
            activity: withActivity(prev.activity, "Demo session started on this device."),
          });
        });
        setResetNonce((nonce) => nonce + 1);
      },
      signInSupabase: async (email, password) => {
        const supabase = await getSupabase();
        if (!supabase) return "Supabase is not configured.";
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) return error.message;
        if (!data.user) return "No account was returned.";
        const nextSession: Session = {
          mode: "supabase",
          email: data.user.email ?? email.trim(),
          name: data.user.email ?? email.trim(),
          userId: data.user.id,
        };
        setSession(nextSession);
        saveSession(nextSession);
        const pulled = await pullBoard(supabase, data.user.id);
        if (pulled.warning) setWarning(pulled.warning);
        if (pulled.board) {
          setBoard(stamp(applyName(pulled.board, nextSession)));
        } else {
          setBoard((prev) =>
            stamp({
              ...applyName(prev, nextSession),
              activity: withActivity(prev.activity, "Signed in with Supabase. This device's board will sync."),
            }),
          );
        }
        setResetNonce((nonce) => nonce + 1);
        return null;
      },
      signUpSupabase: async (email, password) => {
        const supabase = await getSupabase();
        if (!supabase) return "Supabase is not configured.";
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) return error.message;
        if (data.session && data.user) {
          const nextSession: Session = {
            mode: "supabase",
            email: data.user.email ?? email.trim(),
            name: data.user.email ?? email.trim(),
            userId: data.user.id,
          };
          setSession(nextSession);
          saveSession(nextSession);
          setBoard((prev) =>
            stamp({
              ...applyName(prev, nextSession),
              activity: withActivity(prev.activity, "Created a Supabase account and kept this device's board."),
            }),
          );
          return null;
        }
        return "CONFIRM: Account created. Confirm the email from Supabase, then sign in. Demo mode still works now.";
      },
      signOut: async () => {
        if (session?.mode === "supabase") {
          const supabase = await getSupabase();
          await supabase?.auth.signOut();
        }
        setSession(null);
        clearSession();
      },
      updateProfile: (profile) => {
        const errors = validateProfile(profile);
        if (Object.keys(errors).length > 0) return errors;
        setBoard((prev) =>
          stamp({
            ...prev,
            profile: {
              ...profile,
              firstName: profile.firstName.trim(),
              lastName: profile.lastName.trim(),
              email: profile.email.trim(),
              highlights: prev.profile.highlights,
            },
            activity: withActivity(prev.activity, "Updated your profile."),
          }),
        );
        return null;
      },
      toggleChecklist: (id) => {
        setBoard((prev) => {
          const item = prev.checklist.find((entry) => entry.id === id);
          if (!item) return prev;
          const done = !item.done;
          return stamp({
            ...prev,
            checklist: prev.checklist.map((entry) => (entry.id === id ? { ...entry, done } : entry)),
            activity: withActivity(
              prev.activity,
              `${done ? "Checked" : "Unchecked"} “${item.label}”.`,
            ),
          });
        });
      },
      addHighlight: (title, url) => {
        const errors = validateHighlight(title, url);
        if (Object.keys(errors).length > 0) return errors;
        if (board.profile.highlights.length >= 8) {
          return { title: "You can keep up to 8 film links." };
        }
        const highlight: Highlight = {
          id: crypto.randomUUID(),
          title: title.trim(),
          url: url.trim(),
        };
        setBoard((prev) =>
          stamp({
            ...prev,
            profile: { ...prev.profile, highlights: [...prev.profile.highlights, highlight] },
            activity: withActivity(prev.activity, `Added film link “${highlight.title}”.`),
          }),
        );
        return null;
      },
      removeHighlight: (id) => {
        setBoard((prev) => {
          const highlight = prev.profile.highlights.find((item) => item.id === id);
          if (!highlight) return prev;
          return stamp({
            ...prev,
            profile: {
              ...prev.profile,
              highlights: prev.profile.highlights.filter((item) => item.id !== id),
            },
            activity: withActivity(prev.activity, `Removed film link “${highlight.title}”.`),
          });
        });
      },
      addCollege: (entry) => {
        const name = entry.name.trim();
        const duplicate = board.colleges.some(
          (college) => college.name.toLowerCase() === name.toLowerCase(),
        );
        if (duplicate) return "That school is already on your board.";
        const college: CollegeEntry = { ...entry, id: crypto.randomUUID(), name };
        setBoard((prev) =>
          stamp({
            ...prev,
            colleges: [college, ...prev.colleges],
            activity: withActivity(prev.activity, `Added ${college.name} to ${college.status}.`),
          }),
        );
        return null;
      },
      updateCollege: (id, patch, activity) => {
        setBoard((prev) =>
          stamp({
            ...prev,
            colleges: prev.colleges.map((college) => (college.id === id ? { ...college, ...patch } : college)),
            activity: activity ? withActivity(prev.activity, activity) : prev.activity,
          }),
        );
      },
      removeCollege: (id) => {
        setBoard((prev) => {
          const college = prev.colleges.find((item) => item.id === id);
          if (!college) return prev;
          return stamp({
            ...prev,
            colleges: prev.colleges.filter((item) => item.id !== id),
            activity: withActivity(prev.activity, `Removed ${college.name} from your board.`),
          });
        });
      },
      restoreCollege: (entry) => {
        setBoard((prev) => {
          if (prev.colleges.some((college) => college.id === entry.id)) return prev;
          return stamp({
            ...prev,
            colleges: [entry, ...prev.colleges],
            activity: withActivity(prev.activity, `Restored ${entry.name}.`),
          });
        });
      },
      toggleWatch: (playerId, playerName) => {
        setBoard((prev) => {
          const saved = prev.watchlist.includes(playerId);
          return stamp({
            ...prev,
            watchlist: saved
              ? prev.watchlist.filter((id) => id !== playerId)
              : [...prev.watchlist, playerId],
            activity: withActivity(
              prev.activity,
              saved
                ? `Removed interest in the ${playerName} demonstration profile.`
                : `Saved interest in the ${playerName} demonstration profile.`,
            ),
          });
        });
      },
      savePlayerNote: (playerId, note, playerName) => {
        const trimmed = note.trim();
        setBoard((prev) => {
          const notes = trimmed
            ? [
                ...prev.notes.filter((item) => item.playerId !== playerId),
                { playerId, note: trimmed.slice(0, 500), savedAt: new Date().toISOString() },
              ]
            : prev.notes.filter((item) => item.playerId !== playerId);
          return stamp({
            ...prev,
            notes,
            activity: withActivity(
              prev.activity,
              trimmed
                ? `Saved a private note on the ${playerName} demonstration profile.`
                : `Cleared the private note on the ${playerName} demonstration profile.`,
            ),
          });
        });
      },
      resetDemo: () => {
        const fresh = createDefaultBoard();
        const named = applyName(fresh, session);
        setBoard(
          stamp({
            ...named,
            activity: withActivity(named.activity, "Reset the demo board on this device."),
          }),
        );
        setResetNonce((nonce) => nonce + 1);
      },
    };
  }, [board, ready, resetNonce, session, storageOk, supabaseEnabled, warning]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProviders");
  return context;
}

export function useOptionalApp() {
  return useContext(AppContext);
}
