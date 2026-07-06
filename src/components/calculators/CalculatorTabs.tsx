"use client";

import { useState } from "react";
import { Calculator, Landmark, ScrollText, Wallet } from "lucide-react";
import LoanCalculator from "./LoanCalculator";
import StampDutyCalculator from "./StampDutyCalculator";
import LegalFeesCalculator from "./LegalFeesCalculator";
import AffordabilityChecker from "./AffordabilityChecker";

const tabs = [
  { label: "Loan", icon: Calculator },
  { label: "Stamp Duty", icon: Landmark },
  { label: "Legal Fees", icon: ScrollText },
  { label: "Afford?", icon: Wallet },
];

// Tabbed container for all 4 Malaysian property calculators.
// All calculations are live — recalculate on every input change.
export default function CalculatorTabs() {
  const [active, setActive] = useState(0);
  const [sharedLoan, setSharedLoan] = useState(450000);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <h2 className="font-display text-xl font-bold text-espresso">
        Property Calculators
      </h2>
      <p className="mt-0.5 text-xs text-warm-grey">
        Estimates update instantly as you drag or type
      </p>

      <div
        role="tablist"
        aria-label="Property calculators"
        className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl bg-sand p-1.5"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight transition-all ${
              active === i
                ? "bg-mocha text-white shadow-sm"
                : "text-espresso/70 hover:bg-white/60 hover:text-espresso"
            }`}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {active === 0 && <LoanCalculator onLoanChange={setSharedLoan} />}
        {active === 1 && <StampDutyCalculator />}
        {active === 2 && <LegalFeesCalculator sharedLoanAmount={sharedLoan} />}
        {active === 3 && <AffordabilityChecker />}
      </div>
    </div>
  );
}
