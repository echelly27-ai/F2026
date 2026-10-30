import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/layout/Container";

const LINKS = [
  { href: "/challenges", label: "Eight challenges" },
  { href: "/players", label: "Discover players" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tracker", label: "Recruiting tracker" },
  { href: "/sign-in", label: "Sign in" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-navy">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
            NEXTUP is a basketball recruiting workspace. The public directory repeats ranking facts from
            ESPN&apos;s 2027 SC Next 100 and links out for reports. It does not invent offers or coach contacts.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-mist transition hover:text-paper">
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-4 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>© NEXTUP. Demo data stays in your browser unless you connect Supabase.</p>
        <p>Basketball photography from Unsplash and Pexels.</p>
      </Container>
    </footer>
  );
}
