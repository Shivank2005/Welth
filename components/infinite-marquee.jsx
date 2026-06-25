"use client";

import { motion } from "framer-motion";
import { Landmark, CreditCard, Building2, Wallet, Building } from "lucide-react";

export default function InfiniteMarquee() {
  const logos = [
    { icon: Landmark, name: "State Bank" },
    { icon: Building2, name: "HDFC" },
    { icon: CreditCard, name: "Visa" },
    { icon: Wallet, name: "UPI" },
    { icon: Building, name: "ICICI" },
    { icon: Building2, name: "Axis" },
    { icon: CreditCard, name: "Mastercard" },
    { icon: Wallet, name: "PayTM" },
  ];

  return (
    <div className="relative flex overflow-hidden py-10 border-y border-gray-100 bg-gray-50/50">
      {/* Fade gradients */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-gray-50 to-transparent"></div>
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-gray-50 to-transparent"></div>
      
      <p className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-widest text-gray-400 z-20">Integrates Seamlessly With</p>

      <motion.div
        className="flex min-w-full items-center gap-16 mt-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {/* We map twice to ensure seamless loop */}
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-16 items-center shrink-0">
             {logos.map((logo, idx) => (
               <div key={`${i}-${idx}`} className="flex items-center gap-2 text-gray-400 opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 hover:text-blue-600 cursor-pointer">
                 <logo.icon className="h-7 w-7" />
                 <span className="text-2xl font-bold tracking-tight">{logo.name}</span>
               </div>
             ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
