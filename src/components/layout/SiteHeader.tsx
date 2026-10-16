"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Discover Players" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tracker", label: "Tracker" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const menuId = useId();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const { session, signOut, ready } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sessionLabel = session?.name?.split(" ")[0] || "Account";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink">
      <Container className="flex items-center justify-between gap-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition",
                isActive(pathname, link.href) ? "text-lime" : "text-mist hover:text-paper",
              )}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          {ready && session ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-sm font-medium text-paper"
            >
              Sign out
              <span className="ml-2 text-mist">{sessionLabel}</span>
            </button>
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                "text-sm font-semibold",
                isActive(pathname, "/sign-in") ? "text-lime" : "text-paper",
              )}
              aria-current={isActive(pathname, "/sign-in") ? "page" : undefined}
            >
              Sign In
            </Link>
          )}
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-line text-paper lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
        </button>
      </Container>
      {open ? (
        <nav id={menuId} className="border-t border-line bg-ink lg:hidden" aria-label="Mobile">
          <Container className="flex flex-col py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-2 py-3 text-base font-medium",
                  isActive(pathname, link.href) ? "text-lime" : "text-paper",
                )}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            {ready && session ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-xl px-2 py-3 text-left text-base font-medium text-paper"
              >
                Sign out ({sessionLabel})
              </button>
            ) : (
              <Link href="/sign-in" className="rounded-xl px-2 py-3 text-base font-semibold text-lime">
                Sign In
              </Link>
            )}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
