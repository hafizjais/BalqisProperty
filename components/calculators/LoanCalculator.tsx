"use client";

import { useState, useEffect } from "react";
import { SliderField, ResultHero, ResultRow, CalcNote } from "./Field";
import { formatRM } from "@/lib/constants";

// M = P × [r(1+r)^n] / [(1+r)^n − 1]
export function monthlyInstalment(loan: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (n <= 0 || loan <= 0) return 0;
  if (r === 0) return loan / n;
  const factor = Math.pow(1 + r, n);
  return (loan * r * factor) / (factor - 1);
}

export default function LoanCalculator({
  onLoanChange,
}: {
  onLoanChange?: (loan: number) => void;
}) {
  const [price, setPrice] = useState(500000);
  const [down, setDown] = useState(10); // %, min 10
  const [tenure, setTenure] = useState(30); // years, 5–35
  const [rate, setRate] = useState(4.0); // % p.a.

  const downPct = Math.max(10, down || 0);
  const years = Math.min(35, Math.max(5, tenure || 5));
  const loan = Math.max(0, price * (1 - downPct / 100));
  const monthly = monthlyInstalment(loan, rate, years);
  const totalPayable = monthly * years * 12;
  const totalInterest = Math.max(0, totalPayable - loan);

  useEffect(() => {
    onLoanChange?.(Math.round(loan));
  }, [loan, onLoanChange]);

  return (
    <div className="space-y-4">
      <SliderField label="Property Price" prefix="RM" value={price} min={50000} max={3000000} step={10000} onChange={setPrice} />
      <SliderField label="Down Payment (min 10%)" suffix="%" value={down} min={10} max={50} step={1} onChange={setDown} />
      <SliderField label="Loan Tenure" suffix="yrs" value={tenure} min={5} max={35} step={1} onChange={setTenure} />
      <SliderField label="Interest Rate" suffix="%" value={rate} min={2} max={8} step={0.05} onChange={setRate} />

      <ResultHero label="Monthly Instalment" value={formatRM(monthly)} />

      <div className="rounded-xl bg-cream px-4 py-2">
        <ResultRow label="Loan Amount" value={formatRM(loan)} />
        <ResultRow label="Total Interest Payable" value={formatRM(totalInterest)} />
        <ResultRow label="Total Amount Payable" value={formatRM(totalPayable)} />
      </div>

      <CalcNote>
        Calculation is indicative. Actual loan terms subject to bank approval
        and credit profile.
      </CalcNote>
    </div>
  );
}
