import Link from "next/link";

type FooterProps = {
  className?: string;
};

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`backdrop-blur-md bg-blue-950/5 border-t border-white/10 w-full ${className} fixed bottom-0 left-0 w-full z-40`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} FlightFinder. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm">
          <Link href="/about" className="hover:text-blue-400 transition">
            About
          </Link>
          <Link href="/search" className="hover:text-blue-400 transition">
            Search Flights
          </Link>
          <Link href="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
          <Link href="/donate" className="hover:text-blue-400 transition">
            Donate
          </Link>
        </div>
      </div>
    </footer>
  );
}
