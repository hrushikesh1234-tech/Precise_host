import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, Mail, Phone } from "lucide-react";

import directorImg from "@/assets/director.jpg.asset.json";
import { Reveal } from "@/components/fx/Reveal";
import { Spotlight } from "@/components/fx/Spotlight";
import { COMPANY } from "@/data/site";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/director")({
  head: () => ({
    meta: [
      { title: "Director — Prathamesh Sudam Bhase | Precise Industries" },
      {
        name: "description",
        content:
          "Meet Prathamesh Sudam Bhase, Director of Operations at Precise Industries, Pune. Contact him directly by phone, WhatsApp or email.",
      },
      { property: "og:title", content: "Director — Prathamesh Sudam Bhase" },
      {
        property: "og:description",
        content: "Director of Operations at Precise Industries, Pune. Get in touch directly.",
      },
    ],
  }),
  component: Director,
});

function Director() {
  const { data: settings } = useSiteSettings();
  const photo = settings?.["director_image_url"] || directorImg.url;
  const phone = COMPANY.phones[0]!;

  const socials = [
    { label: "Instagram", icon: Instagram, href: settings?.["instagram_url"] || "https://instagram.com/" },
    { label: "Facebook", icon: Facebook, href: settings?.["facebook_url"] || "https://facebook.com/" },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: settings?.["whatsapp_url"] || `https://wa.me/${phone.replace(/\D/g, "")}`,
    },
    { label: "Gmail", icon: Mail, href: settings?.["email_url"] || `mailto:${COMPANY.email}` },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
      <Spotlight />
      <section className="relative mx-auto max-w-3xl px-5 py-16 md:py-24">
        <Reveal>
          <div className="rounded-3xl border border-border bg-surface/60 p-8 text-center backdrop-blur-xl md:p-12">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border border-border md:h-48 md:w-48">
              <img
                src={photo}
                alt="Prathamesh Sudam Bhase, Director of Operations"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <h1 className="mt-7 text-3xl font-semibold md:text-4xl">Prathamesh Sudam Bhase</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Director – Operations
            </p>

            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-5 py-3 text-sm font-medium hover:bg-secondary"
            >
              <Phone className="h-4 w-4 text-primary" /> {phone}
            </a>

            <div className="mt-9 flex justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-2/60 text-primary transition-colors hover:bg-secondary"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <p className="mt-9 text-sm leading-relaxed text-muted-foreground">
              Leading day-to-day operations at {COMPANY.name}, {COMPANY.city} — precision machining,
              tool room job work, grinding and hard chrome plating.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
