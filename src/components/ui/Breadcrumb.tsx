import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-warm-grey">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="hover:text-copper">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-espresso">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
