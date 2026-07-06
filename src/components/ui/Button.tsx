import Link from "next/link";

const variants = {
  primary: "bg-copper text-ink hover:bg-[#b8962e]",
  secondary: "border-2 border-warm-grey/40 text-espresso hover:border-copper hover:text-copper",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1eb857]",
  telegram: "bg-[#229ED9] text-white hover:bg-[#1c86b8]",
  light: "bg-espresso text-ink hover:bg-white",
} as const;

type Variant = keyof typeof variants;

const sizes = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

type Size = keyof typeof sizes;

export default function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  className = "",
  children,
}: {
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ${sizes[size]} ${variants[variant]} ${className}`;

  if (href && href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
