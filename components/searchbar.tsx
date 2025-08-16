"use client";

import { useState, useEffect, Fragment } from "react";
import { Search, MapPin, Calendar, ChevronDown } from "lucide-react";
import PassengersDropdown from "@/components/PassengersDropdown";
import DatePicker from "react-datepicker";
import { Listbox, Transition } from "@headlessui/react";
import "react-datepicker/dist/react-datepicker.css";

type Airport = {
  name: string;
  iataCode: string;
  cityName: string;
  countryName: string;
};

type Props = {
  origin: string;
  setOrigin: React.Dispatch<React.SetStateAction<string>>;
  destination: string;
  setDestination: React.Dispatch<React.SetStateAction<string>>;
  date: Date | null;
  setDate: React.Dispatch<React.SetStateAction<Date | null>>;
  returnDate: Date | null;
  setReturnDate: React.Dispatch<React.SetStateAction<Date | null>>;
  adults: number;
  setAdults: React.Dispatch<React.SetStateAction<number>>;
  children: number;
  setChildren: React.Dispatch<React.SetStateAction<number>>;
  infants: number;
  setInfants: React.Dispatch<React.SetStateAction<number>>;
  flightType: string;
  setFlightType: React.Dispatch<React.SetStateAction<string>>;
  serviceClass: string;
  setServiceClass: React.Dispatch<React.SetStateAction<string>>;
  onSearch: (params: any) => Promise<void>;
};

const flightTypes = ["Round-trip", "One-way", "Multi-city"];
const serviceClasses = ["Economy", "Premium Economy", "Business", "First"];

export default function SearchBar({
  origin,
  setOrigin,
  destination,
  setDestination,
  date,
  setDate,
  returnDate,
  setReturnDate,
  adults,
  setAdults,
  children,
  setChildren,
  infants,
  setInfants,
  flightType,
  setFlightType,
  serviceClass,
  setServiceClass,
  onSearch,
}: Props) {
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);

  const fetchAirports = async (query: string, setter: (data: Airport[]) => void) => {
    if (!query) return setter([]);
    try {
      const res = await fetch(`/api/airports?query=${query}`);
      const data = await res.json();
      setter(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAirports(origin, setOriginSuggestions);
  }, [origin]);

  useEffect(() => {
    fetchAirports(destination, setDestinationSuggestions);
  }, [destination]);

  const handleSearch = () => {
    onSearch({
      origin,
      destination,
      departureDate: date,
      returnDate: flightType === "Round-trip" ? returnDate : null,
      adults,
      children,
      infants,
      flightType,
      serviceClass,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="relative rounded-2xl p-6 bg-[rgba(22,10,45,0.5)] backdrop-blur-md shadow-[0_8px_30px_rgba(66,2,180,0.3)] border border-[rgba(255,255,255,0.1)] overflow-visible">
        {/* Top row */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          {/* Flight Type */}
          <Listbox value={flightType} onChange={setFlightType}>
            <div className="relative w-40">
              <Listbox.Button className="w-full h-12 px-3 rounded-lg bg-[rgba(22,10,45,0.6)] text-gray-300 flex justify-between items-center">
                {flightType}
                <ChevronDown className="w-4 h-4" />
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 w-full bg-[rgba(22,10,45,0.8)] rounded-lg shadow-lg text-white z-50">
                  {flightTypes.map((type) => (
                    <Listbox.Option
                      key={type}
                      value={type}
                      className={({ active }) => `cursor-pointer px-4 py-2 ${active ? "bg-[#4202B4]" : ""}`}
                    >
                      {type}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* Service Class */}
          <Listbox value={serviceClass} onChange={setServiceClass}>
            <div className="relative w-48">
              <Listbox.Button className="w-full h-12 px-3 rounded-lg bg-[rgba(22,10,45,0.6)] text-gray-300 flex justify-between items-center">
                {serviceClass}
                <ChevronDown className="w-4 h-4" />
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 w-full bg-[rgba(22,10,45,0.8)] rounded-lg shadow-lg text-white z-50">
                  {serviceClasses.map((cls) => (
                    <Listbox.Option
                      key={cls}
                      value={cls}
                      className={({ active }) => `cursor-pointer px-4 py-2 ${active ? "bg-[#4202B4]" : ""}`}
                    >
                      {cls}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* Passengers */}
          <PassengersDropdown
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
            infants={infants}
            setInfants={setInfants}
          />
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Origin */}
          <AirportInput
            label="From"
            value={origin}
            setValue={setOrigin}
            suggestions={originSuggestions}
            setSuggestions={setOriginSuggestions}
          />

          {/* Destination */}
          <AirportInput
            label="To"
            value={destination}
            setValue={setDestination}
            suggestions={destinationSuggestions}
            setSuggestions={setDestinationSuggestions}
          />

          {/* Departure Date */}
          <DateField label="Departure" date={date} setDate={setDate} />

          {/* Return Date (only for round-trip) */}
          {flightType === "Round-trip" && <DateField label="Return" date={returnDate} setDate={setReturnDate} />}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="h-12 px-8 bg-[#4202B4] hover:bg-violet-950 text-white font-medium rounded-lg shadow-md flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Flights
          </button>
        </div>
      </div>
    </div>
  );
}

function AirportInput({
  label,
  value,
  setValue,
  suggestions,
  setSuggestions,
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  suggestions: Airport[];
  setSuggestions: (val: Airport[]) => void;
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
        <input
          type="text"
          placeholder={`${label} (IATA code)`}
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          className="w-full h-12 pl-10 pr-4 rounded-lg bg-[rgba(22,10,45,0.5)] text-white placeholder:text-gray-400"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-[rgba(22,10,45,0.8)] mt-1 rounded-lg shadow-lg z-50 max-h-48 overflow-auto">
          {suggestions.map((a) => (
            <li
              key={a.iataCode}
              className="p-3 hover:bg-[rgba(66,2,180,0.2)] cursor-pointer text-sm border-b border-[rgba(255,255,255,0.1)] last:border-b-0"
              onClick={() => {
                setValue(a.iataCode);
                setSuggestions([]);
              }}
            >
              <div className="font-medium">{a.iataCode}</div>
              <div className="text-gray-400">
                {a.cityName}, {a.countryName}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DateField({
  label,
  date,
  setDate,
}: {
  label: string;
  date: Date | null;
  setDate: (date: Date | null) => void;
}) {
  return (
    <div className="min-w-[160px] relative">
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
        <DatePicker
          selected={date}
          onChange={(d: Date | null) => setDate(d)}
          placeholderText={`Select ${label.toLowerCase()} date`}
          className="w-full h-12 pl-10 pr-4 rounded-lg bg-[rgba(22,10,45,0.5)] text-white"
          calendarClassName="bg-[rgba(22,10,45,0.8)] text-white"
          dayClassName={() => "text-white hover:bg-[#4202B4] rounded-full"}
        />
      </div>
    </div>
  );
}
