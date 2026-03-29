import type { ImageKitAuthParams } from "@/types/imagekit";

const EXPIRY_BUFFER_SEC = 60;

export function isImageKitAuthExpired(params: ImageKitAuthParams | null): boolean {
  if (!params?.expire) return true;
  const expireSec = Number(params.expire);
  if (!Number.isFinite(expireSec)) return true;
  const nowSec = Date.now() / 1000;
  return nowSec >= expireSec - EXPIRY_BUFFER_SEC;
}

export function isImageKitAuthPayload(data: unknown): data is ImageKitAuthParams {
  if (typeof data !== "object" || data === null) return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.signature === "string" &&
    (typeof o.expire === "string" || typeof o.expire === "number") &&
    typeof o.token === "string" &&
    typeof o.publicKey === "string"
  );
}
