"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[60%] max-w-6xl -translate-x-1/2
                       backdrop-blur-md bg-blue-950/20 border border-white/20 rounded-2xl
                       shadow-lg">
      <div className="px-6 py-1 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-lg font-bold tracking-wide">
          <Image src="/flyte-logo.png" alt="Flyte Logo" width={70} height={70} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-md font-light items-center">
          <Link href="/about" className="hover:text-blue-400 transition">About</Link>
          <Link href="/search" className="hover:text-blue-400 transition">Search Flights</Link>
          <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
          <Link href="/donate" className="hover:text-blue-400 transition">Donate</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/20 px-6 py-4 space-y-3 bg-white/5 backdrop-blur-md rounded-b-2xl">
          <Link href="/about" className="block hover:text-blue-400 transition">About</Link>
          <Link href="/search" className="block hover:text-blue-400 transition">Search Flights</Link>
          <Link href="/contact" className="block hover:text-blue-400 transition">Contact</Link>
          <Link href="/donate" className="block hover:text-blue-400 transition">Donate</Link>
        </div>
      )}
    </header>
  );
}
