import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/data/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Pune-based engineering solutions company delivering precision machining, grinding and hard
            chrome plating with committed timelines.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/services" className="hover:text-foreground">Services</Link>
            <Link to="/about" className="hover:text-foreground">About us</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Reach us</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            {COMPANY.phones.map((p) => (
              <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4 text-primary" /> {p}
              </a>
            ))}
            <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 hover:text-foreground">
              <Mail className="h-4 w-4 text-primary" /> {COMPANY.email}
            </a>
            <span className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {COMPANY.address}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  );
}
