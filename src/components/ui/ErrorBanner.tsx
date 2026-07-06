import { AlertTriangle, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { waLink } from "@/lib/constants";

export default function ErrorBanner() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 rounded-2xl border border-copper/30 bg-sand p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-copper" aria-hidden />
      <div>
        <p className="font-semibold text-espresso">
          Something went wrong loading listings.
        </p>
        <p className="mt-1 text-sm text-warm-grey">
          Please try again shortly — or contact Balqis directly on WhatsApp.
        </p>
      </div>
      <Button
        variant="whatsapp"
        href={waLink("Hi Balqis, the website listings aren't loading. Can you help me directly?")}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Contact Balqis on WhatsApp
      </Button>
    </div>
  );
}
