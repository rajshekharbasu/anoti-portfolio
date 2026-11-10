const INTRO_KEY = "library-intro-seen";

export function readIntroSeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    // Private browsing can throw. The intro will simply show again next time.
  }
}
