"use client";

import { useState } from "react";
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

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState("");

  const { data } = useSWR('/api/finance/accounts.php', fetcher);
  const accounts = data?.accounts;

  // Default to first active account if none selected
  if (accounts && accounts.length > 0 && !accountId) {
    const defaultAcc = accounts.find((a: any) => a.isActive);
    if (defaultAcc) setAccountId(defaultAcc.id);
  }

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
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          type,
          amount: txAmount,
          category,
          accountId,
          date: new Date(date).toISOString(),
          title,
          createdAt: new Date().toISOString()
        })
      });

      // Update UI state
      mutate('/api/finance/transactions.php');
      mutate('/api/finance/accounts.php');
      
      setOpen(false);
      setAmount("");
      setTitle("");
      setCategory("");
      setNote("");
    } catch (error) {
      console.error("Failed to add transaction:", error);
      setError("Failed to add transaction. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="cta" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        Add Transaction
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-[#FDFAF4] border border-[#1A1A1A] rounded-[6px] shadow-[8px_8px_0px_0px_#1A1A1A] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">TRANSACTION</span>
          </div>
          <DialogTitle className="font-serif italic font-normal text-2xl text-[#1A1A1A]">New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          
          {error && (
            <div className="bg-[#FF4D00]/10 text-[#FF4D00] p-3 rounded-[4px] text-sm font-mono border border-[#FF4D00]/30">
              {error}
            </div>
          )}

          <div className="flex gap-2 bg-[#F5F0E8] p-1 rounded-[4px] border border-[#1A1A1A]">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-1.5 text-xs font-mono font-medium uppercase tracking-wider rounded-[3px] transition-all ${type === 'expense' ? 'bg-[#1A1A1A] text-[#FDFAF4] shadow-[1px_1px_0px_0px_#FF4D00]' : 'text-[#8A7F72] hover:text-[#1A1A1A]'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-1.5 text-xs font-mono font-medium uppercase tracking-wider rounded-[3px] transition-all ${type === 'income' ? 'bg-[#1A1A1A] text-[#FDFAF4] shadow-[1px_1px_0px_0px_#FFE14D]' : 'text-[#8A7F72] hover:text-[#1A1A1A]'}`}
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
          
          <div className="mt-4 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cta">
              Save Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
