import { createFileRoute } from "@tanstack/react-router";
import { Share, PlusSquare, MoreVertical, Smartphone } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "Install App — Precise Industries" },
      {
        name: "description",
        content:
          "Install the Precise Industries app on Android or iPhone for quick access to our services, gallery and contact details.",
      },
      { property: "og:title", content: "Install App — Precise Industries" },
      {
        property: "og:description",
        content: "Add Precise Industries to your home screen on Android or iPhone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstallPage,
});

function InstallPage() {
  const { canInstall, install, installed, isIOS } = usePwaInstall();
  const { data } = useSiteSettings();
  const url = data?.["pwa_url"]?.trim() || "https://preciseindustries.shop";

  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="text-3xl font-semibold md:text-4xl">Install our app</h1>
      <p className="mt-4 text-muted-foreground">
        Add Precise Industries to your home screen and open it like any other app — it works on Android
        and iPhone.
      </p>

      {installed ? (
        <p className="mt-8 rounded-2xl border border-border bg-surface p-5 text-sm">
          The app is already installed on this device.
        </p>
      ) : canInstall ? (
        <button
          type="button"
          onClick={() => void install()}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          <Smartphone className="h-4 w-4" />
          Install now
        </button>
      ) : null}

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-7">
          <h2 className="text-lg font-semibold">On Android (Chrome)</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <MoreVertical className="h-4 w-4 shrink-0 text-primary" />
              Tap the three-dot menu in the browser.
            </li>
            <li className="flex gap-3">
              <PlusSquare className="h-4 w-4 shrink-0 text-primary" />
              Choose “Install app” or “Add to Home screen”.
            </li>
            <li className="flex gap-3">
              <Smartphone className="h-4 w-4 shrink-0 text-primary" />
              Confirm — the icon appears on your home screen.
            </li>
          </ol>
        </div>

        <div className={`rounded-3xl border p-7 ${isIOS ? "border-primary/50" : "border-border"} bg-surface`}>
          <h2 className="text-lg font-semibold">On iPhone / iPad (Safari)</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Share className="h-4 w-4 shrink-0 text-primary" />
              Tap the Share button at the bottom of Safari.
            </li>
            <li className="flex gap-3">
              <PlusSquare className="h-4 w-4 shrink-0 text-primary" />
              Scroll and tap “Add to Home Screen”.
            </li>
            <li className="flex gap-3">
              <Smartphone className="h-4 w-4 shrink-0 text-primary" />
              Tap “Add” to finish.
            </li>
          </ol>
        </div>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Website address: <span className="font-mono">{url.replace(/^https?:\/\//, "")}</span>
      </p>
    </section>
  );
}
