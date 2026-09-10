import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, Trash2, Upload, X } from "lucide-react";

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

type PendingGalleryImage = {
  id: string;
  file: File;
  preview: string;
  caption: string;
  status: "ready" | "uploading" | "complete" | "error";
};

type PendingDirectorImage = {
  file: File;
  preview: string;
  status: "ready" | "uploading" | "complete" | "error";
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [pendingGallery, setPendingGallery] = useState<PendingGalleryImage[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([]);
  const [pendingDirector, setPendingDirector] = useState<PendingDirectorImage | null>(null);
  const [saveComplete, setSaveComplete] = useState(false);

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
    setError("");
    setPendingGallery((current) => [
      ...current,
      ...files.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        caption,
        status: "ready" as const,
      })),
    ]);
    setCaption("");
    e.target.value = "";
  }

  async function onPickDirector(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setPendingDirector({
      file,
      preview: URL.createObjectURL(file),
      status: "ready",
    });
    e.target.value = "";
  }

  async function onSaveSettings() {
    setBusy(true);
    setError("");
    try {
      for (const item of pendingGallery) {
        if (item.status === "complete") continue;
        setPendingGallery((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, status: "uploading" } : entry)),
        );
        try {
          await upload({
            data: {
              password,
              filename: item.file.name,
              contentType: item.file.type,
              dataBase64: await fileToBase64(item.file),
              caption: item.caption,
            },
          });
          setPendingGallery((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, status: "complete" } : entry)),
          );
        } catch (err) {
          setPendingGallery((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, status: "error" } : entry)),
          );
          throw err;
        }
      }

      for (const id of deletedGalleryIds) {
        await remove({ data: { password, id } });
      }

      if (pendingDirector && pendingDirector.status !== "complete") {
        setPendingDirector((current) => (current ? { ...current, status: "uploading" } : current));
        try {
          await uploadDirector({
            data: {
              password,
              filename: pendingDirector.file.name,
              contentType: pendingDirector.file.type,
              dataBase64: await fileToBase64(pendingDirector.file),
            },
          });
          setPendingDirector((current) => (current ? { ...current, status: "complete" } : current));
        } catch (err) {
          setPendingDirector((current) => (current ? { ...current, status: "error" } : current));
          throw err;
        }
      }

      if (Object.keys(form).length > 0) {
        await save({ data: { password, settings: form } });
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: galleryQuery.queryKey }),
        qc.invalidateQueries({ queryKey: settingsQuery.queryKey }),
      ]);
      pendingGallery.forEach((item) => URL.revokeObjectURL(item.preview));
      if (pendingDirector) URL.revokeObjectURL(pendingDirector.preview);
      setPendingGallery([]);
      setDeletedGalleryIds([]);
      setPendingDirector(null);
      setForm({});
      setSaveComplete(true);
      window.setTimeout(() => setSaveComplete(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
            {saveComplete && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4 animate-pulse" />
                Changes saved successfully.
              </p>
            )}

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
                Choose photos
                <input type="file" accept="image/*" multiple hidden onChange={onPickGallery} />
              </label>

              {(pendingGallery.length > 0 || (images ?? []).length > 0) && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                {pendingGallery.map((item) => (
                  <div key={item.id} className="relative overflow-hidden rounded-xl border border-primary/60">
                    <img src={item.preview} alt={`Pending upload: ${item.file.name}`} className="h-24 w-full object-cover" />
                    <div className="absolute inset-0 grid place-items-center bg-background/65">
                      {item.status === "uploading" ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : item.status === "complete" ? (
                        <CheckCircle2 className="h-7 w-7 animate-pulse text-emerald-400" />
                      ) : item.status === "error" ? (
                        <span className="rounded bg-destructive/90 px-1.5 py-0.5 text-[10px] text-destructive-foreground">Failed</span>
                      ) : (
                        <span className="rounded bg-background/85 px-1.5 py-0.5 text-[10px] text-foreground">Ready to save</span>
                      )}
                    </div>
                    {item.status !== "uploading" && (
                      <button
                        type="button"
                        aria-label="Remove pending photo"
                        onClick={() => {
                          URL.revokeObjectURL(item.preview);
                          setPendingGallery((current) => current.filter((entry) => entry.id !== item.id));
                        }}
                        className="absolute right-1 top-1 rounded-md bg-background/80 p-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {(images ?? []).filter((img) => !deletedGalleryIds.includes(img.id)).map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-xl border border-border">
                    <img src={img.url} alt="" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Delete photo"
                      onClick={() => setDeletedGalleryIds((current) => [...current, img.id])}
                      className="absolute right-1 top-1 rounded-md bg-background/80 p-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
                </div>
              )}
              {(pendingGallery.length > 0 || deletedGalleryIds.length > 0) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Gallery changes are private until you click Save changes.
                </p>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold">Director photo</h3>
              {(pendingDirector || settings?.["director_image_url"]) && (
                <div className="mt-3 flex items-center gap-4 rounded-xl border border-border p-3">
                  <img
                    src={pendingDirector?.preview || settings?.["director_image_url"]}
                    alt="Director photo preview"
                    className="h-20 w-20 rounded-lg object-cover object-top"
                  />
                  <div className="text-xs text-muted-foreground">
                    {pendingDirector ? (
                      <>
                        <p className="font-medium text-foreground">New photo preview</p>
                        <p className="mt-1">
                          {pendingDirector.status === "complete" ? "Saved" : "Ready to save"}
                        </p>
                      </>
                    ) : (
                      <p>Current director photo</p>
                    )}
                  </div>
                </div>
              )}
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground hover:bg-secondary/40">
                <Upload className="h-4 w-4" /> Replace director photo
                <input type="file" accept="image/*" hidden onChange={onPickDirector} />
              </label>
              {pendingDirector?.status === "uploading" && (
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading director photo…
                </p>
              )}
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
            </section>
            <button
              type="button"
              disabled={busy}
              onClick={onSaveSettings}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {busy ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
