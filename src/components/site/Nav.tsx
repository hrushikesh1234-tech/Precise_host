import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Home, User, Wrench, Images, QrCode, Download } from "lucide-react";
import { Logo } from "./Logo";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/director", label: "Director", icon: User },
  { to: "/services", label: "Services", icon: Wrench },
  { to: "/gallery", label: "Gallery", icon: Images },
  { to: "/qr", label: "Get QR Code", icon: QrCode },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { canInstall, install } = usePwaInstall();

  async function handleInstall() {
    setOpen(false);
    const done = canInstall && (await install());
    if (!done) navigate({ to: "/install" });
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/50 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-foreground bg-secondary/70" }}
                className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Get a quote
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-border/70 bg-surface-2/50 p-2 backdrop-blur-xl"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in sidebar */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col border-l border-border/60 bg-background/80 p-5 backdrop-blur-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border p-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-secondary/70 text-foreground" }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              >
                <l.icon className="h-4 w-4 text-primary" />
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 flex items-center gap-3 rounded-xl bg-primary px-3 py-3 text-sm font-medium text-primary-foreground"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          </nav>

          <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4 text-sm text-muted-foreground">
            <Link to="/about" onClick={() => setOpen(false)} className="px-3 py-2 hover:text-foreground">
              About
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="px-3 py-2 hover:text-foreground">
              Contact
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
