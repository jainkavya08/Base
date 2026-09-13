"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
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

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    
    await db.financeTransactions.add({
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      category,
      date,
      note: note || undefined,
      createdAt: new Date().toISOString(),
    });
    
    setOpen(false);
    setAmount("");
    setCategory("");
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
          <Plus className="w-5 h-5 mr-1" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex gap-4 mb-2 bg-canvas p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-surface-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-surface-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              Income
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-ink-muted">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-canvas border-border text-ink text-xl"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-ink-muted">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Groceries"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-ink-muted">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-canvas border-border text-ink"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note" className="text-ink-muted">Note (Optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief description"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90">
              Save Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
