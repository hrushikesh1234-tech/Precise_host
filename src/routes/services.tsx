import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import chromeImg from "@/assets/chrome.jpg";
import { MagicCard } from "@/components/fx/MagicCard";
import { Reveal } from "@/components/fx/Reveal";
import { Spotlight } from "@/components/fx/Spotlight";
import { CAPABILITIES, SERVICES } from "@/data/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      {
        title:
          "Services — VMC, Grinding & Hard Chrome Plating | Precise Industries",
      },
      {
        name: "description",
        content:
          "Precision machining services in Pune: VMC machining, grinding to 0.002 mm, hard chrome plating 50–1000 microns, and die and mould components.",
      },
      { property: "og:title", content: "Services | Precise Industries" },
      {
        property: "og:description",
        content:
          "VMC machining, precision grinding, die and mould components, and in-house hard chrome plating from a Pune facility.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
        <Spotlight />
        <div className="relative mx-auto max-w-6xl px-5 py-20">
          <h1 className="max-w-3xl text-4xl font-semibold md:text-5xl">
            Services built around{" "}
            <span className="text-gradient">tolerance, finish and dates</span>
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Every process below runs inside our 5000+ sq. ft. facility in
            Talawade, Pune, with a team of 10+ skilled machinists and operators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={0.04 * i}>
              <MagicCard className="h-full p-7">
                <span className="font-mono text-xs text-primary-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-3 text-xl font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.summary}
                </p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </MagicCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="text-3xl font-semibold md:text-4xl">
              In-house capabilities
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-border">
              <img
                src={chromeImg}
                alt="Hard chrome plated shafts ready for dispatch"
                loading="lazy"
                width={1200}
                height={912}
                className="w-full object-cover"
              />
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Discuss your requirement
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
