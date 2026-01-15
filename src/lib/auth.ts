// Simple in-memory rate limiting
// Note: This resets when serverless function cold starts
// For persistent rate limiting, use Upstash Redis

const RATE_LIMIT = 20; // max requests
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIP(req: Request): string {
  // Vercel forwards the real IP in these headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export function checkRateLimit(req: Request): { allowed: boolean; remaining: number } {
  const ip = getClientIP(req);
  const now = Date.now();

  let entry = rateLimitStore.get(ip);

  // Clean up expired entry or create new one
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimitStore.set(ip, entry);
  }

  entry.count++;

  const allowed = entry.count <= RATE_LIMIT;
  const remaining = Math.max(0, RATE_LIMIT - entry.count);

  return { allowed, remaining };
}

export function validateRequest(req: Request): boolean {
  const { allowed } = checkRateLimit(req);
  return allowed;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "Rate limit exceeded. Try again later." },
    { status: 429 }
  );
}
