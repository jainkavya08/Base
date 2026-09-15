"use client";

import { useState } from "react";
import { mutate } from "swr";
import { fetchApi } from "@/lib/api";
import { Plus, TrendingUp } from "lucide-react";
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

export function AddInvestmentDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Stock");
  const [platform, setPlatform] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !investedAmount || !currentValue) {
      setError("Please fill all required fields.");
      return;
    }

    const invAmount = parseFloat(investedAmount);
    const currVal = parseFloat(currentValue);
    
    const curValue = parseFloat(currentValue);
    
    if (isNaN(invAmount) || isNaN(curValue)) {
      setError("Please enter valid amounts.");
      return;
    }

    const now = new Date().toISOString();
    try {
      await fetchApi('/api/finance/investments.php', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          name,
          type,
          investedAmount: invAmount,
          currentValue: curValue,
          createdAt: new Date().toISOString()
        })
      });

      mutate('/api/finance/investments.php');
      
      setOpen(false);
      setName("");
      setInvestedAmount("");
      setCurrentValue("");
    } catch (err) {
      setError("Failed to add investment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="rounded-full bg-surface-card border border-border/50 text-ink hover:bg-canvas" onClick={() => setOpen(true)}>
        <Plus className="w-5 h-5 mr-1" />
        Add Investment
      </Button>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-green" /> Add Investment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          
          {error && (
            <div className="bg-accent-coral/10 text-accent-coral p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-ink-muted text-xs uppercase tracking-wider">Asset Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nifty 50 Index"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-ink-muted text-xs uppercase tracking-wider">Asset Type</Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="bg-canvas border-border text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock">Stock / Equity</SelectItem>
                  <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                  <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                  <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Gold">Gold / Precious Metals</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="investedAmount" className="text-ink-muted text-xs uppercase tracking-wider">Invested Amount (₹)</Label>
              <Input
                id="investedAmount"
                type="number"
                step="0.01"
                min="0"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                placeholder="0.00"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentValue" className="text-ink-muted text-xs uppercase tracking-wider">Current Value (₹)</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                min="0"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0.00"
                className="bg-canvas border-border text-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="platform" className="text-ink-muted text-xs uppercase tracking-wider">Platform / Broker</Label>
              <Input
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. Zerodha, Groww"
                className="bg-canvas border-border text-ink"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="purchaseDate" className="text-ink-muted text-xs uppercase tracking-wider">Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
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
            <Button type="submit" className="bg-accent-green text-surface-dark hover:bg-accent-green/90 font-medium">
              Save Investment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
