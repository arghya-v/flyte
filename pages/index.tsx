import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/searchbar';
import FlightCard from '@/components/flightcard';

export default function Home() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState<Date | null>(null); // <-- changed to Date | null
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [flightType, setFlightType] = useState('One-way');
  const [serviceClass, setServiceClass] = useState('Economy');
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchFlights = async () => {
    if (!origin || !destination || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFlights([]);

    try {
      // Convert date to YYYY-MM-DD string for API
      const formattedDate = date.toISOString().split('T')[0];

      const res = await fetch(
        `/api/searchFlights?origin=${origin}&destination=${destination}&date=${formattedDate}&adults=${adults}&children=${children}&infants=${infants}&flightType=${flightType}&serviceClass=${serviceClass}`
      );
      const data = await res.json();
      setFlights(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch flights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C041C] text-textPrimary font-inter flex flex-col items-center p-6">
      <h1 className="text-5xl font-bold mb-10 text-center text-primary">
        Flyte
      </h1>

      <SearchBar
        origin={origin}
        setOrigin={setOrigin}
        destination={destination}
        setDestination={setDestination}
        date={date}
        setDate={setDate}
        adults={adults}
        setAdults={setAdults}
        children={children}
        setChildren={setChildren}
        infants={infants}
        setInfants={setInfants}
        flightType={flightType}
        setFlightType={setFlightType}
        serviceClass={serviceClass}
        setServiceClass={setServiceClass}
        onSearch={searchFlights}
      />

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <motion.div
        className="mt-10 w-full max-w-4xl space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {flights.map((flight, idx) => (
          <FlightCard key={idx} flight={flight} />
        ))}
      </motion.div>

      {loading && <p className="mt-6 text-secondary">Loading flights...</p>}
    </div>
  );
}
