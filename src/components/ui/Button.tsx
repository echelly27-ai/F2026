import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/format";

const variants = {
  primary: "bg-lime text-ink hover:bg-lime-2",
  secondary: "border border-line bg-transparent text-paper hover:border-lime hover:text-lime",
  ghost: "text-mist hover:text-paper",
  danger: "border border-rose-300/40 text-rose-200 hover:bg-rose-400/10",
} as const;

const sizes = {
  md: "px-5 py-2.5 text-sm",
  sm: "px-3 py-2 text-sm",
} as const;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
