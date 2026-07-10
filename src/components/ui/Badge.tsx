const styles: Record<string, string> = {
  sale: "bg-copper text-white", // orange — attention
  rent: "bg-teal text-white",
  "room-rent": "bg-warm-grey text-white",
  sold: "bg-slate-500 text-white",
  neutral: "bg-sand text-espresso",
};

export const listingTypeLabel: Record<string, string> = {
  sale: "For Sale",
  rent: "For Rent",
  "room-rent": "Room Rental",
};

export default function Badge({
  variant = "neutral",
  children,
}: {
  variant?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[variant] || styles.neutral
      }`}
    >
      {children}
    </span>
  );
}
