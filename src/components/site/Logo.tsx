export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-white">
        <img src="/pwa-192.png" alt="Precise Industries logo" className="h-9 w-9 object-contain" />
      </span>
      <span className="font-display text-[15px] font-semibold leading-none tracking-tight">
        Precise
        <span className="block text-[10px] font-medium tracking-[0.28em] text-muted-foreground">
          INDUSTRIES
        </span>
      </span>
    </span>
  );
}
