import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Trash2, Upload, X } from "lucide-react";

import { Reveal } from "@/components/fx/Reveal";
import { galleryQuery, settingsQuery, useSiteSettings } from "@/hooks/useSiteSettings";
import {
  deleteGalleryImage,
  saveSettings,
  uploadDirectorImage,
  uploadGalleryImage,
  verifyAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Precise Industries, Pune" },
      {
        name: "description",
        content:
          "Photographs of machined components, grinding work, hard chrome plated parts and the Precise Industries shop floor in Pune.",
      },
      { property: "og:title", content: "Gallery — Precise Industries" },
      {
        property: "og:description",
        content: "Machined components, grinding work and plated parts from our Pune facility.",
      },
    ],
  }),
  component: Gallery,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Gallery() {
  const { data: images } = useQuery(galleryQuery);
  const [adminOpen, setAdminOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h1 className="text-3xl font-semibold md:text-5xl">Gallery</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Components, shop-floor work and finished jobs from our Pune facility.
          </p>
        </Reveal>

        {images && images.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightbox(img.url)}
                className="group overflow-hidden rounded-2xl border border-border bg-surface text-left"
              >
                <img
                  src={img.url}
                  alt={img.caption || "Precise Industries work photograph"}
                  loading="lazy"
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">{img.caption}</div>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Photographs will appear here soon.
          </p>
        )}

        {/* hidden admin entry */}
        <button
          type="button"
          aria-label="."
          onClick={() => setAdminOpen(true)}
          className="mt-16 block h-2 w-2 rounded-full bg-foreground/70"
        />
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-background/90 p-6 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: images } = useQuery(galleryQuery);
  const { data: settings } = useSiteSettings();

  const verify = useServerFn(verifyAdmin);
  const upload = useServerFn(uploadGalleryImage);
  const remove = useServerFn(deleteGalleryImage);
  const save = useServerFn(saveSettings);
  const uploadDirector = useServerFn(uploadDirectorImage);

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});

  const value = (k: string) => form[k] ?? settings?.[k] ?? "";
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await verify({ data: { password } });
      if (res?.ok) setUnlocked(true);
      else setError("Incorrect password");
    } catch {
      setError("Could not check the password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onPickGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of files) {
        await upload({
          data: {
            password,
            filename: file.name,
            contentType: file.type,
            dataBase64: await fileToBase64(file),
            caption,
          },
        });
      }
      setCaption("");
      await qc.invalidateQueries({ queryKey: galleryQuery.queryKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onPickDirector(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await uploadDirector({
        data: {
          password,
          filename: file.name,
          contentType: file.type,
          dataBase64: await fileToBase64(file),
        },
      });
      await qc.invalidateQueries({ queryKey: settingsQuery.queryKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onSaveSettings() {
    setBusy(true);
    try {
      await save({ data: { password, settings: form } });
      await qc.invalidateQueries({ queryKey: settingsQuery.queryKey });
      setForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ["instagram_url", "Instagram link"],
    ["facebook_url", "Facebook link"],
    ["whatsapp_url", "WhatsApp link"],
    ["email_url", "Gmail link (mailto:…)"],
    ["pwa_url", "App / website address"],
  ] as const;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-background/80 p-4 backdrop-blur-md">
      <div className="mx-auto my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg border border-border p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={unlock} className="mt-6 space-y-3">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Checking…" : "Unlock"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-8">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <section>
              <h3 className="text-sm font-semibold">Add gallery photos</h3>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:bg-secondary/40">
                <Upload className="h-4 w-4" />
                {busy ? "Working…" : "Choose photos"}
                <input type="file" accept="image/*" multiple hidden onChange={onPickGallery} />
              </label>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {(images ?? []).map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-xl border border-border">
                    <img src={img.url} alt="" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Delete photo"
                      onClick={async () => {
                        setBusy(true);
                        await remove({ data: { password, id: img.id } });
                        await qc.invalidateQueries({ queryKey: galleryQuery.queryKey });
                        setBusy(false);
                      }}
                      className="absolute right-1 top-1 rounded-md bg-background/80 p-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold">Director photo</h3>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground hover:bg-secondary/40">
                <Upload className="h-4 w-4" /> Replace director photo
                <input type="file" accept="image/*" hidden onChange={onPickDirector} />
              </label>
            </section>

            <section>
              <h3 className="text-sm font-semibold">Links</h3>
              <div className="mt-3 space-y-3">
                {fields.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <input
                      value={value(key)}
                      onChange={(e) => set(key, e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={onSaveSettings}
                className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                Save changes
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
