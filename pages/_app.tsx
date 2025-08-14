import "@/styles/globals.css";
import 'leaflet/dist/leaflet.css';
import { Inter } from 'next/font/google';
import type { AppProps } from "next/app";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }: AppProps) {
  return <main className={inter.className}>
  <Component {...pageProps} />
  </main>
}
