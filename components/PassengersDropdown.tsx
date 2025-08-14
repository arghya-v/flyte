"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Users, Minus, Plus } from "lucide-react";

type PassengersDropdownProps = {
  adults: number;
  setAdults: React.Dispatch<React.SetStateAction<number>>;
  children: number;
  setChildren: React.Dispatch<React.SetStateAction<number>>;
  infants: number;
  setInfants: React.Dispatch<React.SetStateAction<number>>;
};

export default function PassengersDropdown({
  adults,
  setAdults,
  children,
  setChildren,
  infants,
  setInfants,
}: PassengersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPassengers = adults + children + infants;
  const getPassengersText = () =>
    totalPassengers === 1 ? "1 passenger" : `${totalPassengers} passengers`;

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) =>
    setter(current + 1);

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number,
    min: number = 0
  ) => {
    if (current > min) setter(current - 1);
  };

  const handleDone = () => setIsOpen(false);

  // Toggle dropdown & calculate portal position
  const toggleDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
    setIsOpen(prev => !prev);
  };

  // Close dropdown on outside click (ignore button + dropdown itself)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center justify-between min-w-[140px] h-12 px-4 py-3 bg-[rgba(22,10,45,0.5)] backdrop-blur-sm hover:bg-[rgba(66,2,180,0.2)] text-gray-300 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">{getPassengersText()}</span>
        </div>
      </button>

      {/* Dropdown via portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef} // important to prevent closing when clicking inside
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            className="absolute w-72 bg-[rgba(22,10,45,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-lg shadow-lg z-50"
          >
            <div className="p-4 space-y-4">
              <PassengerRow
                label="Adults"
                count={adults}
                min={1}
                onIncrement={() => handleIncrement(setAdults, adults)}
                onDecrement={() => handleDecrement(setAdults, adults, 1)}
              />
              <PassengerRow
                label="Children"
                subLabel="Aged 2-11"
                count={children}
                onIncrement={() => handleIncrement(setChildren, children)}
                onDecrement={() => handleDecrement(setChildren, children)}
              />
              <PassengerRow
                label="Infants"
                subLabel="Under 2"
                count={infants}
                onIncrement={() => handleIncrement(setInfants, infants)}
                onDecrement={() => handleDecrement(setInfants, infants)}
              />
            </div>
            <div className="border-t border-[rgba(255,255,255,0.1)] p-3">
              <button
                onClick={handleDone}
                className="w-full bg-[#4202B4] hover:bg-violet-950 text-white font-medium rounded-lg py-2 transition"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// Passenger Row Component
type PassengerRowProps = {
  label: string;
  subLabel?: string;
  count: number;
  min?: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

function PassengerRow({ label, subLabel, count, min = 0, onIncrement, onDecrement }: PassengerRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium text-sm text-white">{label}</div>
        {subLabel && <div className="text-xs text-gray-400">{subLabel}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          disabled={count <= min}
          className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-400 hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-50 transition"
        >
          <Minus className="h-4 w-4 text-white" />
        </button>
        <span className="font-medium text-sm w-8 text-center text-white">{count}</span>
        <button
          onClick={onIncrement}
          className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-400 hover:bg-[rgba(255,255,255,0.1)] transition"
        >
          <Plus className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
