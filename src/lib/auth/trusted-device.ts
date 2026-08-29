import { cookies } from "next/headers";
import crypto from "crypto";

const TRUSTED_DEVICE_COOKIE = "nexus_trusted_device";
const TRUSTED_DEVICE_DAYS   = 30;

export async function setTrustedDevice(userId: string): Promise<void> {
  const token     = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  const payload   = Buffer.from(JSON.stringify({
    userId,
    token,
    createdAt: Date.now(),
  })).toString("base64");

  cookieStore.set(TRUSTED_DEVICE_COOKIE, payload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   60 * 60 * 24 * TRUSTED_DEVICE_DAYS,
    path:     "/",
    sameSite: "lax",
  });
}

export async function getTrustedDevice(userId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw         = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
    if (!raw) return false;

    const payload   = JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as {
      userId: string;
      token: string;
      createdAt: number;
    };

    if (payload.userId !== userId) return false;

    const age = Date.now() - payload.createdAt;
    if (age > TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function clearTrustedDevice(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TRUSTED_DEVICE_COOKIE);
}
