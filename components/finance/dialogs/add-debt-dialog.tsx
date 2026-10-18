"use client";

import { useState } from "react";
import { mutate } from "swr";
import { fetchApi } from "@/lib/api";
import { Plus, HandCoins } from "lucide-react";
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

export function AddDebtDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"owed_by_you" | "owed_to_you">("owed_by_you");
  const [personOrOrganization, setPersonOrOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !personOrOrganization || !originalAmount || !remainingAmount) {
      setError("Please fill all required fields.");
      return;
    }

    const origAmt = parseFloat(originalAmount);
    const remAmt = parseFloat(remainingAmount);
    
    if (isNaN(origAmt) || isNaN(remAmt) || origAmt <= 0 || remAmt < 0 || remAmt > origAmt) {
      setError("Please enter valid amounts.");
      return;
    }

    const now = new Date().toISOString();

    try {
      await fetchApi('/api/finance/debts.php', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          type,
          personOrOrganization,
          title,
          originalAmount: origAmt,
          remainingAmount: remAmt,
          dueDate: dueDate || undefined,
          status: remAmt === 0 ? "paid" : "outstanding",
          notes: notes || undefined,
          createdAt: now,
          updatedAt: now,
        }),
      });

      mutate('/api/finance/debts.php');
      
      setOpen(false);
      // Reset form
      setTitle("");
      setPersonOrOrganization("");
      setOriginalAmount("");
      setRemainingAmount("");
      setDueDate("");
      setNotes("");
    } catch (err) {
      setError("Failed to add debt. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        Add Debt
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-[#FDFAF4] border border-[#1A1A1A] rounded-[6px] shadow-[8px_8px_0px_0px_#1A1A1A] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">LIABILITY</span>
          </div>
          <DialogTitle className="font-serif italic font-normal text-2xl text-[#1A1A1A] flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-[#FF4D00]" /> Add Debt Record
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          
          {error && (
            <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-2 bg-canvas p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType("owed_by_you")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'owed_by_you' ? 'bg-surface-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              I Owe Money
            </button>
            <button
              type="button"
              onClick={() => setType("owed_to_you")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'owed_to_you' ? 'bg-surface-card text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              Money Owed to Me
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-ink-muted text-xs uppercase tracking-wider">Title / Reason</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Car Loan"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="person" className="text-ink-muted text-xs uppercase tracking-wider">{type === 'owed_by_you' ? 'Lender / Bank' : 'Borrower'}</Label>
              <Input
                id="person"
                value={personOrOrganization}
                onChange={(e) => setPersonOrOrganization(e.target.value)}
                placeholder={type === 'owed_by_you' ? "e.g. HDFC Bank" : "e.g. John Doe"}
                className="bg-canvas border-border text-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="originalAmount" className="text-ink-muted text-xs uppercase tracking-wider">Original Amount (₹)</Label>
              <Input
                id="originalAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={originalAmount}
                onChange={(e) => {
                  setOriginalAmount(e.target.value);
                  if (!remainingAmount) setRemainingAmount(e.target.value);
                }}
                placeholder="0.00"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="remainingAmount" className="text-ink-muted text-xs uppercase tracking-wider">Remaining (₹)</Label>
              <Input
                id="remainingAmount"
                type="number"
                step="0.01"
                min="0"
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                placeholder="0.00"
                className="bg-canvas border-border text-ink text-xl"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate" className="text-ink-muted text-xs uppercase tracking-wider">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-canvas border-border text-ink"
            />
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

          <div className="mt-4 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cta">
              Save Debt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
