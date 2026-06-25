"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts";

const CATEGORY_COLORS = {
  HOUSING: "#3b82f6", // blue-500
  FOOD: "#f59e0b", // amber-500
  TRANSPORT: "#a855f7", // purple-500
  ENTERTAINMENT: "#ec4899", // pink-500
  HEALTH: "#10b981", // emerald-500
  EDUCATION: "#6366f1", // indigo-500
  SHOPPING: "#f43f5e", // rose-500
  UTILITIES: "#06b6d4", // cyan-500
  SALARY: "#14b8a6", // teal-500
  FREELANCE: "#84cc16", // lime-500
  INVESTMENT: "#0ea5e9", // sky-500
  GIFT: "#8b5cf6", // violet-500
  OTHER: "#64748b", // slate-500
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border dark:border-slate-800 shadow-lg rounded-lg p-3 text-xs flex flex-col gap-1.5 min-w-[150px]">
        <div className="font-bold text-foreground border-b dark:border-slate-800 pb-1 text-center">{label}</div>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between gap-4 font-medium" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span>{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border dark:border-slate-800 shadow-lg rounded-lg p-3 text-xs flex flex-col gap-1.5">
        <div className="font-bold text-foreground flex items-center justify-between gap-4">
          <span className="capitalize">{payload[0].name.toLowerCase()}</span>
          <span>{formatCurrency(payload[0].value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ transactions }) {
  // 1. Process Monthly Trend Data (Income vs Expense)
  const monthlyData = useMemo(() => {
    const dataMap = {};
    const sortedTxs = [...transactions].reverse();
    
    sortedTxs.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short", year: "2-digit" });
      
      if (!dataMap[monthKey]) {
        dataMap[monthKey] = {
          monthKey,
          name: monthName,
          Income: 0,
          Expense: 0,
        };
      }
      
      if (tx.type === "INCOME") {
        dataMap[monthKey].Income += tx.amount;
      } else {
        dataMap[monthKey].Expense += tx.amount;
      }
    });

    return Object.values(dataMap).slice(-6);
  }, [transactions]);

  // 2. Process Category Breakdown for Expenses
  const categoryData = useMemo(() => {
    const dataMap = {};
    transactions.forEach((tx) => {
      if (tx.type === "EXPENSE") {
        const cat = tx.category;
        dataMap[cat] = (dataMap[cat] || 0) + tx.amount;
      }
    });

    return Object.entries(dataMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Monthly Trend Chart Card */}
      <Card className="md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <TrendingUp className="h-8 w-8 opacity-40" />
              <p>Add some transactions to see trends</p>
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} className="fill-muted-foreground" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", className: "opacity-[0.03]" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown Pie Chart Card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Spending Breakdown
          </CardTitle>
          <CardDescription>Expenses grouped by category</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2 h-full">
              <PieChart className="h-8 w-8 opacity-40" />
              <p>No expense data logged</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="var(--background)"
                    strokeWidth={2}
                    labelLine={true}
                    label={({ name, value, cx, x, y }) => (
                      <text x={x} y={y} fill={CATEGORY_COLORS[name] || CATEGORY_COLORS.OTHER} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${name.toLowerCase()}: ${formatCurrency(value)}`}
                      </text>
                    )}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.OTHER} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
