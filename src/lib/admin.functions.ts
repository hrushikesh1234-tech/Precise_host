import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

function matches(password: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;
  const a = createHash("sha256").update(password ?? "", "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

function check(password: string) {
  if (!matches(password)) throw new Error("Incorrect password");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    return { ok: matches(data.password) };
  });

export const uploadGalleryImage = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; filename: string; contentType: string; dataBase64: string; caption?: string }) => d)
  .handler(async ({ data }) => {
    check(data.password);
    const db = await admin();
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Buffer.from(data.dataBase64, "base64");
    const { error } = await db.storage
      .from("gallery")
      .upload(path, bytes, { contentType: data.contentType || "image/jpeg" });
    if (error) throw new Error(error.message);

    const { error: insErr } = await db
      .from("gallery_images")
      .insert({ url: `/api/public/img/${path}`, caption: data.caption ?? "" });
    if (insErr) throw new Error(insErr.message);
    return { ok: true as const };
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    check(data.password);
    const db = await admin();
    const { data: row } = await db.from("gallery_images").select("url").eq("id", data.id).maybeSingle();
    if (row?.url?.startsWith("/api/public/img/")) {
      await db.storage.from("gallery").remove([row.url.replace("/api/public/img/", "")]);
    }
    const { error } = await db.from("gallery_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; settings: Record<string, string> }) => d)
  .handler(async ({ data }) => {
    check(data.password);
    const db = await admin();
    const rows = Object.entries(data.settings).map(([key, value]) => ({
      key,
      value: value ?? "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await db.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const uploadDirectorImage = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; filename: string; contentType: string; dataBase64: string }) => d)
  .handler(async ({ data }) => {
    check(data.password);
    const db = await admin();
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase();
    const path = `director/${Date.now()}.${ext}`;
    const bytes = Buffer.from(data.dataBase64, "base64");
    const { error } = await db.storage
      .from("gallery")
      .upload(path, bytes, { contentType: data.contentType || "image/jpeg" });
    if (error) throw new Error(error.message);
    const url = `/api/public/img/${path}`;
    await db
      .from("site_settings")
      .upsert([{ key: "director_image_url", value: url, updated_at: new Date().toISOString() }], {
        onConflict: "key",
      });
    return { ok: true as const, url };
  });
