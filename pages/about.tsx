"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next"
export default function AboutPage() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-[#0C041C] text-textPrimary font-inter flex flex-col">
      <Analytics/>
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
      <main className="mt-24 flex-1 px-6 py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold tracking-tight">Why build Flyte?</h2>

          <p className="text-lg text-gray-400 leading-relaxed">
            In a world where travel has become more complicated and stressful,
            we wanted to create something different. Something that brings back
            the joy of flying and makes searching for flights a delightful
            experience again. With rising costs, hidden fees, and overwhelming
            options, finding the right flight can feel like a chore rather than
            an exciting start to a new adventure. Moreover the decision fatigue from thinking about which 
            flight would be a better choice.
          </p>

          <p className="text-lg text-gray-400 leading-relaxed">
            That’s why we built <span className="font-semibold text-white">Flyte</span>.
            An open-source flight search engine designed to bring back the
            excitement of flying while cutting out the clutter. No ads. No noise.
            Just clean, simple design and accurate data—so travelers everywhere
            can fall in love with flying again. Built with community YouTube reviews and feedback. So YOU decide where and how YOU want to fly.
          </p>

          <p className="text-lg text-gray-400 leading-relaxed">
            Flyte is about community as much as technology. We believe travel
            tools should be built in the open, where anyone can contribute,
            improve, and create together. That’s why Flyte is{" "}
            <span className="font-semibold text-white">open-source</span>.
          </p>

          <p className="text-lg text-gray-400 leading-relaxed">
            We’ll take care of the details—clean UI, real flight data, and smooth
            design—so you can just focus on what really matters:{" "}
            <span className="italic">looking for the right flight.</span>
          </p>
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
