"use client";

import { useState, useEffect } from "react";
import { SliderField, ResultHero, ResultRow, CalcNote } from "./Field";
import { formatRM } from "@/lib/constants";

// Malaysian solicitor scale fee (Housing Solicitors Remuneration Order):
// First RM500,000 → 1% | RM500,001–1,000,000 → 0.8% | RM1,000,001–3,000,000 → 0.7%
// Above RM3,000,000 → negotiable (capped at 0.7%) | Minimum fee RM500
export function scaleFee(amount: number): number {
  if (amount <= 0) return 0;
  let fee = Math.min(amount, 500000) * 0.01;
  if (amount > 500000) fee += (Math.min(amount, 1000000) - 500000) * 0.008;
  if (amount > 1000000) fee += (Math.min(amount, 3000000) - 1000000) * 0.007;
  if (amount > 3000000) fee += (amount - 3000000) * 0.007;
  return Math.max(fee, 500);
}

export default function LegalFeesCalculator({
  sharedLoanAmount,
}: {
  sharedLoanAmount?: number;
}) {
  const [price, setPrice] = useState(500000);
  const [loanAmount, setLoanAmount] = useState(450000);

  // Auto-populate loan amount from the Loan tab if the user has been there
  useEffect(() => {
    if (sharedLoanAmount && sharedLoanAmount > 0) {
      setLoanAmount(sharedLoanAmount);
    }
  }, [sharedLoanAmount]);

  const spaFees = scaleFee(price);
  const loanFees = scaleFee(loanAmount);
  const disbursements = 2000; // midpoint of RM1,500–RM2,500 estimate
  const total = spaFees + loanFees + disbursements;

  return (
    <div className="space-y-4">
      <SliderField label="Property Price" prefix="RM" value={price} min={50000} max={3000000} step={10000} onChange={setPrice} />
      <SliderField label="Loan Amount" prefix="RM" value={loanAmount} min={0} max={3000000} step={10000} onChange={setLoanAmount} />

      <ResultHero label="Total Estimated Legal Fees" value={formatRM(total)} />

      <div className="rounded-xl bg-cream px-4 py-2">
        <ResultRow label="SPA Legal Fees" value={formatRM(spaFees)} />
        <ResultRow label="Loan Agreement Legal Fees" value={formatRM(loanFees)} />
        <ResultRow label="Disbursements (estimate)" value="RM 1,500 – RM 2,500" />
      </div>

      <CalcNote>
        Loan agreement fees use the same scale applied on the loan amount (not
        purchase price). Total uses a RM2,000 disbursements midpoint. Fees
        above RM3 million are negotiable (capped at 0.7%).
      </CalcNote>
    </div>
  );
}
