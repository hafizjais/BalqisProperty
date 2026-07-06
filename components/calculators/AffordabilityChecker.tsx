"use client";

import { useState } from "react";
import { SliderField, ResultHero, ResultRow, CalcNote } from "./Field";
import { formatRM } from "@/lib/constants";

export default function AffordabilityChecker() {
  const [income, setIncome] = useState(5000);
  const [commitments, setCommitments] = useState(800);
  const [tenure, setTenure] = useState(35);
  const [rate, setRate] = useState(4.0);

  // Maximum DSR (Debt Service Ratio): 70% — Malaysian bank standard
  const available = Math.max(0, income * 0.7 - commitments);

  // Back-calculate maximum loan from available instalment using the loan formula
  const r = rate / 100 / 12;
  const n = Math.min(35, Math.max(5, tenure || 5)) * 12;
  const factor = Math.pow(1 + r, n);
  const maxLoan = r === 0 ? available * n : (available * (factor - 1)) / (r * factor);

  // Assuming 90% financing
  const maxPrice = maxLoan / 0.9;

  return (
    <div className="space-y-4">
      <SliderField label="Gross Monthly Income" prefix="RM" value={income} min={1000} max={30000} step={100} onChange={setIncome} />
      <SliderField label="Existing Monthly Commitments" prefix="RM" value={commitments} min={0} max={10000} step={50} onChange={setCommitments} />
      <SliderField label="Loan Tenure" suffix="yrs" value={tenure} min={5} max={35} step={1} onChange={setTenure} />
      <SliderField label="Interest Rate" suffix="%" value={rate} min={2} max={8} step={0.05} onChange={setRate} />

      <ResultHero
        label="Property Price You Can Afford"
        value={formatRM(maxPrice)}
      />

      <div className="rounded-xl bg-cream px-4 py-2">
        <ResultRow label="Maximum Monthly Instalment" value={formatRM(available)} />
        <ResultRow label="Maximum Loan Amount" value={formatRM(maxLoan)} />
      </div>

      <CalcNote>
        Based on a 70% DSR guideline. Actual approval depends on your bank,
        credit history, and employment type.
      </CalcNote>
    </div>
  );
}
