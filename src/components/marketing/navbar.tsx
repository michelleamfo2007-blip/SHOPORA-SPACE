"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { Menu, X } from "lucide-react";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-store-display",
});

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/showcase", label: "Showcase" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-950 text-sm font-semibold text-white">
        S
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-stone-950">Shopora</span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-stone-950">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-950">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Sign up
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-stone-900 md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {open && (
        <div className={`${displayFont.variable} fixed inset-0 z-[60] flex flex-col bg-[#faf8f5] md:hidden`}>
          <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center text-stone-900"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
            {[...links, { href: "/login", label: "Log in" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-stone-200 py-4 font-display text-3xl text-stone-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-stone-200 p-5">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="flex h-12 w-full items-center justify-center rounded-full bg-stone-950 text-sm font-medium tracking-wide text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
