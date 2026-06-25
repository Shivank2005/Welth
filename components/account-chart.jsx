"use client";

import { useState, useEffect } from "react";
import { getTransactionOverview } from "@/actions/transaction";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Loader2, Lock, Unlock } from "lucide-react";

export default function AccountChart({ accountId, currency = "USD", balance = 0, available = 0, reserved = 0 }) {
  const [dateRange, setDateRange] = useState("6M");
  const [data, setData] = useState({ totals: null, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const overview = await getTransactionOverview({ accountId, dateRange });
        setData(overview);
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (accountId) {
      fetchData();
    }
  }, [accountId, dateRange]);

  const { totals, chartData } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-md">
          <p className="text-sm font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm flex items-center justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium">
                  {formatCurrency(entry.value, currency)}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-medium">Transaction Overview</CardTitle>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7D">Last 7 Days</SelectItem>
            <SelectItem value="1M">Last Month</SelectItem>
            <SelectItem value="3M">Last 3 Months</SelectItem>
            <SelectItem value="6M">Last 6 Months</SelectItem>
            <SelectItem value="ALL">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {formatCurrency(totals?.income || 0, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-500">
                  {formatCurrency(totals?.expense || 0, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {reserved > 0 ? "Available Balance" : "Total Balance"}
                </p>
                <p className="text-2xl font-bold text-emerald-500">
                  {formatCurrency(reserved > 0 ? available : balance, currency)}
                </p>
                {reserved > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-violet-600 dark:text-violet-400 font-medium">
                    <Lock className="w-3 h-3" /> {formatCurrency(reserved, currency)} Reserved
                  </div>
                )}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No transactions found for this period.
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888888", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888888", fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                    <Legend 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
