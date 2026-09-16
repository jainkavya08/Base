"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { ArrowRightLeft } from "lucide-react";
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

export function AddTransferDialog() {
  const [open, setOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const { data } = useSWR('/api/finance/accounts.php', fetcher);
  const accounts = data?.accounts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromAccountId || !toAccountId || !amount || !date) {
      setError("Please fill all required fields.");
      return;
    }

    if (fromAccountId === toAccountId) {
      setError("Cannot transfer to the same account.");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      await fetchApi('/api/finance/transfers.php', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          fromAccountId,
          toAccountId,
          amount: transferAmount,
          date: new Date(date).toISOString(),
          description: description || undefined,
          createdAt: new Date().toISOString()
        })
      });

      // Update UI state
      mutate('/api/finance/transfers.php');
      mutate('/api/finance/accounts.php');
      mutate('/api/finance/transactions.php');
      
      setOpen(false);
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error("Failed to process transfer:", error);
      setError("Failed to add transfer. Please try again.");
    }
  };

  if (!accounts || accounts.length < 2) {
    // Need at least 2 accounts to make a transfer
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="rounded-full bg-surface-card border border-border/50 text-ink hover:bg-canvas" onClick={() => setOpen(true)}>
        <ArrowRightLeft className="w-4 h-4 md:mr-2" />
        <span className="hidden md:inline">Transfer</span>
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-accent-blue" /> Transfer Money
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          
          {error && (
            <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-ink-muted text-xs uppercase tracking-wider">From Account</Label>
            <Select value={fromAccountId} onValueChange={(val: any) => setFromAccountId(val)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select origin account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((a: any) => a.isActive).map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-ink-muted text-xs uppercase tracking-wider">To Account</Label>
            <Select value={toAccountId} onValueChange={(val: any) => setToAccountId(val)}>
              <SelectTrigger className="bg-canvas border-border text-ink">
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter((a: any) => a.isActive).map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                className="bg-canvas border-border text-ink text-xl"
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
            <Label htmlFor="description" className="text-ink-muted text-xs uppercase tracking-wider">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly savings transfer"
              className="bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-ink hover:bg-canvas">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-blue text-surface-dark hover:bg-accent-blue/90 font-medium">
              Complete Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
