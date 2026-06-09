import crypto from "node:crypto";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generates an HMAC-signed session token for the admin.
 * Format: admin:expiryTimestamp:signature
 */
export function generateSessionToken(secret: string): string {
  const expiry = Date.now() + SEVEN_DAYS;
  const data = `admin:${expiry}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
  return `${data}:${signature}`;
}

/**
 * Verifies if a session token is valid and not expired.
 */
export function verifySessionToken(token: string, secret: string): boolean {
  try {
    if (!token || !secret) return false;

    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const [user, expiryStr, signature] = parts;
    if (user !== "admin") return false;

    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      return false; // Expired or invalid format
    }

    const data = `admin:${expiry}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Session verification failed", error);
    return false;
  }
}

/**
 * Checks if the request contains a valid admin session cookie.
 */
export function checkAdminSession(request: Request): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    console.error("ADMIN_SESSION_SECRET is not configured on the server.");
    return false;
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";").reduce((acc, cookieStr) => {
    const [name, ...valueParts] = cookieStr.trim().split("=");
    if (name) {
      acc[name.trim()] = valueParts.join("=");
    }
    return acc;
  }, {} as Record<string, string>);

  const sessionToken = cookies["admin_session"];
  if (!sessionToken) return false;

  return verifySessionToken(sessionToken, secret);
}
