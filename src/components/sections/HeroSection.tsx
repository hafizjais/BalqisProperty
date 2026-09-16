"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Send, Phone, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  waLink,
  TELEGRAM_URL,
  TELEGRAM_SUBSALE_URL,
  AGENCY_NAME,
  AGENCY_REG_NO,
  AGENCY_PHONE,
  AGENCY_EMAIL,
} from "@/lib/constants";

// Immersive full-bleed hero: edge-to-edge photography with an optional
// looping video backdrop — drop a file at public/hero-video.mp4 to enable it.
export default function HeroSection() {
  const [videoOk, setVideoOk] = useState(true);

  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-ink">
      {/* Edge-to-edge backdrop — fixed brand image, not pulled from Airtable */}
      <Image
        src="/Team_background.jpg"
        alt=""
        fill
        priority
        unoptimized={false}
        sizes="100vw"
        className="object-cover opacity-50"
        aria-hidden
      />
      {videoOk && (
        <video
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoOk(false)}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          aria-hidden
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}
      {/* Charcoal gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center gap-12 px-4 pb-32 pt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl flex-1"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-copper sm:text-base">
            BalqisMJ Property · Johor Bahru
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-cream sm:text-6xl">
            Your Trusted Property Partner in Johor Bahru
          </h1>
          {/* Agency details — from Nurul Balqis's business card */}
          <div className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="font-display text-lg font-bold text-cream">
              {AGENCY_NAME} <span className="text-copper">{AGENCY_REG_NO}</span>
            </p>
            <div className="mt-4 space-y-1.5 text-lg text-cream/85">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-copper" aria-hidden />
                {AGENCY_PHONE}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-copper" aria-hidden />
                {AGENCY_EMAIL}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button variant="primary" size="lg" href="/subsale">
              Browse All Listings
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
            <Button
              variant="whatsapp"
              size="lg"
              href={waLink("Hi Balqis, I'm looking for property in JB. Can you help?")}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp Me
            </Button>
            {/* Two Telegram channels — grouped tighter together as a pair */}
            <div className="flex gap-2">
              <Button variant="telegram" size="lg" href={TELEGRAM_URL}>
                <Send className="h-5 w-5" aria-hidden />
                Rental
              </Button>
              <Button variant="telegram" size="lg" href={TELEGRAM_SUBSALE_URL}>
                <Send className="h-5 w-5" aria-hidden />
                Subsale &amp; Land
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Agent portrait — circular frame, floating on the right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="mb-8 mr-2 hidden shrink-0 lg:block xl:mr-8"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-80 w-80 xl:h-96 xl:w-96"
          >
            {/* soft gold glow */}
            <div
              className="absolute -inset-8 rounded-full bg-copper/20 blur-3xl"
              aria-hidden
            />
            {/* slowly rotating dashed ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border-2 border-dashed border-copper/40"
              aria-hidden
            />
            <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-copper shadow-card-hover">
              <Image
                src="/Balqis.png"
                alt="Nurul Balqis, property agent in Johor Bahru"
                fill
                priority
                unoptimized={false}
                sizes="384px"
                className="object-cover object-top"
              />
            </div>
            {/* name badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-copper/40 bg-ink/85 px-5 py-2 text-sm font-semibold text-cream backdrop-blur-md">
              Nurul Balqis <span className="text-copper">· BalqisMJ</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
