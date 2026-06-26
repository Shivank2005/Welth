"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/format";
import AnimatedCounter from "@/components/animated-counter";
import { TrendingUp, Wallet, Clock, Sparkles } from "lucide-react";

export default function SavingsCalculator() {
  const [income, setIncome] = useState(185000);
  
  // Logic based on the screenshot: 
  // Savings seems to be around 21.6% (185000 * 12 * 0.216 = ~479520, screenshot says 399600 for 185k/mo -> 185k * 12 = 2.22M. 399600 / 2.22M = 18%. 
  // Ah, the screenshot says "That's 21.6% of your annual income" for 399,600. 
  // 185,000 * 12 = 2,220,000. 2,220,000 * 0.18 = 399,600. So the multiplier is 18%. 
  const annualIncome = income * 12;
  const estimatedSavings = annualIncome * 0.18;
  const savingsPercentage = 18; // Fixed for this calculation

  return (
    <div className="w-full rounded-[2rem] border border-gray-100 bg-white p-8 sm:p-12 shadow-sm dark:border-gray-800 dark:bg-slate-950">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <TrendingUp className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Calculate your potential savings
          </h2>
          <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Our AI analyzes spending patterns to uncover hidden savings.<br className="hidden sm:block" /> See what you could save.
          </p>
        </div>
      </div>

      {/* Slider Section */}
      <div className="mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <label className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Monthly Income
          </label>
          <div className="flex flex-col items-end">
            <span className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(income, "INR")}
            </span>
            {income > 100000 && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                Above average
              </div>
            )}
          </div>
        </div>
        
        <div className="relative px-2">
          <Slider
            defaultValue={[185000]}
            max={500000}
            min={25000}
            step={5000}
            onValueChange={(val) => setIncome(val[0])}
            className="w-full cursor-grab active:cursor-grabbing [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-blue-500 [&_[role=slider]]:bg-white [&>.relative>.absolute]:bg-blue-500"
          />
          
          <div className="mt-4 flex justify-between text-sm font-medium text-slate-400">
            <span>₹25K</span>
            <span>₹1L</span>
            <span>₹2L</span>
            <span>₹3L</span>
            <span>₹5L+</span>
          </div>
        </div>
        
        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Drag the slider to adjust your monthly income
        </p>
      </div>

      {/* Results Section */}
      <div className="mt-12 rounded-[2rem] bg-slate-50 p-8 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
          
          {/* Estimated Yearly Savings */}
          <div className="flex-1 flex flex-col items-center md:items-start md:pr-12 md:border-r border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Wallet className="h-10 w-10" />
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Estimated Yearly Savings
                </p>
                <div className="mt-1 flex items-baseline text-5xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  <span className="text-4xl mr-1">₹</span>
                  <AnimatedCounter targetValue={estimatedSavings} />
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  That&apos;s {savingsPercentage}% of your annual income
                </div>
              </div>
            </div>
          </div>

          {/* Time Saved */}
          <div className="flex-1 flex flex-col items-center md:items-start md:pl-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Clock className="h-10 w-10" />
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Time Saved (Hours/Year)
                </p>
                <div className="mt-1 text-6xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
                  <AnimatedCounter targetValue={120} />
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <Sparkles className="h-4 w-4" />
                  5 days of your life back
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
