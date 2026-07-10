"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";

const links = [
  { href: "/", label: "Home" },
  { href: "/buy", label: "Buy" },
  { href: "/rent-house", label: "Rent a House" },
  { href: "/rent-room", label: "Rent a Room" },
  { href: "/commercial", label: "Commercial" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-mocha text-white shadow-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-wide">
          BalqisMJ <span className="text-copper">Property</span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`border-b-2 pb-1 text-sm transition-colors hover:text-white ${
                  pathname === link.href
                    ? "border-copper font-semibold text-white"
                    : "border-transparent text-white/85"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={waLink("Hi Balqis, boleh saya dapatkan bantuan?")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-copper px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a9633c] sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-mocha lg:hidden">
          <ul className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    pathname === link.href
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/85 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={waLink("Hi Balqis, boleh saya dapatkan bantuan?")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-copper px-4 py-2.5 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp Balqis
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
