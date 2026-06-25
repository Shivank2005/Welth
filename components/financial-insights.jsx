import { Suspense } from "react";
import { getFinancialHealth, getSpendingPrediction } from "@/actions/insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { HeartPulse, Brain, Sparkles, TrendingUp, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Minus, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }) {
  const variants = {
    Excellent: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    Good: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
    Average: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    "Needs Work": "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
  };
  const classes = variants[status] || variants["Average"];
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${classes}`}>
      {status}
    </span>
  );
}

// SVG Gauge Component for Health Score
function ScoreGauge({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = "text-rose-500";
  if (score >= 80) color = "text-emerald-500";
  else if (score >= 60) color = "text-blue-500";
  else if (score >= 40) color = "text-amber-500";

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-slate-100 dark:text-slate-800"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className={`${color} transition-all duration-1000 ease-out drop-shadow-sm`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tracking-tighter ${color}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Score</span>
      </div>
    </div>
  );
}

async function HealthScore({ accountId }) {
  let health;
  try {
    health = await getFinancialHealth(accountId);
  } catch (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Unable to calculate health score right now.</p>
        </CardContent>
      </Card>
    );
  }

  const { score, metrics } = health;

  return (
    <Card className="h-full relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-rose-500" />
          Financial Health
        </CardTitle>
        <CardDescription>Your overall financial well-being</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <ScoreGauge score={score} />
          </div>
          
          <div className="space-y-4 flex-1 w-full md:border-l md:pl-6 border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">Savings Rate</span>
              </div>
              <StatusBadge status={metrics.savingsRate.status} />
            </div>
            
            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-medium text-foreground">Debt Ratio</span>
              </div>
              <StatusBadge status={metrics.debtRatio.status} />
            </div>
            
            <div className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">Emergency Fund</span>
              </div>
              <StatusBadge status={metrics.emergencyFund.status} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function Predictor({ accountId }) {
  let prediction;
  try {
    prediction = await getSpendingPrediction(accountId);
  } catch (error) {
    return (
      <Card className="h-full bg-slate-900 border-0 text-white">
        <CardHeader>
          <CardTitle>AI Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">AI prediction is currently unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-950 border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm group">
      {/* Subtle animated background elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-all duration-700" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-indigo-500" />
          AI Spending Prediction
        </CardTitle>
        <CardDescription className="text-muted-foreground">Forecast for the next 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">Expected Expenses</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-foreground drop-shadow-sm">
                {formatCurrency(prediction.predictedAmount, prediction.baseCurrency)}
              </span>
              {prediction.insight?.trend === "up" && <ArrowUpRight className="h-5 w-5 text-rose-500" />}
              {prediction.insight?.trend === "down" && <ArrowDownRight className="h-5 w-5 text-emerald-500" />}
              {prediction.insight?.trend === "stable" && <Minus className="h-5 w-5 text-slate-400" />}
            </div>
          </div>
        </div>

        <div className="relative space-y-4">
          {/* Soft Reasoning Box */}
          <div className="relative bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-xl shadow-sm transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full shrink-0">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">AI Analysis</h4>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm leading-relaxed">
                  {prediction.insight?.reasoning || "Analyzing your recent transaction patterns."}
                </p>
              </div>
            </div>
          </div>

          {/* Soft Advice Box */}
          <div className="relative bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-xl shadow-sm transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-full shrink-0">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Recommendation</h4>
                <p className="text-emerald-800/80 dark:text-emerald-300/80 text-sm leading-relaxed">
                  {prediction.insight?.advice || "Keep tracking your expenses to stay on budget."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialInsights({ accountId }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Suspense fallback={<Card className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />}>
        <HealthScore accountId={accountId} />
      </Suspense>
      <Suspense fallback={<Card className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />}>
        <Predictor accountId={accountId} />
      </Suspense>
    </div>
  );
}
