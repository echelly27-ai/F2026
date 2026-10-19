import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({ className, linked = true }: { className?: string; linked?: boolean }) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2 font-display text-2xl font-bold tracking-[0.16em] text-paper", className)}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect width="22" height="22" rx="6" fill="#c6f135" />
        <path
          d="M6.2 14.6 11 7.2l4.8 7.4"
          fill="none"
          stroke="#07090d"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      NEXTUP
    </span>
  );

  if (!linked) return mark;
  return (
    <Link href="/" aria-label="NEXTUP home" className="rounded-md">
      {mark}
    </Link>
  );
}
