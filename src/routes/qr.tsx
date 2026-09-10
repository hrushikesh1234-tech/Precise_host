import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "Get QR Code — Precise Industries" },
      {
        name: "description",
        content:
          "Scan or download the QR code for the Precise Industries website and share our precision machining services.",
      },
      { property: "og:title", content: "Get QR Code — Precise Industries" },
      {
        property: "og:description",
        content: "Scan or download the QR code linking to preciseindustries.shop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const { data } = useSiteSettings();
  const url = data?.["pwa_url"]?.trim() || "https://preciseindustries.shop";
  const [png, setPng] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 720,
      margin: 2,
      color: { dark: "#0b1220", light: "#ffffff" },
    })
      .then(setPng)
      .catch(() => setPng(""));
  }, [url]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center">
      <h1 className="text-3xl font-semibold md:text-4xl">Scan to visit us</h1>
      <p className="mt-4 text-muted-foreground">
        Point your phone camera at the code to open our website.
      </p>

      <div className="mx-auto mt-10 w-fit rounded-3xl border border-border bg-surface p-6">
        {png ? (
          <img src={png} alt={`QR code for ${url}`} width={288} height={288} className="h-72 w-72 rounded-xl" />
        ) : (
          <div className="h-72 w-72 animate-pulse rounded-xl bg-secondary" />
        )}
        <p className="mt-4 font-mono text-sm text-muted-foreground">{url.replace(/^https?:\/\//, "")}</p>
      </div>

      {png && (
        <a
          href={png}
          download="precise-industries-qr.png"
          className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Download QR code
        </a>
      )}
    </section>
  );
}
