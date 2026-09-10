import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Gauge, Sparkles } from "lucide-react";

import heroImg from "@/assets/vmc-hero.jpg";
import grindingImg from "@/assets/grinding.jpg";
import chromeImg from "@/assets/chrome.jpg";
import toolroomImg from "@/assets/toolroom.jpg";
import { Spotlight } from "@/components/fx/Spotlight";
import { MagicCard } from "@/components/fx/MagicCard";
import { Marquee } from "@/components/fx/Marquee";
import { NumberTicker } from "@/components/fx/NumberTicker";
import { Reveal } from "@/components/fx/Reveal";
import { CAPABILITIES, COMPANY, PROCESS, SERVICES, STATS } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Precise Industries — VMC Machining & Tool Room Job Work, Pune" },
      {
        name: "description",
        content:
          "Pune-based precision machining: FANUC VMC, tool room job work, die and mould components, aluminium and MS machining with committed delivery.",
      },
      { property: "og:title", content: "Precise Industries — Precision Machining, Pune" },
      {
        property: "og:description",
        content:
          "VMC machining, tool room job work, die and mould components and precision aluminium/MS machining from Pune.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 glow-blob opacity-30"
          aria-hidden
        />
        <Spotlight />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/70 px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Established {COMPANY.founded} · {COMPANY.city}
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] md:text-6xl">
              <span className="text-gradient">Precision engineered</span> to two microns,
              delivered on the date we promise.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              VMC machining, tool room job work, die and mould components and aluminium/MS machining —
              one vendor for the whole component, from raw stock to finished, inspected part.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-opacity hover:opacity-90"
              >
                Send your drawing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Explore capabilities
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-14 overflow-hidden rounded-3xl border border-border"
          >
            <img
              src={heroImg}
              alt="FANUC-controlled VMC machining a steel component with coolant spray"
              width={1600}
              height={1008}
              className="h-[280px] w-full object-cover md:h-[520px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-px bg-border/60 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-background/85 px-4 py-5 backdrop-blur-md">
                  <div className="font-display text-xl font-semibold text-primary-glow md:text-2xl">
                    <NumberTicker value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground md:text-xs">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capability marquee */}
      <section className="py-8">
        <Marquee items={CAPABILITIES} />
      </section>

      {/* Services bento */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">
            One shop floor, the full precision chain
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Machining, fitting and inspection are handled in-house, so tolerances hold across processes
            and nothing waits on an outside vendor.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SERVICES.filter((s) => s.slug !== "vmc" && s.slug !== "toolroom").map((s, i) => (
            <Reveal key={s.slug} delay={0.04 * i}>
              <MagicCard className="h-full p-7">
                <Gauge className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              </MagicCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary-glow"
          >
            See all services
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* Facility + process */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border">
              <img
                src={toolroomImg}
                alt="Tool room with conventional milling and lathe machines"
                loading="lazy"
                width={1200}
                height={912}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-semibold md:text-4xl">How a job runs with us</h2>
            <div className="mt-8 space-y-6">
              {PROCESS.map((p) => (
                <div key={p.step} className="flex gap-4">
                  <span className="font-mono text-sm text-primary-glow">{p.step}</span>
                  <div>
                    <h3 className="text-base font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-3xl font-semibold md:text-4xl">Why buyers approve us as a vendor</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Quality-oriented", "Stage-wise dimensional checks against your drawing before dispatch."],
            ["Cost-effective", "Right process for the part, so you are not paying for over-engineering."],
            ["Committed delivery", "Dates are quoted against real capacity, not optimism."],
            ["Single-source", "Machining, fitting and inspection under one roof and one PO."],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={0.05 * i}>
              <MagicCard className="h-full p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </MagicCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center md:p-16">
            <div
              className="pointer-events-none absolute -bottom-24 left-1/2 h-[300px] w-[600px] -translate-x-1/2 glow-blob opacity-30"
              aria-hidden
            />
            <h2 className="relative text-3xl font-semibold md:text-4xl">
              Have a component drawing on your desk?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
              Send it across and we will come back with a method, a price and a delivery date.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                Request a quotation <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${COMPANY.phones[0]?.replace(/\s/g, "")}`}
                className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                Call {COMPANY.phones[0]}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
