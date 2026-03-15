// ── Player Identity ────────────────────────────────────────────────
// Anonymous identity stored in localStorage alongside the game save.

const PLAYER_ID_KEY = "cfs_player_id";
const PLAYER_NAME_KEY = "cfs_player_name";

function generateUUID(): string {
  // crypto.randomUUID is available in all modern browsers
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getPlayerName(): string {
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "";
}

export function setPlayerName(name: string): void {
  const sanitized = name.trim().slice(0, 24);
  localStorage.setItem(PLAYER_NAME_KEY, sanitized);
}

export function hasPlayerName(): boolean {
  const name = localStorage.getItem(PLAYER_NAME_KEY);
  return !!name && name.trim().length > 0;
}
