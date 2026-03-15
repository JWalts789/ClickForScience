// ── Music Player ───────────────────────────────────────────────────
// Shuffled playback of all tracks. Plays one at a time, advances on end.

const TRACKS = [
  "/music/CFSTrack01.mp3",
  "/music/CFSTrack02.mp3",
  "/music/CFSTrack03.mp3",
  "/music/CFSTrack04.mp3",
  "/music/CFSTrack05.mp3",
  "/music/CFSTrack06.mp3",
  "/music/CFSTrack07.mp3",
];

const STORAGE_KEY_VOLUME = "cfs_music_volume";
const STORAGE_KEY_MUTED = "cfs_music_muted";

let audio: HTMLAudioElement | null = null;
let queue: string[] = [];
let queueIndex = 0;
let started = false;

// ── Shuffle (Fisher-Yates) ────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue(): void {
  queue = shuffle(TRACKS);
  queueIndex = 0;
}

// ── Playback ──────────────────────────────────────────────────────

function playNext(): void {
  if (!audio) return;

  // If we've gone through the whole queue, reshuffle
  if (queueIndex >= queue.length) {
    buildQueue();
  }

  audio.src = queue[queueIndex];
  queueIndex++;
  audio.play().catch(() => {
    // Autoplay blocked — will resume on user interaction
  });
}

/** Initialize the music system. Call once on app mount. */
export function initMusic(): void {
  if (audio) return;

  audio = new Audio();
  audio.preload = "auto";

  // Restore saved preferences
  const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
  const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
  audio.volume = savedVolume != null ? Number(savedVolume) : 0.3;
  audio.muted = savedMuted === "true";

  // When a track ends, play the next one
  audio.addEventListener("ended", playNext);

  // Build initial shuffled queue
  buildQueue();
}

/** Start playback (must be called from a user gesture the first time). */
export function startMusic(): void {
  if (!audio) initMusic();
  if (started) {
    // If paused, just resume
    audio!.play().catch(() => {});
    return;
  }
  started = true;
  playNext();
}

/** Pause playback. */
export function pauseMusic(): void {
  audio?.pause();
}

/** Toggle play/pause. Returns new playing state. */
export function toggleMusic(): boolean {
  if (!audio) initMusic();
  if (!started) {
    startMusic();
    return true;
  }
  if (audio!.paused) {
    audio!.play().catch(() => {});
    return true;
  } else {
    audio!.pause();
    return false;
  }
}

/** Get whether music is currently playing. */
export function isMusicPlaying(): boolean {
  return !!audio && !audio.paused && started;
}

/** Set volume (0-1). Persists to localStorage. */
export function setMusicVolume(vol: number): void {
  const v = Math.max(0, Math.min(1, vol));
  if (audio) audio.volume = v;
  localStorage.setItem(STORAGE_KEY_VOLUME, String(v));
}

/** Get current volume (0-1). */
export function getMusicVolume(): number {
  if (audio) return audio.volume;
  const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
  return saved != null ? Number(saved) : 0.3;
}

/** Toggle mute. Persists to localStorage. */
export function toggleMute(): boolean {
  if (!audio) initMusic();
  audio!.muted = !audio!.muted;
  localStorage.setItem(STORAGE_KEY_MUTED, String(audio!.muted));
  return audio!.muted;
}

/** Get muted state. */
export function isMuted(): boolean {
  if (audio) return audio.muted;
  return localStorage.getItem(STORAGE_KEY_MUTED) === "true";
}

/** Skip to the next track. */
export function skipTrack(): void {
  if (!audio || !started) return;
  playNext();
}
