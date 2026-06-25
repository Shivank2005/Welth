"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDefaultAccountBudget } from "@/actions/budget";

export default function MonthlyAccountBudget({ totalIncome, totalExpense, customLimit = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const spent = totalExpense || 0;
  const limit = customLimit > 0 ? customLimit : (totalIncome || 0);
  const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  
  let colorClass = "bg-emerald-500";
  let textColorClass = "text-emerald-500";
  if (progress > 75) {
    colorClass = "bg-red-500";
    textColorClass = "text-red-500";
  } else if (progress > 50) {
    colorClass = "bg-yellow-500";
    textColorClass = "text-yellow-500";
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const val = parseFloat(editValue);
      await updateDefaultAccountBudget(isNaN(val) ? 0 : val);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Income vs Expense
              </p>
              <div className="flex items-center gap-2 mt-1 h-7">
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(spent)} of
                </span>
                
                {isEditing ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-muted-foreground text-xs font-medium">$</span>
                      <Input 
                        type="number" 
                        className="h-7 w-[100px] pl-5 pr-2 py-0 text-xs font-bold border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-emerald-500/50 bg-slate-50/50 dark:bg-slate-900/50" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={limit.toString()}
                        autoFocus
                        disabled={isSaving}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave();
                          if (e.key === 'Escape') setIsEditing(false);
                        }}
                      />
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
                      <Button size="icon" variant="ghost" className="h-6 w-6 rounded-sm hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30" onClick={handleSave} disabled={isSaving}>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 rounded-sm hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center animate-in fade-in duration-200">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(limit)} spent
                    </span>
                    <button 
                      className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-1.5"
                      onClick={() => {
                        setEditValue(customLimit > 0 ? customLimit.toString() : "");
                        setIsEditing(true);
                      }}
                      title="Edit Budget Limit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Progress 
              value={progress} 
              className="h-2" 
              indicatorClassName={colorClass}
            />
            <div className="flex justify-end">
              <span className={`text-xs font-medium ${textColorClass}`}>
                {progress.toFixed(1)}% used
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
