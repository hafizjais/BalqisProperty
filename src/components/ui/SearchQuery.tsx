"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

// Reads ?q= from the URL (set by the homepage hero search). Kept in its own
// Suspense boundary so the rest of each listings page still renders
// statically — useSearchParams() would otherwise opt the whole page out.
function Reader({ onChange }: { onChange: (q: string) => void }) {
  const q = useSearchParams().get("q") ?? "";
  useEffect(() => {
    onChange(q.trim());
  }, [q, onChange]);
  return null;
}

export function SearchQueryReader({ onChange }: { onChange: (q: string) => void }) {
  return (
    <Suspense fallback={null}>
      <Reader onChange={onChange} />
    </Suspense>
  );
}

export function SearchQueryBanner({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  if (!query) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-warm-grey">
      <Search className="h-4 w-4 text-copper" aria-hidden />
      Results for
      <span className="rounded-full bg-sand px-3 py-1 font-semibold text-espresso">
        “{query}”
      </span>
      <button
        type="button"
        onClick={() => router.replace(pathname, { scroll: false })}
        className="inline-flex items-center gap-1 rounded-full border border-peach px-3 py-1 font-medium text-espresso transition-colors hover:border-copper hover:text-copper"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear search
      </button>
    </div>
  );
}
