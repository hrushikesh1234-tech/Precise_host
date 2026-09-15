import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

import { MagicCard } from "@/components/fx/MagicCard";
import { Reveal } from "@/components/fx/Reveal";
import { Spotlight } from "@/components/fx/Spotlight";
import { COMPANY, SERVICES } from "@/data/site";
import { useResolvedSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Precise Industries — Get a Machining Quotation, Pune" },
      {
        name: "description",
        content:
          "Send your component drawing to Precise Industries, Talawade, Pune. Call +91 7666400893 or email preciseindustries9@gmail.com for a quotation.",
      },
      { property: "og:title", content: "Contact Precise Industries" },
      {
        property: "og:description",
        content:
          "Request a quotation for precision machining, grinding or hard chrome plating in Pune.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useResolvedSiteSettings();
  const email = settings["email_address"] || COMPANY.email;
  const phone = settings["mobile_number"] || COMPANY.phones[0]!;
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    service: SERVICES[0]?.title ?? "",
    message: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${form.name}`,
      `Company: ${form.company}`,
      `Phone: ${form.phone}`,
      `Requirement: ${form.service}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Enquiry from ${form.company || form.name}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "w-full rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
        <Spotlight />
        <div className="relative mx-auto max-w-6xl px-5 py-20">
          <h1 className="max-w-3xl text-4xl font-semibold md:text-5xl">
            Send a drawing, get a{" "}
            <span className="text-gradient">method and a date</span>
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Tell us the material, tolerance and quantity. We usually respond
            with a quotation within 24–48 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <MagicCard className="p-7 md:p-9">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  className={field}
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Company"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  className={field}
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <select
                  className={field}
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                >
                  {SERVICES.map((s) => (
                    <option
                      key={s.slug}
                      value={s.title}
                      className="bg-background"
                    >
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                required
                rows={5}
                className={field}
                placeholder="Component details — material, tolerance, quantity, delivery expectation"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Send enquiry <Send className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground">
                This opens your email app with the details filled in, addressed
                to our inbox.
              </p>
            </form>
          </MagicCard>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            <MagicCard className="p-6">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-semibold">Call us</h2>
              <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground"
                >
                  {phone}
                </a>
              </div>
            </MagicCard>
            <MagicCard className="p-6">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-semibold">Email</h2>
              <a
                href={`mailto:${email}`}
                className="mt-2 block break-all text-sm text-muted-foreground hover:text-foreground"
              >
                {email}
              </a>
            </MagicCard>
            <MagicCard className="p-6">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-semibold">Works address</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {settings["company_address"]}
              </p>
              <div className="mt-4 text-sm">
                <div className="font-medium">{settings["director_name"]}</div>
                <div className="text-muted-foreground">
                  {settings["director_role"]}
                </div>
              </div>
            </MagicCard>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
