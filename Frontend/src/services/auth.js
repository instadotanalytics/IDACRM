// services/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralised auth storage helpers.
//
// WHY sessionStorage instead of localStorage?
//
// localStorage is shared across ALL browser tabs for the same origin.
// That means if Tab 1 is logged in as super_admin and Tab 2 logs in as
// admin_manager, Tab 2's login call overwrites the token in localStorage,
// instantly corrupting Tab 1's session (wrong token, wrong role, auto-logout).
//
// sessionStorage is ISOLATED per tab:
//   - Each tab gets its own completely independent storage.
//   - A login in Tab 2 never touches Tab 1's session.
//   - sessionStorage persists across page RELOADS of the same tab.
//   - sessionStorage is only cleared when the tab is CLOSED.
//
// The only trade-off: "Remember me" across sessions won't work with
// sessionStorage alone. We handle that by also writing to localStorage
// when the user ticks "Remember me", and reading it back on a fresh tab.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ROLE_KEY = "userRole";
const REMEMBER_KEY = "rememberMe";

// ── write ────────────────────────────────────────────────────────────────────

export const saveAuth = (token, user, rememberMe = false) => {
  // Always normalise the user so both _id and id are present,
  // no matter what shape the backend response uses.
  const userToStore = {
    ...user,
    _id: user._id || user.id,
    id:  user.id  || user._id,
  };

  // Primary storage: sessionStorage (tab-isolated — prevents cross-tab contamination)
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY,  JSON.stringify(userToStore));
  sessionStorage.setItem(ROLE_KEY,  userToStore.role);

  if (rememberMe) {
    // Secondary storage: localStorage (cross-session persistence for "Remember me")
    // This is only used to restore a session when opening a BRAND NEW tab,
    // not to share state between simultaneously open tabs.
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY,  JSON.stringify(userToStore));
    localStorage.setItem(ROLE_KEY,  userToStore.role);
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    // Clear any previous "remember me" data so it doesn't ghost back in
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
};

// ── read ─────────────────────────────────────────────────────────────────────

export const getToken = () => {
  // sessionStorage first (current tab session)
  const ss = sessionStorage.getItem(TOKEN_KEY);
  if (ss) return ss;

  // Fallback to localStorage only when sessionStorage is empty
  // (e.g. brand-new tab opened while "Remember me" was set)
  const ls = localStorage.getItem(TOKEN_KEY);
  if (ls) {
    // Promote to sessionStorage so this tab now owns its own copy
    _restoreFromLocalStorage();
    return ls;
  }

  return null;
};

export const getUser = () => {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  return sessionStorage.getItem(ROLE_KEY)
    || localStorage.getItem(ROLE_KEY)
    || null;
};

export const isAuthenticated = () => !!getToken();

// ── clear ────────────────────────────────────────────────────────────────────

export const clearAuth = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ROLE_KEY);

  // Only remove from localStorage if the user didn't ask to be remembered,
  // OR always remove on explicit logout (the caller decides).
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(REMEMBER_KEY);
};

// ── internal helpers ─────────────────────────────────────────────────────────

const _restoreFromLocalStorage = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user  = localStorage.getItem(USER_KEY);
  const role  = localStorage.getItem(ROLE_KEY);
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (user)  sessionStorage.setItem(USER_KEY,  user);
  if (role)  sessionStorage.setItem(ROLE_KEY,  role);
};