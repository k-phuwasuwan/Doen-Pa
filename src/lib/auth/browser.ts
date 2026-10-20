export const AUTH_CHANGED_KEY = "doen-pa-auth-changed";

/** Only a change signal, never credentials or tokens, is shared via localStorage. */
export function notifyAuthChanged() {
  try { localStorage.setItem(AUTH_CHANGED_KEY, crypto.randomUUID()); } catch { /* Storage may be unavailable. */ }
}
