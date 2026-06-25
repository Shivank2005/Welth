"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Target, Trash2, Pencil, Check, X, TrendingUp, Landmark } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createGoal, updateGoal, deleteGoal } from "@/actions/goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function GoalsClient({ initialGoals, accounts = [] }) {
  const savingsAccounts = accounts.filter((acc) => acc.type === "SAVINGS");
  const selectableAccounts = savingsAccounts.length > 0 ? savingsAccounts : accounts;

  const [goals, setGoals] = useState(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New goal form state
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [accountId, setAccountId] = useState(selectableAccounts[0]?.id || "");

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!name || !target) return toast.error("Name and Target are required");
    
    setIsLoading(true);
    try {
      const res = await createGoal({
        name,
        target: parseFloat(target),
        saved: saved ? parseFloat(saved) : 0,
        accountId,
      });
      if (res.success) {
        // Find the full account name to append for the UI
        let account = null;
        if (accountId !== "UNLINKED") {
           account = accounts.find((a) => a.id === accountId);
        }
        setGoals([{ ...res.data, account }, ...goals]);
        setIsAdding(false);
        setName("");
        setTarget("");
        setSaved("");
        setAccountId(selectableAccounts[0]?.id || "");
        toast.success("Goal created!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
      toast.success("Goal deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Financial Goals</h2>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name (e.g., New Laptop, Vacation)</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency Fund" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Amount</Label>
                <Input id="target" type="number" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saved">Already Saved (Optional)</Label>
                <Input id="saved" type="number" step="0.01" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Link to Account</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2">
          <CardContent className="space-y-4">
            <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-1">
              <h3 className="text-lg font-medium">No goals yet</h3>
              <p className="text-muted-foreground">Start tracking your financial dreams today.</p>
            </div>
            <Button variant="outline" onClick={() => setIsAdding(true)}>Create your first goal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} onUpdate={(updatedGoal) => {
              setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onDelete, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const progress = Math.min(100, Math.max(0, (goal.saved / goal.target) * 100));

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!addAmount) return;
    try {
      const amount = parseFloat(addAmount);
      const res = await updateGoal(goal.id, { saved: goal.saved + amount });
      if (res.success) {
        onUpdate(res.data);
        setIsUpdating(false);
        setAddAmount("");
        toast.success("Progress updated!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{goal.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Target className="h-3 w-3" />
              Target: {formatCurrency(goal.target)}
            </CardDescription>
            {goal.account && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                <Landmark className="w-3 h-3" />
                {goal.account.name}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => onDelete(goal.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{formatCurrency(goal.saved)}</span>
              <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className={`h-2 ${progress >= 100 ? '[&>div]:bg-green-500' : '[&>div]:bg-violet-600'}`} />
          </div>
          
          {progress >= 100 ? (
            <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
              <Check className="h-4 w-4" /> Goal Achieved!
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              {formatCurrency(goal.target - goal.saved)} remaining
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {isUpdating ? (
          <form onSubmit={handleAddFunds} className="w-full flex gap-2">
            <Input 
              type="number" 
              step="0.01" 
              placeholder="+ Amount" 
              value={addAmount} 
              onChange={(e) => setAddAmount(e.target.value)} 
              className="h-8"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8 px-3">Add</Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsUpdating(false)}>
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setIsUpdating(true)} disabled={progress >= 100}>
            <TrendingUp className="h-4 w-4" /> Add Funds
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
