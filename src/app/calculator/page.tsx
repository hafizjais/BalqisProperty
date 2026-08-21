import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CalculatorTabs from "@/components/calculators/CalculatorTabs";

export const metadata: Metadata = {
  title: "Property Calculators",
  description:
    "Loan instalment, stamp duty, legal fees, and affordability calculators for property buyers in Johor Bahru — estimates update instantly.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculator" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Property Calculators
      </h1>
      <p className="mt-2 text-warm-grey">
        Work out your loan instalment, stamp duty, legal fees, and affordability.
      </p>

      <div className="mt-6">
        <CalculatorTabs />
      </div>
    </div>
  );
}
