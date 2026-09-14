"use client";

import { useState } from "react";
import { Plus, Repeat } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";

export function AddRecurringDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("Subscriptions");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const accounts = useLiveQuery(() => db.bankAccounts.toArray());

  // Default to first active account if none selected
  if (accounts && accounts.length > 0 && !accountId) {
    const defaultAcc = accounts.find(a => a.isActive);
    if (defaultAcc) setAccountId(defaultAcc.id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !amount || !accountId || !categoryId || !startDate) {
      setError("Please fill all required fields.");
      return;
    }

    const subAmount = parseFloat(amount);
    if (isNaN(subAmount) || subAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const now = new Date().toISOString();

    await db.recurringPayments.add({
      id: crypto.randomUUID(),
      name,
      accountId,
      amount: subAmount,
      categoryId,
      frequency,
      startDate,
      nextDueDate: startDate, // Set next due date to start date initially
      isActive: true,
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    });
    
    setOpen(false);
    // Reset form
    setName("");
    setAmount("");
    setCategoryId("Subscriptions");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="rounded-full bg-surface-card border border-border/50 text-ink hover:bg-canvas" onClick={() => setOpen(true)}>
        <Plus className="w-5 h-5 mr-1" />
        Add Recurring
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink flex items-center gap-2">
            <Repeat className="w-5 h-5 text-accent-coral" /> New Recurring Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          
          {error && (
            <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-ink-muted text-xs uppercase tracking-wider">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix Subscription"
              className="bg-canvas border-border text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount" className="text-ink-muted text-xs uppercase tracking-wider">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-ink-muted text-xs uppercase tracking-wider">Frequency</Label>
              <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                <SelectTrigger className="bg-canvas border-border text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-ink-muted text-xs uppercase tracking-wider">Account</Label>
            <Select value={accountId} onValueChange={(val: any) => setAccountId(val)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.filter(a => a.isActive).map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-ink-muted text-xs uppercase tracking-wider">Category</Label>
              <Input
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="e.g. Subscriptions"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate" className="text-ink-muted text-xs uppercase tracking-wider">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-canvas border-border text-ink"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="text-ink-muted text-xs uppercase tracking-wider">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief description"
              className="bg-canvas border-border text-ink"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-ink hover:bg-canvas">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-coral text-surface-dark hover:bg-accent-coral/90 font-medium">
              Save Recurring
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
