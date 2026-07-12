"use client";

import { useState } from "react";
import { MessageCircle, Instagram, Clock, MapPin } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  JB_AREAS,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  waLink,
} from "@/lib/constants";

const inputCls =
  "w-full rounded-lg border border-peach bg-cream px-3 py-2.5 text-sm text-espresso placeholder:text-warm-grey/70";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("Buy");
  const [message, setMessage] = useState("");

  // On submit: open WhatsApp pre-filled with the form data — no backend needed
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Balqis, saya ${name} (${phone}). Inquiry: ${inquiryType}. ${message}`;
    window.open(waLink(text), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Contact Balqis
      </h1>
      <p className="mt-2 text-warm-grey">
        Reach out any time — WhatsApp is the fastest way to get a response.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        {/* Left column — contact info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-peach bg-graphite p-6 shadow-card">
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href={waLink("Hi Balqis, boleh saya dapatkan bantuan?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-medium text-espresso hover:text-copper"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1eb857]">
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </span>
                  WhatsApp: +60 18-265 6367
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-medium text-espresso hover:text-copper"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper/15 text-copper">
                    <Instagram className="h-5 w-5" aria-hidden />
                  </span>
                  Instagram: @{INSTAGRAM_HANDLE}
                </a>
              </li>
              <li className="flex items-center gap-3 text-warm-grey">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-mocha">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                Typically responds within 1–2 hours during business hours
                (9am–9pm)
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-card">
            <iframe
              src="https://maps.google.com/maps?q=Johor%20Bahru%20City%20Centre&t=&z=12&ie=UTF8&iwloc=&output=embed"
              title="Map of Johor Bahru city centre"
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="rounded-2xl bg-sand p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-espresso">
              <MapPin className="h-4 w-4 text-copper" aria-hidden />
              Operating Areas
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {JB_AREAS.map((area) => (
                <span
                  key={area}
                  className="rounded-full bg-graphite px-3 py-1 text-xs text-espresso"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — WhatsApp form */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-peach bg-graphite p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold text-espresso">
            Send a WhatsApp inquiry
          </h2>
          <p className="mt-1 text-sm text-warm-grey">
            Fill this in and it opens WhatsApp with your message ready to send.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-warm-grey">
                Name
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-warm-grey">
                Phone
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 012-345 6789"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-warm-grey">
                Inquiry Type
              </span>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className={inputCls}
              >
                <option>Buy</option>
                <option>Sell</option>
                <option>Shop Lot</option>
                <option>Land</option>
                <option>General</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-warm-grey">
                Message
              </span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell Balqis what you're looking for…"
                className={inputCls}
              />
            </label>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1eb857]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Send via WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
