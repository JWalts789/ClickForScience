// ── Shared Security Utilities for Edge Functions ─────────────────────
// CORS validation, HMAC signing, input sanitization, rate limiting helpers.

// ── Allowed Origins ──────────────────────────────────────────────────
// Exact matches + pattern matching for Vercel preview deploys.
const ALLOWED_ORIGINS_EXACT = new Set([
  "https://clickforscience.vercel.app",
  "https://clickforscience.com",
  "https://www.clickforscience.com",
  "http://localhost:5173",
  "http://localhost:4173",
]);

// Vercel preview deploys: clickforscience-*.vercel.app
const VERCEL_PREVIEW_PATTERN = /^https:\/\/clickforscience[a-z0-9-]*\.vercel\.app$/;

/**
 * Validate request origin. Returns the origin if allowed, null if not.
 * Allows missing origin for same-origin requests (sendBeacon, keepalive fetch).
 */
export function validateOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");

  // Same-origin requests (e.g., keepalive fetch from Vercel) may not send Origin.
  // Allow these through with a default origin for CORS headers.
  if (!origin) {
    // Check Referer as fallback
    const referer = req.headers.get("referer");
    if (referer) {
      try {
        const refOrigin = new URL(referer).origin;
        if (ALLOWED_ORIGINS_EXACT.has(refOrigin) || VERCEL_PREVIEW_PATTERN.test(refOrigin)) {
          return refOrigin;
        }
      } catch {}
    }
    // If no origin and no valid referer, still allow — same-origin requests
    // from Vercel won't have cross-origin issues. Use a safe default.
    return "https://clickforscience.vercel.app";
  }

  if (ALLOWED_ORIGINS_EXACT.has(origin)) return origin;
  if (VERCEL_PREVIEW_PATTERN.test(origin)) return origin;

  return null;
}

/**
 * Build CORS headers for a validated origin.
 */
export function corsHeaders(origin: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Signature, X-Timestamp",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle CORS preflight (OPTIONS) requests.
 */
export function handlePreflight(origin: string): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

/**
 * Create a JSON response with CORS headers.
 */
export function jsonResponse(
  data: Record<string, unknown>,
  status: number,
  origin: string
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}

// ── HMAC Signature Verification ──────────────────────────────────────

const HMAC_ALGO = { name: "HMAC", hash: "SHA-256" };
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Verify HMAC-SHA256 signature on a request body.
 * Expects headers: X-Signature (hex), X-Timestamp (ms since epoch).
 * The signed message is: timestamp + "." + body
 *
 * If the server secret is empty/missing, HMAC is SKIPPED (allows
 * the system to work while env vars are being configured).
 */
export async function verifySignature(
  req: Request,
  body: string,
  secret: string
): Promise<{ valid: boolean; error?: string }> {
  // If no HMAC secret configured, skip verification (graceful degradation)
  if (!secret) {
    return { valid: true };
  }

  const signature = req.headers.get("x-signature");
  const timestampStr = req.headers.get("x-timestamp");

  if (!signature || !timestampStr) {
    return { valid: false, error: "Missing signature headers" };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, error: "Invalid timestamp" };
  }

  // Reject stale or future timestamps (replay protection)
  const age = Math.abs(Date.now() - timestamp);
  if (age > TIMESTAMP_TOLERANCE_MS) {
    return { valid: false, error: "Request expired" };
  }

  // Compute expected signature: HMAC-SHA256(secret, timestamp + "." + body)
  const message = `${timestampStr}.${body}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    HMAC_ALGO,
    false,
    ["sign"]
  );

  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (expectedHex.length !== signature.length) {
    return { valid: false, error: "Invalid signature" };
  }

  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true };
}

// ── Input Sanitization ───────────────────────────────────────────────

/**
 * Sanitize a player name: strip HTML, control chars, limit length.
 */
export function sanitizePlayerName(name: string): string {
  return name
    .trim()
    .replace(/[<>\"';&{}\\\/]/g, "") // Strip HTML/injection chars
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, "") // Strip zero-width chars
    .slice(0, 24);
}

/**
 * Validate a UUID v4 format string.
 */
export function isValidUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

// ── Numeric Bounds ───────────────────────────────────────────────────

/**
 * Clamp a number to a range, returning null if not a valid finite number.
 */
export function clampFinite(
  val: unknown,
  min: number,
  max: number
): number | null {
  if (typeof val !== "number" || !isFinite(val)) return null;
  return Math.max(min, Math.min(max, val));
}

// ── Valid Event & Archetype Constants ────────────────────────────────

export const VALID_EVENT_TYPES = new Set([
  "session_start",
  "buy_generator",
  "buy_upgrade",
  "prestige",
  "start_research",
  "specialize",
  "lab_expansion",
  "ascension",
  "start_challenge",
  "event_choice",
]);

export const VALID_ARCHETYPES = new Set([
  "megalomaniac",
  "perfectionist",
  "ethicallyUnhinged",
  "realityBreaker",
  "gadgeteer",
  "accidentalGenius",
]);

export const VALID_CATEGORIES = new Set([
  "totalRPAllTime",
  "fastestPrestige",
  "ascensionCount",
  "madnessLevel",
  "challengesCompleted",
  "clickCount",
]);
