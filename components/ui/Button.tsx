import Link from "next/link";

const variants = {
  primary: "bg-copper text-white hover:bg-[#a9633c]",
  secondary: "border-2 border-mocha text-mocha hover:bg-mocha hover:text-white",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1eb857]",
  light: "bg-white text-copper hover:bg-cream",
} as const;

type Variant = keyof typeof variants;

export default function Button({
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  children,
}: {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${variants[variant]} ${className}`;

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
