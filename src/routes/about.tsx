import { createFileRoute } from "@tanstack/react-router";

import grindingImg from "@/assets/grinding.jpg";
import { MagicCard } from "@/components/fx/MagicCard";
import { NumberTicker } from "@/components/fx/NumberTicker";
import { Reveal } from "@/components/fx/Reveal";
import { Spotlight } from "@/components/fx/Spotlight";
import { COMPANY, STATS } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title:
          "About Precise Industries — Engineering Solutions Company in Pune",
      },
      {
        name: "description",
        content:
          "Precise Industries is a Pune-based engineering solutions company founded in 2025, with 10+ skilled manpower and a 5000+ sq. ft. precision manufacturing facility.",
      },
      { property: "og:title", content: "About Precise Industries" },
      {
        property: "og:description",
        content:
          "Founded 2025 in Talawade, Pune. Precision machining, grinding and hard chrome plating for industrial customers.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
        <Spotlight />
        <div className="relative mx-auto max-w-6xl px-5 py-20">
          <h1 className="max-w-3xl text-4xl font-semibold md:text-5xl">
            A young shop floor with{" "}
            <span className="text-gradient">old-school discipline</span>
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Precise Industries was established in {COMPANY.founded} in{" "}
            {COMPANY.city}, specialising in precision machining, grinding, die
            and mould components, and hard chrome plating. We work with
            industrial customers who need components right the first time and
            delivered when promised.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.05 * i}>
              <MagicCard className="p-6">
                <div className="font-display text-2xl font-semibold text-primary-glow">
                  <NumberTicker
                    value={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix}
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {s.label}
                </div>
              </MagicCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border">
              <img
                src={grindingImg}
                alt="Precision grinding work at Precise Industries"
                loading="lazy"
                width={1200}
                height={912}
                className="w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-semibold">What we stand for</h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                Our focus is quality-oriented, cost-effective engineering
                solutions with committed delivery timelines. That means the
                process is chosen for the part, tolerances are verified stage by
                stage, and a promised date is treated as a contract.
              </p>
              <p>
                Because machining, grinding and plating all sit under one roof,
                components do not travel between vendors — which is where
                accuracy and schedules usually get lost.
              </p>
              <p>
                We are keen to become an approved vendor partner for
                organisations looking for reliable quality, competitive pricing
                and timely delivery.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-surface-2/60 p-5">
              <div className="font-semibold">{COMPANY.contactPerson.name}</div>
              <div className="text-sm text-muted-foreground">
                {COMPANY.contactPerson.role}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
