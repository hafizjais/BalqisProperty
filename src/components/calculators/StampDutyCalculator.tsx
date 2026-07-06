"use client";

import { useState } from "react";
import { SliderField, ResultHero, ResultRow, CalcNote } from "./Field";
import { formatRM } from "@/lib/constants";

// Malaysian stamp duty scale on Memorandum of Transfer (MOT):
// First RM100,000 → 1% | RM100,001–500,000 → 2% | RM500,001–1,000,000 → 3% | Above RM1,000,000 → 4%
export function stampDuty(price: number): number {
  if (price <= 0) return 0;
  let duty = Math.min(price, 100000) * 0.01;
  if (price > 100000) duty += (Math.min(price, 500000) - 100000) * 0.02;
  if (price > 500000) duty += (Math.min(price, 1000000) - 500000) * 0.03;
  if (price > 1000000) duty += (price - 1000000) * 0.04;
  return duty;
}

export default function StampDutyCalculator() {
  const [price, setPrice] = useState(500000);
  const [firstTime, setFirstTime] = useState(false);

  const duty = stampDuty(price);
  const exempt = firstTime && price <= 500000;

  return (
    <div className="space-y-4">
      <SliderField label="Property Price" prefix="RM" value={price} min={100000} max={1500000} step={10000} onChange={setPrice} />

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-sand bg-graphite px-4 py-3">
        <span className="text-sm font-medium text-espresso">
          I&apos;m a first-time buyer
        </span>
        <input
          type="checkbox"
          checked={firstTime}
          onChange={(e) => setFirstTime(e.target.checked)}
          className="h-5 w-5 accent-copper"
        />
      </label>

      <ResultHero
        label="Stamp Duty (MOT)"
        value={exempt ? "RM 0" : formatRM(duty)}
      />

      {exempt && (
        <div className="rounded-xl bg-cream px-4 py-2">
          <ResultRow label="Full exemption applied" value="✓" />
          <ResultRow label="Without exemption" value={formatRM(duty)} />
        </div>
      )}

      {firstTime && (
        <CalcNote>
          First-time buyers may be eligible for full stamp duty exemption on
          properties up to RM500,000 under the government homeownership
          campaign. Confirm with your solicitor.
        </CalcNote>
      )}
    </div>
  );
}
