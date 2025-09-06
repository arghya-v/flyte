<img width="1584" height="396" alt="flyte banner (2)" src="https://github.com/user-attachments/assets/705d6ecf-9491-4180-b600-baf0da432145" />

<p>A modern, responsive flight search engine built with <strong>Next.js</strong>, <strong>TypeScript</strong>, and <strong>React</strong>, featuring real-time flight data, dynamic currency conversion, airport information, and amenities display.</p>

<h2>Table of Contents</h2>
<ul>
  <li><a href="#features">Features</a></li>
  <li><a href="#tech-stack">Tech Stack</a></li>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#environment-variables">Environment Variables</a></li>
  <li><a href="#usage">Usage</a></li>
  <li><a href="#api-integration">API Integration</a></li>
  <li><a href="#future-improvements">Future Improvements</a></li>
  <li><a href="#ai-assistance">AI Assistance</a></li>
  <li><a href="#license">License</a></li>
  
</ul>

<h2 id="features">Features</h2>
<ul>
  <li>Flight Search by departure/arrival airports, dates, and passengers</li>
  <li>Flight Distance Counter</li>
  <li>Real-time Flight Data using <strong>Amadeus API</strong></li>
  <li>Dynamic Currency Conversion (USD, CAD, EUR, GBP, INR, JPY)</li>
  <li>Airport Information: name, city, and coordinates</li>
  <li>Flight Amenities: WiFi, power outlets, TVs, legroom info</li>
  <li>Smooth animations with <strong>Framer Motion</strong></li>
  <li>Responsive design for desktop</li>
  <li><strong>REAL</strong> YouTube review videos on airlines</li>
  <li>Flight booking systems through <strong>KAYAK and Skyscanner</strong></li>
</ul>

<h2 id="tech-stack">Tech Stack</h2>
<ul>
  <li>
    Frontend: 
    <br></br>
    <img src="https://skillicons.dev/icons?i=react" width="60" alt="React" />
    <img src="https://skillicons.dev/icons?i=nextjs" width="60" alt="Next.js" />
    <img src="https://skillicons.dev/icons?i=ts" width="60" alt="TypeScript" />
  </li>
  <li>
    Styling: 
    <br></br>
    <img src="https://skillicons.dev/icons?i=tailwind" width="60" alt="TailwindCSS" />
    <img src="https://skillicons.dev/icons?i=framer" width="60" alt="Framer Motion" />
  </li>
  <li>
    API: 
    Amadeus Flight APIs, YouTube APIs, ExchangeRate APIs, etc.
    <br></br>
    <img src="https://skillicons.dev/icons?i=nodejs" width="60" alt="Node.js (API Layer)" />
    <img src="https://skillicons.dev/icons?i=ts" width="60" alt="TypeScript" />
  <img src="https://skillicons.dev/icons?i=gcp" width="60" alt="TypeScript" />
  </li>
  <li>
    Data: Custom datasets for aircraft & airports
    <br></br>
    <img src="https://eu-images.contentstack.com/v3/assets/blt8f94ebff857fe1ae/blt38b2ab4ea0da2357/6242e8d49eb79b7d7303c4bd/json-editor.svg" width="60" alt="JSON" /> 
  </li>
  <li>
    Deployment: 
    <br></br>
    <img src="https://skillicons.dev/icons?i=vercel" width="60" alt="Vercel" />
  </li>
</ul>

<h2 id="installation">Installation</h2>
<pre>
git clone https://github.com/arghya-v/flyte.git
cd flyte
npm install
npm run dev
</pre>
<p>Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser.</p>

<h2 id="environment-variables">Environment Variables</h2>
<pre>
NEXT_PUBLIC_AMADEUS_CLIENT_ID=your_client_id
NEXT_PUBLIC_AMADEUS_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_EXCHANGE_API_KEY=your_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here
</pre>
<p>Use Amadeus sandbox credentials for testing and playing around; production credentials are required for real flight data.</p>

<h2 id="usage">Usage</h2>
<ul>
  <li>Select departure and arrival airports</li>
  <li>Choose travel dates and number of passengers</li>
  <li>Click <strong>Search Flights</strong> to retrieve available flights</li>
  <li>View flight amenities, aircraft info</li>
  <li>Switch currencies dynamically to view price conversions</li>
  <li>Flight Route Map</li>
</ul>

<h2 id="api-integration">API Integration</h2>
<ul>
  <li>Amadeus Flight Offers API: Fetch available flights</li>
  <li>Custom Airport Lookup: name, city, coordinates from JSON</li>
  <li>Aircraft Lookup: Map aircraft codes to readable names</li>
  <li>Exchange Rate API: Used for converting currency</li>
  <li>Youtube Data API (v3): Fetch Review videos based on search query</li>
  
</ul>
<p>Note: <strong>API calls are rate-limited.</strong</p>

<h2 id="future-improvements">Future Improvements</h2>
<ul>
  <li>Multi-city flight search</li>
  <li>Better caching of API data to reduce requests and rate-limits</li>
  <li>Better front-end UX/UI past the "Learn More" button</li>
  <li>Price alerts for users</li>
  <li>CO2 emissions</li>
  <li>Airplane Images</li>
  <li>Improved UI for mobile</li>
  
</ul>

<h2 id="ai-assistance">AI Assistance</h2>
<p>This project leverages <strong>AI tools</strong> to help streamline development, including:</p>
<ul>
  <li>Researching and identifying suitable flight-related APIs, such as Amadeus, for flight offers, seat maps, and amenities.</li>
  <li>Generating and debugging base code for components, utility functions, and pages.</li>
  <li>Optimizing project structure and suggesting best practices for TypeScript and Next.js integration.</li>
  <li>Providing guidance on UI/UX implementation, including smooth animations and responsive layouts.</li>
</ul>
<p>AI assistance helped speed up simple and basic development while allowing me to focus on feature design, testing, customization, and advanced development.</p>

<h2 id="license">License</h2>
<p>This project is licensed under the MIT License.</p>

</body>
</html>
