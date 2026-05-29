import { useSyncExternalStore } from "react";
import type { AuthSession } from "../types/api";

const SESSION_KEY = "ramepos.session";

function loadFromStorage(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

// ─── Estado interno ───────────────────────────────────────────────────────────

type SessionState = {
  session: AuthSession | null;
  setSession: (s: AuthSession) => void;
  clearSession: () => void;
};

let state: SessionState = {
  session:      loadFromStorage(),
  setSession:   (s) => { setState({ session: s }); persist(s); },
  clearSession: ()  => { setState({ session: null }); persist(null); },
};

const listeners = new Set<() => void>();

function setState(partial: Partial<SessionState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function persist(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

// ─── Hook público ─────────────────────────────────────────────────────────────

export function useSessionStore<T>(selector: (s: SessionState) => T): T {
  return selector(useSyncExternalStore(subscribe, getSnapshot));
}
