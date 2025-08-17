"use client";
import { useState, useEffect } from "react";

const currencies = ["USD", "CAD", "EUR", "GBP", "INR", "JPY"];

export default function CurrencySelector({
  children,
}: {
  children: (currency: string, rates: Record<string, number>) => React.ReactNode;
}) {
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    fetch("https://api.exchangerate.host/latest?base=USD")
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.error("Currency fetch error", err));
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-gray-800 text-white rounded-md p-2 w-32"
      >
        {currencies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {children(currency, rates)}
    </div>
  );
}
