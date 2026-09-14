"use client";

import { useState, useRef, useEffect } from "react";
import { Landmark, Upload, X } from "lucide-react";
import { db, BankAccount } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

export function EditAccountDialog({
  account,
  open,
  onOpenChange
}: {
  account: BankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(account.name);
  const [bankName, setBankName] = useState(account.bankName);
  const [accountType, setAccountType] = useState(account.accountType);
  const [last4, setLast4] = useState(account.accountNumberLast4 || "");
  const [balance, setBalance] = useState(account.balance.toString());
  const [color, setColor] = useState(account.color || "#f5c542");
  const [logoBase64, setLogoBase64] = useState<string>(account.logo || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(account.name);
      setBankName(account.bankName);
      setAccountType(account.accountType);
      setLast4(account.accountNumberLast4 || "");
      setBalance(account.balance.toString());
      setColor(account.color || "#f5c542");
      setLogoBase64(account.logo || "");
    }
  }, [open, account]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      alert("Logo image must be smaller than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bankName || !balance) return;
    
    await db.bankAccounts.update(account.id, {
      name,
      bankName,
      accountType,
      accountNumberLast4: last4 || undefined,
      balance: parseFloat(balance),
      color,
      logo: logoBase64 || undefined,
      updatedAt: new Date().toISOString(),
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-32px)] sm:w-full sm:max-w-[450px] max-h-[90vh] overflow-y-auto bg-surface-card border-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-ink flex items-center gap-2">
            <Landmark className="w-5 h-5 text-accent-yellow" /> Edit Bank Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name" className="text-ink-muted text-xs uppercase tracking-wider">Account Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HDFC Savings"
                className="bg-canvas border-border text-ink"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-bankName" className="text-ink-muted text-xs uppercase tracking-wider">Bank Name</Label>
              <Input
                id="edit-bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="bg-canvas border-border text-ink"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-accountType" className="text-ink-muted text-xs uppercase tracking-wider">Account Type</Label>
              <Select value={accountType} onValueChange={(val: any) => setAccountType(val)}>
                <SelectTrigger className="bg-canvas border-border text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings Account">Savings Account</SelectItem>
                  <SelectItem value="Current Account">Current Account</SelectItem>
                  <SelectItem value="Salary Account">Salary Account</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash / Wallet">Cash / Wallet</SelectItem>
                  <SelectItem value="Investment Account">Investment Account</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-last4" className="text-ink-muted text-xs uppercase tracking-wider">Last 4 Digits</Label>
              <Input
                id="edit-last4"
                value={last4}
                onChange={(e) => setLast4(e.target.value.slice(0, 4))}
                placeholder="e.g. 4821"
                type="number"
                maxLength={4}
                className="bg-canvas border-border text-ink"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-balance" className="text-ink-muted text-xs uppercase tracking-wider">Current Balance (₹)</Label>
            <Input
              id="edit-balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="bg-canvas border-border text-ink text-xl"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label className="text-ink-muted text-xs uppercase tracking-wider">Accent Color</Label>
              <div className="flex items-center gap-2 bg-canvas p-2 rounded-md border border-border">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-sm text-ink font-mono">{color}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-ink-muted text-xs uppercase tracking-wider">Custom Logo</Label>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {logoBase64 ? (
                <div className="flex items-center gap-2 bg-canvas p-1 pr-3 rounded-md border border-border">
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <img src={logoBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-ink-muted hover:text-accent-coral"
                    onClick={() => setLogoBase64("")}
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-canvas border-border text-ink w-full h-12"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-ink hover:bg-canvas">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent-yellow text-surface-dark hover:bg-accent-yellow/90 font-medium">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
