import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Meeting, SportId } from "@/types";
import { SEED_FAVORITES, SEED_JOINED_IDS, SEED_MEETINGS } from "@/data/mock";
import { max } from "@/lib/max";
import { isPast } from "@/lib/format";

// Local-only persistence: meetings created here are visible to this user only.
// Swap load/save for API calls to share meetings between users.

const STORAGE_KEY = "sportbuddy:v1";

interface PersistedState {
  created: Meeting[];
  joinedIds: string[];
  favorites: SportId[];
  city: string;
}

const initialState: PersistedState = {
  created: [],
  joinedIds: SEED_JOINED_IDS,
  favorites: SEED_FAVORITES,
  city: "Москва",
};

function parse(raw: string | null): PersistedState | null {
  if (!raw) return null;
  try {
    return { ...initialState, ...(JSON.parse(raw) as Partial<PersistedState>) };
  } catch {
    return null;
  }
}

function loadLocal(): PersistedState | null {
  try {
    return parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

interface Store {
  meetings: Meeting[];
  getMeeting(id: string): Meeting | undefined;
  isJoined(id: string): boolean;
  /** Participants including the current user */
  participants(m: Meeting): number;
  join(id: string): void;
  leave(id: string): void;
  create(data: Omit<Meeting, "id" | "joined" | "organizer" | "mine">): Meeting;
  remove(id: string): void;
  favorites: SportId[];
  toggleFavorite(id: SportId): void;
  city: string;
  setCity(city: string): void;
  userName: string;
  stats: { attended: number; created: number; upcoming: number };
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadLocal() ?? initialState);
  const [hydrated, setHydrated] = useState(() => loadLocal() !== null);

  // Inside MAX, localStorage of the webview may be wiped — fall back to DeviceStorage.
  useEffect(() => {
    if (hydrated) return;
    let cancelled = false;
    max.storage.get(STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      const restored = parse(raw);
      if (restored) setState(restored);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const raw = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      // storage unavailable (private mode) — keep in memory only
    }
    max.storage.set(STORAGE_KEY, raw);
  }, [state, hydrated]);

  const userName = max.user
    ? [max.user.first_name, max.user.last_name].filter(Boolean).join(" ")
    : "Алексей Морозов";

  const meetings = useMemo(() => [...state.created, ...SEED_MEETINGS], [state.created]);
  const joinedSet = useMemo(() => new Set(state.joinedIds), [state.joinedIds]);

  const getMeeting = useCallback((id: string) => meetings.find((m) => m.id === id), [meetings]);
  const isJoined = useCallback((id: string) => joinedSet.has(id), [joinedSet]);
  const participants = useCallback(
    (m: Meeting) => m.joined + (joinedSet.has(m.id) ? 1 : 0),
    [joinedSet],
  );

  const join = useCallback((id: string) => {
    setState((s) => (s.joinedIds.includes(id) ? s : { ...s, joinedIds: [...s.joinedIds, id] }));
  }, []);

  const leave = useCallback((id: string) => {
    setState((s) => ({ ...s, joinedIds: s.joinedIds.filter((x) => x !== id) }));
  }, []);

  const create = useCallback<Store["create"]>(
    (data) => {
      const meeting: Meeting = {
        ...data,
        id: `u${Date.now()}`,
        joined: 0,
        organizer: userName,
        mine: true,
      };
      // The organizer takes part in their own meeting
      setState((s) => ({ ...s, created: [meeting, ...s.created], joinedIds: [...s.joinedIds, meeting.id] }));
      return meeting;
    },
    [userName],
  );

  const remove = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      created: s.created.filter((m) => m.id !== id),
      joinedIds: s.joinedIds.filter((x) => x !== id),
    }));
  }, []);

  const toggleFavorite = useCallback((id: SportId) => {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
    }));
  }, []);

  const setCity = useCallback((city: string) => setState((s) => ({ ...s, city })), []);

  const stats = useMemo(() => {
    const mine = meetings.filter((m) => joinedSet.has(m.id));
    return {
      attended: mine.filter((m) => isPast(m.date, m.time)).length,
      upcoming: mine.filter((m) => !isPast(m.date, m.time)).length,
      created: state.created.length,
    };
  }, [meetings, joinedSet, state.created.length]);

  const value: Store = {
    meetings,
    getMeeting,
    isJoined,
    participants,
    join,
    leave,
    create,
    remove,
    favorites: state.favorites,
    toggleFavorite,
    city: state.city,
    setCity,
    userName,
    stats,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
