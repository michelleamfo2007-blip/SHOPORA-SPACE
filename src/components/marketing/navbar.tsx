"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#features", label: "Platform" },
  { href: "/#app", label: "App" },
  { href: "/#payments", label: "Payments" },
  { href: "/#pricing", label: "Pricing" },
];

function Logo() {
  return (
    <Link href="/" className="font-display text-[26px] leading-none tracking-tight text-[#12100e]">
      Shopora
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? "border-b border-stone-900/10 bg-[#f6f2ea]/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Logo />

          <nav className="hidden items-center gap-9 text-[13px] text-stone-600 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#12100e]">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/login" className="text-[13px] text-stone-700 hover:text-[#12100e]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#12100e] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-stone-800"
            >
              Start free month
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-[#12100e] md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#f6f2ea] md:hidden">
          <div className="flex h-[72px] items-center justify-between border-b border-stone-900/10 px-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center text-[#12100e]"
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
                className="border-b border-stone-900/10 py-4 font-display text-4xl text-[#12100e]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-stone-900/10 p-5">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#12100e] text-sm font-medium tracking-wide text-white"
            >
              Start free month
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
