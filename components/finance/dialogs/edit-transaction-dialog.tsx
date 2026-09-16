"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { Plus } from "lucide-react";
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

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange
}: {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = useState<"income" | "expense">(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [title, setTitle] = useState(transaction.title || "");
  const [category, setCategory] = useState(transaction.category || "");
  const [note, setNote] = useState(transaction.notes || "");
  const [date, setDate] = useState(() => {
    try {
      return new Date(transaction.date).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const [error, setError] = useState("");

  const { data } = useSWR('/api/finance/accounts.php', fetcher);
  const accounts: any[] = data?.accounts || [];

  useEffect(() => {
    if (open) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setAccountId(transaction.accountId);
      setTitle(transaction.title || "");
      setCategory(transaction.category || "");
      setNote(transaction.notes || "");
      try {
        setDate(new Date(transaction.date).toISOString().split('T')[0]);
      } catch {
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [open, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || !category || !date || !accountId || !title) {
      setError("Please fill all required fields.");
      return;
    }

    const txAmount = parseFloat(amount);
    if (isNaN(txAmount) || txAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      await fetchApi('/api/finance/transactions.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: transaction.id,
          type,
          amount: txAmount,
          category,
          accountId,
          date: new Date(date).toISOString(),
          title,
          notes: note || undefined,
        })
      });

      // Update UI state
      mutate('/api/finance/transactions.php');
      mutate('/api/finance/accounts.php');
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      setError("Failed to update transaction. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink">Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          
          {error && (
            <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
            <Label className="text-ink-muted text-xs uppercase tracking-wider">Account</Label>
            <Select value={accountId} onValueChange={(val: any) => setAccountId(val)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.filter((a: any) => a.isActive).map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              className="bg-canvas border-border text-ink text-xl"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-ink-muted text-xs uppercase tracking-wider">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'income' ? "e.g. Salary" : "e.g. Groceries"}
              className="bg-canvas border-border text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-ink-muted text-xs uppercase tracking-wider">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Food"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-ink-muted text-xs uppercase tracking-wider">Date</Label>
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
            <Label htmlFor="note" className="text-ink-muted text-xs uppercase tracking-wider">Notes (Optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief description"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-ink hover:bg-canvas">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-yellow text-white hover:bg-accent-yellow/90 font-medium">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
