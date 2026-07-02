import logoAsset from "@/assets/ndl-logo.png.asset.json";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="NDL Ghana"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Logo className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <div className="leading-tight">
        <div className="font-display text-lg font-extrabold tracking-tight text-brand-navy">
          NDL <span className="text-brand-orange">GHANA</span>
        </div>
        {!compact && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-sky">
            Global Shipping · China · UK · Dubai
          </div>
        )}
      </div>
    </div>
  );
}
