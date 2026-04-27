import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "sewa_admin_session";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getAuthSecret = () => process.env.AUTH_SECRET || "change-this-secret";
const getAdminUsername = () => process.env.ADMIN_USERNAME || "admin";
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "admin123";

const toBase64Url = (value) =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

const getSigningKey = async () =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

const signValue = async (value) => {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const bytes = Array.from(new Uint8Array(signature), (byte) =>
    String.fromCharCode(byte),
  ).join("");
  return toBase64Url(bytes);
};

export async function createSessionToken(payload) {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = await signValue(encodedPayload);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(decoder.decode(encoder.encode(fromBase64Url(encodedPayload))));
    if (!payload?.username || !payload?.expiresAt) {
      return null;
    }
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function buildSessionCookie(username, rememberMe = false) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = await createSessionToken({ username, expiresAt });
  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  if (rememberMe) {
    options.expires = new Date(expiresAt);
  }

  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    options,
  };
}

export function buildLogoutCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    },
  };
}

export function validateAdminCredentials(username, password) {
  const normalizedUsername = String(username || "").trim();
  const normalizedPassword = String(password || "");

  if (!normalizedUsername) {
    return { ok: false, message: "Username is required." };
  }

  if (!normalizedPassword) {
    return { ok: false, message: "Password is required." };
  }

  if (
    normalizedUsername !== getAdminUsername() ||
    normalizedPassword !== getAdminPassword()
  ) {
    return { ok: false, message: "Invalid username or password." };
  }

  return { ok: true, username: normalizedUsername };
}

export async function getSessionFromRequest(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireAdminRequest(request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  return null;
}
