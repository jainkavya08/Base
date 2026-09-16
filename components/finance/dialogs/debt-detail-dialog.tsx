"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";
import { fetchApi, fetcher } from "@/lib/api";
import useSWR, { mutate } from "swr";
import { format, parseISO } from "date-fns";

interface Debt {
  id: string;
  type: string;
  person: string;
  title: string;
  originalAmount: number;
  remainingAmount: number;
  status: string;
  notes?: string;
  dueDate?: string;
}

interface DebtDetailDialogProps {
  debt: Debt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtDetailDialog({ debt, open, onOpenChange }: DebtDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editPerson, setEditPerson] = useState("");
  const [editType, setEditType] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const { data: paymentsData } = useSWR(
    debt?.id ? `/api/finance/debt_payments.php?debt_id=${debt.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (debt) {
      setEditTitle(debt.title);
      setEditPerson(debt.person);
      setEditType(debt.type);
      setEditAmount(debt.originalAmount.toString());
      setEditNotes(debt.notes || "");
      setEditDueDate(debt.dueDate || "");
      setIsEditing(false);
      setPaymentAmount("");
    }
  }, [debt]);

  if (!debt) return null;

  const progress = debt.originalAmount > 0 
    ? ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100 
    : 0;

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    if (amount > debt.remainingAmount) {
      alert("Payment cannot exceed the remaining amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi('/api/finance/debt_payments.php', {
        method: 'POST',
        body: JSON.stringify({
          debtId: debt.id,
          amount: amount,
          paymentDate: format(new Date(), "yyyy-MM-dd")
        })
      });
      setPaymentAmount("");
      mutate('/api/finance/debts.php');
      mutate(`/api/finance/debt_payments.php?debt_id=${debt.id}`);
      mutate('/api/finance/accounts.php'); // In case overview or dashboard needs update
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    const amt = parseFloat(editAmount);
    if (!editTitle || isNaN(amt) || amt <= 0) {
      alert("Please fill out title and a valid original amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi('/api/finance/debts.php', {
        method: 'PUT',
        body: JSON.stringify({
          id: debt.id,
          title: editTitle,
          personOrOrganization: editPerson,
          type: editType,
          originalAmount: amt,
          notes: editNotes,
          dueDate: editDueDate || null,
        })
      });
      setIsEditing(false);
      mutate('/api/finance/debts.php');
    } catch (err: any) {
      alert(err.message || "Failed to update debt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-32px)] sm:w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-surface-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-medium text-ink">
              {isEditing ? "Edit Debt" : "Debt Details"}
            </DialogTitle>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editType} onValueChange={(v) => setEditType(v || "")}>
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owed_by_you">I Owe</SelectItem>
                    <SelectItem value="owed_to_you">Owed to Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-person">Person / Org</Label>
                <Input id="edit-person" value={editPerson} onChange={(e) => setEditPerson(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-amount">Original Amount</Label>
                <Input id="edit-amount" type="number" min="0" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-due">Due Date</Label>
                <Input id="edit-due" type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <textarea 
                id="edit-notes" 
                value={editNotes} 
                onChange={(e) => setEditNotes(e.target.value)} 
                className="flex min-h-[80px] w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm ring-offset-background placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting} className="bg-accent text-accent-foreground">Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-medium text-ink">{debt.title}</h3>
                <p className="text-ink-muted">{debt.person}</p>
                <div className="mt-2 inline-block px-2 py-1 rounded-md text-xs font-medium bg-canvas border border-border/50 text-ink">
                  {debt.type === 'owed_by_you' ? 'I Owe' : 'Owed to Me'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-canvas/50 p-4 rounded-xl">
              <div>
                <p className="text-sm text-ink-muted">Original Amount</p>
                <p className="text-lg font-medium text-ink">{formatCurrency(debt.originalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Remaining</p>
                <p className="text-lg font-medium text-ink">{formatCurrency(debt.remainingAmount)}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-ink-muted mb-2">
                <span>Progress</span>
                <span className={debt.remainingAmount === 0 ? "text-accent-green font-medium" : ""}>
                  {progress.toFixed(0)}% {debt.type === 'owed_by_you' ? 'Paid' : 'Received'}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {debt.remainingAmount > 0 && (
              <div className="bg-surface p-4 rounded-xl border border-border/50">
                <Label htmlFor="payment" className="text-sm font-medium mb-2 block">Record Payment</Label>
                <div className="flex gap-2">
                  <Input 
                    id="payment" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    max={debt.remainingAmount}
                    placeholder="0.00" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)} 
                  />
                  <Button onClick={handleRecordPayment} disabled={isSubmitting || !paymentAmount} className="bg-accent text-accent-foreground shrink-0">
                    Record
                  </Button>
                </div>
              </div>
            )}

            {paymentsData?.payments?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-ink mb-3">Payment History</h4>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                  {paymentsData.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-ink-muted">{format(parseISO(p.paymentDate), "dd MMM yyyy")}</span>
                      <span className="text-sm font-medium text-ink">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
