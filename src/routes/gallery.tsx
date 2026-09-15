import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Reveal } from "@/components/fx/Reveal";
import {
  DEFAULT_SITE_SETTINGS,
  galleryQuery,
  settingsQuery,
  useSiteSettings,
} from "@/hooks/useSiteSettings";
import {
  deleteGalleryImage,
  saveSettings,
  uploadDirectorImage,
  uploadGalleryImage,
  verifyAdmin,
} from "@/lib/admin.functions";
import { hasPublicSupabaseConfig } from "@/integrations/supabase/client";

const MAX_GALLERY_IMAGES = 30;
const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.84;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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
        content:
          "Machined components, grinding work and plated parts from our Pune facility.",
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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not compress the image")),
      "image/webp",
      IMAGE_QUALITY,
    );
  });
}

async function optimizeImage(file: File): Promise<File> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      `${file.name}: only JPG, PNG and WebP images are supported.`,
    );
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Image compression is not supported here");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const compressed = await canvasToBlob(canvas);
    if (scale === 1 && compressed.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "gallery-image";
    return new File([compressed], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
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
            Components, shop-floor work and finished jobs from our Pune
            facility.
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
                  decoding="async"
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    {img.caption}
                  </div>
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
          <img
            src={lightbox}
            alt=""
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
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
  const [compressing, setCompressing] = useState(false);
  const [caption, setCaption] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [pendingGallery, setPendingGallery] = useState<PendingGalleryImage[]>(
    [],
  );
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<string[]>([]);
  const [pendingDirector, setPendingDirector] =
    useState<PendingDirectorImage | null>(null);
  const [saveComplete, setSaveComplete] = useState(false);

  const value = (k: string) =>
    form[k] ?? settings?.[k] ?? DEFAULT_SITE_SETTINGS[k] ?? "";
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!hasPublicSupabaseConfig()) {
      setError(
        "Admin is not configured for browser data access. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then rebuild the deployment.",
      );
      return;
    }
    setBusy(true);
    try {
      const res = await verify({ data: { password } });
      if (res?.ok) setUnlocked(true);
      else if (res?.reason === "not_configured") {
        setError(
          `Admin is not configured on the server. Add: ${res.missing.join(", ")}.`,
        );
      } else setError("Incorrect password");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not check the password. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onPickGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setError("");
    const availableSlots = Math.max(
      0,
      MAX_GALLERY_IMAGES - (images?.length ?? 0) - pendingGallery.length,
    );
    if (availableSlots === 0) {
      setError(
        `Gallery मध्ये maximum ${MAX_GALLERY_IMAGES} photos ठेवता येतात.`,
      );
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots);
    setCompressing(true);
    try {
      const optimized: PendingGalleryImage[] = [];
      for (const [index, file] of acceptedFiles.entries()) {
        const compressedFile = await optimizeImage(file);
        optimized.push({
          id: `${compressedFile.name}-${compressedFile.lastModified}-${index}`,
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          caption,
          status: "ready",
        });
      }
      setPendingGallery((current) => [...current, ...optimized]);
      setCaption("");
      if (files.length > acceptedFiles.length) {
        setError(
          `${acceptedFiles.length} photos तयार केले. Gallery limit ${MAX_GALLERY_IMAGES} असल्यामुळे ${files.length - acceptedFiles.length} photos वगळले.`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not compress images",
      );
    } finally {
      setCompressing(false);
    }
  }

  async function onPickDirector(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setCompressing(true);
    try {
      const compressedFile = await optimizeImage(file);
      if (pendingDirector) URL.revokeObjectURL(pendingDirector.preview);
      setPendingDirector({
        file: compressedFile,
        preview: URL.createObjectURL(compressedFile),
        status: "ready",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compress image");
    } finally {
      setCompressing(false);
    }
  }

  async function onSaveSettings() {
    setBusy(true);
    setError("");
    try {
      for (const item of pendingGallery) {
        if (item.status === "complete") continue;
        setPendingGallery((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "uploading" } : entry,
          ),
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
            current.map((entry) =>
              entry.id === item.id ? { ...entry, status: "complete" } : entry,
            ),
          );
        } catch (err) {
          setPendingGallery((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, status: "error" } : entry,
            ),
          );
          throw err;
        }
      }

      for (const id of deletedGalleryIds) {
        await remove({ data: { password, id } });
      }

      if (pendingDirector && pendingDirector.status !== "complete") {
        setPendingDirector((current) =>
          current ? { ...current, status: "uploading" } : current,
        );
        try {
          await uploadDirector({
            data: {
              password,
              filename: pendingDirector.file.name,
              contentType: pendingDirector.file.type,
              dataBase64: await fileToBase64(pendingDirector.file),
            },
          });
          setPendingDirector((current) =>
            current ? { ...current, status: "complete" } : current,
          );
        } catch (err) {
          setPendingDirector((current) =>
            current ? { ...current, status: "error" } : current,
          );
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
    ["company_name", "Company name"],
    ["company_tagline", "Company tagline"],
    ["company_address", "Company address"],
    ["mobile_number", "Mobile number"],
    ["email_address", "Email address"],
    ["director_name", "Director name"],
    ["director_role", "Director role"],
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
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg border border-border p-2"
          >
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
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
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold">Add gallery photos</h3>
                <span className="text-xs text-muted-foreground">
                  {(images?.length ?? 0) + pendingGallery.length}/
                  {MAX_GALLERY_IMAGES} photos
                </span>
              </div>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:bg-secondary/40">
                {compressing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {compressing ? "Optimizing photos…" : "Choose photos"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  disabled={
                    compressing ||
                    (images?.length ?? 0) + pendingGallery.length >=
                      MAX_GALLERY_IMAGES
                  }
                  onChange={onPickGallery}
                />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG किंवा WebP. Upload करण्यापूर्वी photos आपोआप compress
                होतात.
              </p>

              {(pendingGallery.length > 0 || (images ?? []).length > 0) && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {pendingGallery.map((item) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-xl border border-primary/60"
                    >
                      <img
                        src={item.preview}
                        alt={`Pending upload: ${item.file.name}`}
                        className="h-24 w-full object-cover"
                      />
                      <div className="absolute inset-0 grid place-items-center bg-background/65">
                        {item.status === "uploading" ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : item.status === "complete" ? (
                          <CheckCircle2 className="h-7 w-7 animate-pulse text-emerald-400" />
                        ) : item.status === "error" ? (
                          <span className="rounded bg-destructive/90 px-1.5 py-0.5 text-[10px] text-destructive-foreground">
                            Failed
                          </span>
                        ) : (
                          <span className="rounded bg-background/85 px-1.5 py-0.5 text-[10px] text-foreground">
                            Ready to save
                          </span>
                        )}
                      </div>
                      {item.status !== "uploading" && (
                        <button
                          type="button"
                          aria-label="Remove pending photo"
                          onClick={() => {
                            URL.revokeObjectURL(item.preview);
                            setPendingGallery((current) =>
                              current.filter((entry) => entry.id !== item.id),
                            );
                          }}
                          className="absolute right-1 top-1 rounded-md bg-background/80 p-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(images ?? [])
                    .filter((img) => !deletedGalleryIds.includes(img.id))
                    .map((img) => (
                      <div
                        key={img.id}
                        className="relative overflow-hidden rounded-xl border border-border"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-24 w-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Delete photo"
                          onClick={() =>
                            setDeletedGalleryIds((current) => [
                              ...current,
                              img.id,
                            ])
                          }
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
                    src={
                      pendingDirector?.preview ||
                      settings?.["director_image_url"]
                    }
                    alt="Director photo preview"
                    className="h-20 w-20 rounded-lg object-cover object-top"
                  />
                  <div className="text-xs text-muted-foreground">
                    {pendingDirector ? (
                      <>
                        <p className="font-medium text-foreground">
                          New photo preview
                        </p>
                        <p className="mt-1">
                          {pendingDirector.status === "complete"
                            ? "Saved"
                            : "Ready to save"}
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
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={compressing}
                  onChange={onPickDirector}
                />
              </label>
              {pendingDirector?.status === "uploading" && (
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
                  director photo…
                </p>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold">Links</h3>
              <div className="mt-3 space-y-3">
                {fields.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
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
              disabled={busy || compressing}
              onClick={onSaveSettings}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {busy ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
