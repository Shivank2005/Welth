"use client";

import { motion } from "framer-motion";
import { BellRing, TrendingUp, PieChart } from "lucide-react";

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 hidden lg:block">
      {/* Floating Alert Pill */}
      <motion.div
        className="absolute top-[15%] left-[8%] bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl shadow-blue-500/5 rounded-2xl p-4 flex items-center gap-3"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-red-100 text-red-600 p-2 rounded-full">
          <BellRing className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">Budget Alert</p>
          <p className="text-[10px] text-gray-500">Dining crossed 80%</p>
        </div>
      </motion.div>

      {/* Floating Chart Widget */}
      <motion.div
        className="absolute top-[35%] right-[5%] bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl shadow-blue-500/5 rounded-2xl p-4 w-48"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-gray-900">Weekly Savings</p>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <p className="text-xl font-extrabold text-gray-900">₹14,500</p>
        <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
           <div className="h-full bg-green-500 w-[70%]" />
        </div>
      </motion.div>

      {/* Floating Portfolio Pill */}
      <motion.div
        className="absolute bottom-[35%] left-[12%] bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl shadow-blue-500/5 rounded-2xl p-3 flex items-center gap-3"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
          <PieChart className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">Net Worth</p>
          <p className="text-[10px] text-green-600 font-bold">+12% this month</p>
        </div>
      </motion.div>
    </div>
  );
}
