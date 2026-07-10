"use client";

// Slider + editable number input combo — drag for speed, type for precision
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  const safe = Number.isFinite(value) ? value : min;
  return (
    <div>
      <label className="text-xs font-semibold text-warm-grey">{label}</label>
      <div className="mt-1.5 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, safe))}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} slider`}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-sand accent-copper"
        />
        <span className="flex shrink-0 items-center rounded-lg border border-peach bg-graphite transition-colors focus-within:border-copper">
          {prefix && (
            <span className="pl-2.5 text-xs font-medium text-warm-grey">
              {prefix}
            </span>
          )}
          <input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={safe}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={label}
            className="w-24 bg-transparent px-2 py-2 text-right text-sm font-semibold text-espresso focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {suffix && (
            <span className="pr-2.5 text-xs font-medium text-warm-grey">
              {suffix}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

// Big centred output for each calculator's headline number
export function ResultHero({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink px-4 py-4 text-center">
      <p className="text-xs uppercase tracking-wider text-cream/75">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-copper">{value}</p>
    </div>
  );
}

export function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-peach py-2 last:border-0">
      <span className="text-sm text-warm-grey">{label}</span>
      <span className="text-sm font-semibold text-espresso">{value}</span>
    </div>
  );
}

export function CalcNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs italic text-warm-grey">{children}</p>;
}
