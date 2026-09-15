import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

const MAX_GALLERY_IMAGES = 30;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const REQUIRED_ADMIN_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
] as const;

function missingAdminConfig() {
  return REQUIRED_ADMIN_ENV.filter((name) => !process.env[name]);
}

function matches(password: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;
  const a = createHash("sha256")
    .update(password ?? "", "utf8")
    .digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function check(password: string) {
  const missing = missingAdminConfig();
  if (missing.length > 0) {
    throw new Error(
      `Admin is not configured. Missing server environment variables: ${missing.join(", ")}`,
    );
  }
  if (!matches(password)) throw new Error("Incorrect password");
}

async function admin() {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const verifyAdmin = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const missing = missingAdminConfig();
    if (missing.length > 0) {
      return {
        ok: false as const,
        reason: "not_configured" as const,
        missing: [...missing],
      };
    }
    return matches(data.password)
      ? { ok: true as const }
      : { ok: false as const, reason: "incorrect_password" as const };
  });

export const uploadGalleryImage = createServerFn({ method: "POST" })
  .validator(
    (d: {
      password: string;
      filename: string;
      contentType: string;
      dataBase64: string;
      caption?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    check(data.password);
    if (!SUPPORTED_IMAGE_TYPES.has(data.contentType))
      throw new Error("Only JPG, PNG and WebP images can be uploaded");
    const db = await admin();
    const { count, error: countError } = await db
      .from("gallery_images")
      .select("id", { count: "exact", head: true });
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= MAX_GALLERY_IMAGES) {
      throw new Error(
        `Gallery can contain a maximum of ${MAX_GALLERY_IMAGES} photos`,
      );
    }
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength > MAX_UPLOAD_BYTES)
      throw new Error("Images must be 10 MB or smaller");
    const { error } = await db.storage
      .from("gallery")
      .upload(path, bytes, { contentType: data.contentType || "image/jpeg" });
    if (error) throw new Error(error.message);

    const { error: insErr } = await db
      .from("gallery_images")
      .insert({ url: `/api/public/img/${path}`, caption: data.caption ?? "" });
    if (insErr) {
      await db.storage.from("gallery").remove([path]);
      throw new Error(insErr.message);
    }
    return { ok: true as const };
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .validator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    check(data.password);
    const db = await admin();
    const { data: row } = await db
      .from("gallery_images")
      .select("url")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.url?.startsWith("/api/public/img/")) {
      await db.storage
        .from("gallery")
        .remove([row.url.replace("/api/public/img/", "")]);
    }
    const { error } = await db
      .from("gallery_images")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .validator((d: { password: string; settings: Record<string, string> }) => d)
  .handler(async ({ data }) => {
    check(data.password);
    const db = await admin();
    const rows = Object.entries(data.settings).map(([key, value]) => ({
      key,
      value: value ?? "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await db
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const uploadDirectorImage = createServerFn({ method: "POST" })
  .validator(
    (d: {
      password: string;
      filename: string;
      contentType: string;
      dataBase64: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    check(data.password);
    if (!SUPPORTED_IMAGE_TYPES.has(data.contentType))
      throw new Error("Only JPG, PNG and WebP images can be uploaded");
    const db = await admin();
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase();
    const path = `director/${Date.now()}.${ext}`;
    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength > MAX_UPLOAD_BYTES)
      throw new Error("Images must be 10 MB or smaller");
    const { error } = await db.storage
      .from("gallery")
      .upload(path, bytes, { contentType: data.contentType || "image/jpeg" });
    if (error) throw new Error(error.message);
    const url = `/api/public/img/${path}`;
    await db.from("site_settings").upsert(
      [
        {
          key: "director_image_url",
          value: url,
          updated_at: new Date().toISOString(),
        },
      ],
      {
        onConflict: "key",
      },
    );
    return { ok: true as const, url };
  });
