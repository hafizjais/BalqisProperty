import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle, Instagram, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { JB_AREAS, INSTAGRAM_URL, waLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Nurul Balqis",
  description:
    "Meet Nurul Balqis of BalqisMJ Property — licensed real estate agent specialising in Johor Bahru and the greater Iskandar Malaysia region.",
};

const propertyTypes = ["Residential", "Commercial", "Land", "Room Rental"];

const stats = [
  { value: "8", label: "Transactions" },
  { value: "3", label: "Months Experience" },
  { value: `${JB_AREAS.length}`, label: "Areas Covered" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      {/* Split layout — mirror of the landing hero */}
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-card">
          <Image
            src="/agent-balqis.png"
            alt="Nurul Balqis, licensed real estate agent in Johor Bahru"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold text-espresso">
            Nurul Balqis
          </h1>
          {/* TODO: add REN number once available */}
          <p className="mt-2 text-warm-grey">
            Licensed Real Estate Agent | REN _______
          </p>

          <p className="mt-6 text-lg leading-relaxed text-espresso/90">
            &ldquo;With years of experience in the Johor Bahru property market,
            I specialise in helping clients find the right home — whether
            buying, selling, or renting. My focus is always on Johor Bahru and
            the greater Iskandar Malaysia region.&rdquo;
          </p>

          <div className="mt-8 flex divide-x divide-peach rounded-2xl border border-peach bg-graphite py-4 shadow-card">
            {stats.map((s) => (
              <div key={s.label} className="flex-1 px-4 text-center">
                <p className="font-display text-2xl font-bold text-copper">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-warm-grey">{s.label}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-warm-grey">
            Property types I handle
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {propertyTypes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-sand px-4 py-1.5 text-sm font-medium text-espresso"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="whatsapp"
              href={waLink("Hi Balqis, I'd like to discuss my property needs.")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp Balqis
            </Button>
            <Button variant="secondary" href={INSTAGRAM_URL}>
              <Instagram className="h-4 w-4" aria-hidden />
              Follow on Instagram
            </Button>
          </div>
        </div>
      </div>

      {/* JB areas covered */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-espresso">
          Johor Bahru areas covered
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {JB_AREAS.map((area) => (
            <span
              key={area}
              className="rounded-full bg-graphite px-4 py-1.5 text-sm text-espresso shadow-card"
            >
              {area}
            </span>
          ))}
        </div>
      </section>

      {/* TODO: Add credentials, awards, and certifications here */}
      <section className="mt-16 rounded-2xl bg-sand p-8 text-center">
        <Award className="mx-auto h-8 w-8 text-copper" aria-hidden />
        <h2 className="mt-3 font-display text-2xl font-bold text-espresso">
          Credentials &amp; Certifications
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-warm-grey">
          Full credentials, awards and certifications will be listed here soon.
          Ask Balqis directly for verification of licensing details.
        </p>
      </section>
    </div>
  );
}
