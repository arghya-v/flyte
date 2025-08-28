"use client";
import { useState, useEffect, ReactNode } from "react";

const currencies = ["USD", "CAD", "EUR", "GBP", "INR", "JPY"] as const;
type Currency = (typeof currencies)[number];

const currencyFlags: Record<Currency, string> = {
  USD: "$",
  CAD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

type Props = {
  children: (currency: Currency, rates: Record<string, number>) => ReactNode;
};

export default function CurrencySelector({ children }: Props) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_API_KEY;
    if (!apiKey) {
      console.error("Missing ExchangeRate API key");
      return;
    }

    fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result === "success") setRates(data.conversion_rates);
        else console.error("Currency fetch failed:", data);
      })
      .catch((err) => console.error("Currency fetch error", err));
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="
          bg-[#0D112F] 
          backdrop-blur-md 
          border border-[rgba(255,255,255,0.1)]
          text-white 
          rounded-xl 
          p-3 
          w-44 
          focus:outline-none 
          focus:ring-2 
          focus:ring-white/30
          shadow-lg shadow-black/20
          transition
          fixed bottom-20
          fixed right-10

          z-60
        "
      >
        {currencies.map((c) => (
          <option key={c} value={c}>
            {currencyFlags[c]} {c}
          </option>
        ))}
      </select>

      {children(currency, rates)}
    </div>
  );
}
