const PREFS_NAME = "FixWheelPrefs";

export interface Session {
  username: string;
  usercnic: string;
  usertype: "customer" | "mechanic";
  isLoggedIn: boolean;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return sessionStorage;
}

/** Remove old localStorage sessions so the app never auto-logs in from a past visit. */
function purgeLegacyLocalStorage() {
  if (typeof window === "undefined") return;
  ["username", "usercnic", "usertype", "isLoggedIn"].forEach((k) =>
    localStorage.removeItem(`${PREFS_NAME}:${k}`)
  );
}

export function getSession(): Session | null {
  purgeLegacyLocalStorage();
  const s = storage();
  if (!s) return null;
  const isLoggedIn = s.getItem(`${PREFS_NAME}:isLoggedIn`) === "true";
  if (!isLoggedIn) return null;
  const username = s.getItem(`${PREFS_NAME}:username`) ?? "";
  const usercnic = s.getItem(`${PREFS_NAME}:usercnic`) ?? "";
  const usertype = s.getItem(`${PREFS_NAME}:usertype`) as
    | "customer"
    | "mechanic"
    | null;
  if (!usertype) return null;
  return { username, usercnic, usertype, isLoggedIn };
}

export function setSession(session: Omit<Session, "isLoggedIn">) {
  purgeLegacyLocalStorage();
  const s = storage();
  if (!s) return;
  s.setItem(`${PREFS_NAME}:username`, session.username);
  s.setItem(`${PREFS_NAME}:usercnic`, session.usercnic);
  s.setItem(`${PREFS_NAME}:usertype`, session.usertype);
  s.setItem(`${PREFS_NAME}:isLoggedIn`, "true");
}

export function clearSession() {
  purgeLegacyLocalStorage();
  const s = storage();
  if (!s) return;
  ["username", "usercnic", "usertype", "isLoggedIn"].forEach((k) =>
    s.removeItem(`${PREFS_NAME}:${k}`)
  );
}
