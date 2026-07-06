"use client";

import { useState } from "react";
import { MessageCircle, Share2, Check } from "lucide-react";
import type { Listing } from "@/lib/types";
import { priceLabel, waLink } from "@/lib/constants";

function inquiryUrl(listing: Listing): string {
  return waLink(
    `Hi Balqis, saya berminat dengan property ini: ${listing.title} di ${listing.area || "Johor Bahru"}. Boleh share more details?`
  );
}

// Sticky sidebar (desktop) + sticky bottom bar (mobile)
export default function InquiryPanel({ listing }: { listing: Listing }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Desktop sticky sidebar card */}
      <div className="hidden rounded-2xl bg-white p-6 shadow-card lg:block">
        <p className="text-sm text-warm-grey">Price</p>
        <p className="font-display text-3xl font-bold text-copper">
          {priceLabel(listing)}
        </p>
        <div className="mt-5 space-y-3">
          <a
            href={inquiryUrl(listing)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1eb857]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Inquire via WhatsApp
          </a>
          <button
            type="button"
            onClick={share}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-mocha px-6 py-3 text-sm font-semibold text-mocha transition-colors hover:bg-mocha hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Link copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" aria-hidden />
                Share this listing
              </>
            )}
          </button>
        </div>
        <p className="mt-4 text-xs text-warm-grey">
          Typically responds within 1–2 hours during business hours (9am–9pm).
        </p>
      </div>

      {/* Mobile sticky bottom bar — right padding keeps the WhatsApp FAB clear */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-sand bg-white px-4 py-3 pr-24 shadow-[0_-4px_24px_rgba(44,31,20,0.12)] lg:hidden">
        <p className="font-display text-lg font-bold text-copper">
          {priceLabel(listing)}
        </p>
        <a
          href={inquiryUrl(listing)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Inquire
        </a>
      </div>
    </>
  );
}
