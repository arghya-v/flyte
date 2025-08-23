import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="relative flex items-center gap-3 px-6 py-3 rounded-2xl 
                    backdrop-blur-md bg-[#0E0A27]/30 border border-white/20 
                    shadow-lg">
      {/* Glow layer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-700/20 to-blue-800/20 blur-xl -z-10" />

      {/* Spinner */}
      <motion.div
        className="relative w-7 h-7 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        {/* Base circle */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 18 18"
          fill="none"
        >
          <circle
            cx="9"
            cy="9"
            r="7.5"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
          />
        </svg>

        {/* Highlight stroke */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M16.25 9C16.25 10.07 16.018 11.086 15.602 12C15.163 12.965 14.518 13.817 13.724 14.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Loading text */}
      <p className="text-sm font-medium text-white drop-shadow">
        Loading Flights...
      </p>
    </div>
  );
};

export default LoadingSpinner;
