import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";

// Fixed bottom-right, always visible
export default function WhatsAppFAB() {
  return (
    <a
      href={waLink("Hi Balqis, boleh saya dapatkan bantuan?")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Balqis"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
      <span className="hidden text-sm font-semibold sm:inline">
        WhatsApp Balqis
      </span>
    </a>
  );
}
