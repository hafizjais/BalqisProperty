import Link from "next/link";

const variants = {
  primary: "bg-teal text-white hover:bg-[#015d61]",
  cta: "bg-copper text-white hover:bg-[#cf6526]",
  secondary: "border-2 border-teal text-teal hover:bg-teal hover:text-white",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1eb857]",
  telegram: "bg-[#229ED9] text-white hover:bg-[#1c86b8]",
  light: "bg-white text-teal hover:bg-cream",
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
