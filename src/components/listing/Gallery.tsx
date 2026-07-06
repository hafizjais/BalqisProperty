"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

// Full-width image gallery — lightbox, swipeable, handles 0–4+ images gracefully
export default function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div
        className="h-64 w-full rounded-2xl bg-gradient-to-br from-sand via-[#e0d2c0] to-mocha/40 sm:h-96"
        aria-hidden
      />
    );
  }

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (delta > 48) prev();
    else if (delta < -48) next();
    touchX.current = null;
  };

  const navBtn =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-espresso/60 p-2 text-white transition-colors hover:bg-espresso";

  return (
    <div>
      <div
        className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-[28rem]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={images[index]}
          alt={`${title} — photo ${index + 1} of ${images.length}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className={`${navBtn} left-3`}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={next} aria-label="Next photo" className={`${navBtn} right-3`}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open fullscreen gallery"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-espresso/60 px-3 py-1.5 text-xs text-white hover:bg-espresso"
        >
          <Expand className="h-3.5 w-3.5" aria-hidden />
          {index + 1}/{images.length}
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === index ? "border-copper" : "border-transparent opacity-70"
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Previous photo" className={`${navBtn} left-4`}>
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button type="button" onClick={next} aria-label="Next photo" className={`${navBtn} right-4`}>
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          )}
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={images[index]}
              alt={`${title} — photo ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
