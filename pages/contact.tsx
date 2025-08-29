"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Link from "next/link";

export default function ContactPage() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); 
      } else {
        setShowHeader(true); 
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-[#0C041C] text-textPrimary font-inter flex flex-col">
      {/* Animated header */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full bg-[#0C041C] z-50 shadow-md"
      >
        <div className="flex w-full max-w-6xl mx-auto justify-between items-center p-4">
          <Header />
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="mt-24 flex-1 px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-8 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Have a question, suggestion, or want to collaborate?  
            Fill out one of the forms below and we’ll get back to you as soon as possible.
          </p>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Form */}
            <div className="w-full h-[700px] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://tally.so/r/3jj71R"
                width="100%"
                height="100%"
                title="Flyte Contact Form 1"
                className="border-none"
              ></iframe>
            </div>

            {/* Second Form */}
            <div className="w-full h-[700px] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://tally.so/r/npQ7lV"
                width="100%"
                height="100%"
                title="Flyte Contact Form 2"
                className="border-none"
              ></iframe>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-blue-950/5 border-t border-white/10 w-full mt-auto z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Flyte. This project is under the MIT License.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="hover:text-blue-400 transition">
              About
            </Link>
            <Link href="/" className="hover:text-blue-400 transition">
              Search Flights
            </Link>
            <Link href="/contact" className="hover:text-blue-400 transition">
              Contact
            </Link>
            <Link href="https://github.com/arghya-v/flyte" target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400 transition">  GitHub </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
