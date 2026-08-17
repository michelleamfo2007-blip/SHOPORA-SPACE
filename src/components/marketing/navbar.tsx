"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-black/5"
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Shopora.
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="#features" className="hover:text-black transition-colors">
          Features
        </Link>
        <Link href="#pricing" className="hover:text-black transition-colors">
          Pricing
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          Login
        </Link>
        <Link
          href="/waitlist"
          className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          Join Waitlist
        </Link>
      </div>
    </motion.header>
  );
}
