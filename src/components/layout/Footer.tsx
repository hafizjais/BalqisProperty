import Link from "next/link";
import { Instagram, MessageCircle, MapPin } from "lucide-react";
import {
  JB_AREAS,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
  waLink,
} from "@/lib/constants";

const quickLinks = [
  { href: "/buy", label: "Buy Property" },
  { href: "/commercial", label: "Commercial" },
  { href: "/commercial/shop-lot", label: "Shop Lot" },
  { href: "/commercial/land", label: "Land" },
  { href: "/about", label: "About Balqis" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold text-cream">
            BalqisMJ <span className="text-copper">Property</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream/75">
            Nurul Balqis — your trusted property partner in Johor Bahru.
            Helping Malaysians buy, sell and rent across JB and the greater
            Iskandar Malaysia region.
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">
            Quick Links
          </p>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream/75 hover:text-copper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">
            Popular Areas
          </p>
          <ul className="space-y-2 text-sm text-cream/75">
            {JB_AREAS.slice(0, 8).map((area) => (
              <li key={area} className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-copper" aria-hidden />
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">
            Get in Touch
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={waLink("Hi Balqis, boleh saya dapatkan bantuan?")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cream/75 hover:text-copper"
              >
                <MessageCircle className="h-4 w-4 text-copper" aria-hidden />
                +60 18-265 6367
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cream/75 hover:text-copper"
              >
                <Instagram className="h-4 w-4 text-copper" aria-hidden />@
                {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-cream/55">
            WhatsApp: +{WHATSAPP_NUMBER} · Typically responds within 1–2 hours
            during business hours (9am–9pm)
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-cream/55 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} BalqisMJ Property · Nurul Balqis. All
            rights reserved.
          </p>
          <p>
            Prices and availability are indicative and subject to change
            without notice.
          </p>
        </div>
      </div>
    </footer>
  );
}
