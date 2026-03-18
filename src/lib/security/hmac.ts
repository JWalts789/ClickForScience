// ── Client-side HMAC Signing ──────────────────────────────────────────
// Signs outgoing API requests with HMAC-SHA256.
// The secret is injected at build time via VITE_HMAC_SECRET.

const HMAC_ALGO = { name: "HMAC", hash: "SHA-256" };
const SECRET = import.meta.env.VITE_HMAC_SECRET ?? "";

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const encoder = new TextEncoder();
  cachedKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    HMAC_ALGO,
    false,
    ["sign"]
  );
  return cachedKey;
}

/**
 * Sign a request body with HMAC-SHA256.
 * Returns { signature, timestamp } to include as headers.
 */
export async function signPayload(body: string): Promise<{
  signature: string;
  timestamp: string;
}> {
  const timestamp = Date.now().toString();
  const message = `${timestamp}.${body}`;
  const encoder = new TextEncoder();

  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));

  const signature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { signature, timestamp };
}

/**
 * Create a signed fetch request (POST with HMAC headers).
 */
export async function signedFetch(
  url: string,
  payload: unknown,
  options?: { keepalive?: boolean }
): Promise<Response> {
  const body = JSON.stringify(payload);
  const { signature, timestamp } = await signPayload(body);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": signature,
      "X-Timestamp": timestamp,
    },
    body,
    keepalive: options?.keepalive,
  });
}

/**
 * Create a signed sendBeacon call (for page unload).
 * sendBeacon doesn't support custom headers, so we embed sig in the payload.
 * The server will need to handle this case — but since sendBeacon uses Blob,
 * we'll fall back to keepalive fetch which DOES support headers.
 */
export async function signedBeacon(
  url: string,
  payload: unknown
): Promise<boolean> {
  // sendBeacon can't set custom headers, so use keepalive fetch instead
  try {
    const body = JSON.stringify(payload);
    const { signature, timestamp } = await signPayload(body);

    // Use keepalive fetch — works on page unload like sendBeacon
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      body,
      keepalive: true,
    }).catch(() => {});

    return true;
  } catch {
    return false;
  }
}
