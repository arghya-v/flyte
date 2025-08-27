<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Search Engine - README</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 2rem;
      color: #333;
    }
    h1, h2, h3, h4 {
      color: #111;
    }
    pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
    }
    ul {
      margin-bottom: 1rem;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>

<h1>Flight Search Engine</h1>
<p>A modern, responsive flight search engine built with <strong>Next.js</strong>, <strong>TypeScript</strong>, and <strong>React</strong>, featuring real-time flight data, dynamic currency conversion, airport information, and amenities display.</p>

<h2>Table of Contents</h2>
<ul>
  <li><a href="#features">Features</a></li>
  <li><a href="#tech-stack">Tech Stack</a></li>
  <li><a href="#project-structure">Project Structure</a></li>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#environment-variables">Environment Variables</a></li>
  <li><a href="#usage">Usage</a></li>
  <li><a href="#api-integration">API Integration</a></li>
  <li><a href="#components">Components</a></li>
  <li><a href="#future-improvements">Future Improvements</a></li>
  <li><a href="#license">License</a></li>
</ul>

<h2 id="features">Features</h2>
<ul>
  <li>Flight Search by departure/arrival airports, dates, and passengers</li>
  <li>Real-time Flight Data using <strong>Amadeus API</strong></li>
  <li>Dynamic Currency Conversion (USD, CAD, EUR, GBP, INR, JPY)</li>
  <li>Airport Information: name, city, and coordinates</li>
  <li>Flight Amenities: WiFi, power outlets, TVs, legroom info</li>
  <li>Seat Maps showing availability</li>
  <li>Smooth animations with <strong>Framer Motion</strong></li>
  <li>Responsive design for desktop and mobile</li>
  <li>Interactive modals for flight details or impact stories</li>
</ul>

<h2 id="tech-stack">Tech Stack</h2>
<ul>
  <li>Frontend: React, Next.js, TypeScript</li>
  <li>Styling: Tailwind CSS, Lucide-react icons, Framer Motion</li>
  <li>API: Amadeus Flight APIs (search, seat map, amenities)</li>
  <li>Data: Custom JSON datasets for aircraft and airports</li>
  <li>Deployment: Vercel</li>
</ul>

<h2 id="project-structure">Project Structure</h2>
<pre>
/flight-search-engine
├─ /components
│  ├─ FlightCard.tsx
│  ├─ CurrencySelector.tsx
│  ├─ ProfileCard.tsx
│  ├─ AboutParagraph.tsx
│  └─ Modal.tsx
├─ /pages
│  ├─ index.tsx
│  ├─ search.tsx
│  └─ _app.tsx
├─ /utils
│  ├─ airportLookup.ts
│  ├─ currencyConversion.ts
│  └─ flightHelpers.ts
├─ /data
│  ├─ aircraft.json
│  └─ airports.json
├─ /styles
│  └─ globals.css
├─ next.config.js
└─ package.json
</pre>

<h2 id="installation">Installation</h2>
<pre>
git clone https://github.com/yourusername/flight-search-engine.git
cd flight-search-engine
npm install
npm run dev
</pre>
<p>Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser.</p>

<h2 id="environment-variables">Environment Variables</h2>
<pre>
NEXT_PUBLIC_AMADEUS_CLIENT_ID=your_client_id
NEXT_PUBLIC_AMADEUS_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
</pre>
<p>Use Amadeus sandbox credentials for testing; production credentials are required for real flight data.</p>

<h2 id="usage">Usage</h2>
<ul>
  <li>Select departure and arrival airports</li>
  <li>Choose travel dates and number of passengers</li>
  <li>Click <strong>Search Flights</strong> to retrieve available flights</li>
  <li>View flight amenities, aircraft info, and seat maps</li>
  <li>Switch currencies dynamically to view price conversions</li>
</ul>

<h2 id="api-integration">API Integration</h2>
<ul>
  <li>Amadeus Flight Offers API: Fetch available flights</li>
  <li>Amadeus Seat Map API: Display seat availability</li>
  <li>Custom Airport Lookup: name, city, coordinates from JSON</li>
  <li>Aircraft Lookup: Map aircraft codes to readable names</li>
</ul>
<p>Ensure credentials and environment variables are set correctly. API calls are rate-limited.</p>

<h2 id="components">Components</h2>
<ul>
  <li><strong>FlightCard</strong>: Displays flight details, duration, and layover info</li>
  <li><strong>CurrencySelector</strong>: Allows users to select currency for price conversion</li>
  <li><strong>Modal</strong>: Reusable modal for flight details or impact stories</li>
  <li><strong>ProfileCard & AboutParagraph</strong>: Reusable components for user profiles or content</li>
</ul>

<h2 id="future-improvements">Future Improvements</h2>
<ul>
  <li>Multi-city flight search</li>
  <li>Better caching of API data to reduce requests</li>
  <li>Interactive seat maps with seat selection</li>
  <li>Price alerts for users</li>
  <li>Integration with payment systems for bookings</li>
</ul>

<h2 id="license">License</h2>
<p>This project is licensed under the MIT License.</p>

</body>
</html>
