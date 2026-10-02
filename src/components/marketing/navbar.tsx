"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/showcase", label: "Showcase" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-950 text-sm font-semibold text-white">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-stone-950">Shopora</span>
        </Link>

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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-900 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-stone-50 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-stone-800 hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-stone-800 hover:bg-white">
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-stone-950 px-4 py-3 text-center text-sm font-medium text-white"
            >
              Sign up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
