import { SearchX, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { waLink } from "@/lib/constants";

export default function EmptyState({
  message = "No listings found",
}: {
  message?: string;
}) {
  return (
    <div className="col-span-full rounded-2xl border border-peach bg-graphite p-10 text-center shadow-card">
      <SearchX className="mx-auto h-10 w-10 text-warm-grey" aria-hidden />
      <h3 className="mt-4 font-display text-xl text-espresso">{message}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-warm-grey">
        Try adjusting your filters — or tell Balqis exactly what you&apos;re
        looking for and she&apos;ll find it for you.
      </p>
      <div className="mt-6">
        <Button
          variant="whatsapp"
          href={waLink(
            "Hi Balqis, I couldn't find what I'm looking for on the website. Can you help?"
          )}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Ask Balqis on WhatsApp
        </Button>
      </div>
    </div>
  );
}
