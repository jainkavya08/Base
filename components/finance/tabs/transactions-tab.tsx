"use client";


import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { EditTransactionDialog } from "../dialogs/edit-transaction-dialog";

export function TransactionsTab() {
  const { data: txData } = useSWR('/api/finance/transactions.php', fetcher);
  const { data: accountsData } = useSWR('/api/finance/accounts.php', fetcher);
  const { data: transfersData } = useSWR('/api/finance/transfers.php', fetcher);
  
  const transactions: any[] = txData?.transactions;
  const accounts: any[] = accountsData?.accounts;
  const transfers: any[] = transfersData?.transfers;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "transfer">("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);

  if (!transactions || !accounts || !transfers) return null;

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction? This will update your account balance accordingly.")) {
      try {
        await fetchApi(`/api/finance/transactions.php?id=${id}`, { method: 'DELETE' });
        mutate('/api/finance/transactions.php');
        mutate('/api/finance/accounts.php');
      } catch (err) {
        alert("Failed to delete transaction. Please try again.");
      }
    }
  };

  // Combine transactions and transfers for the list view
  const allActivity = [
    ...transactions.map(t => ({
      ...t,
      sortDate: t.createdAt,
      isTransfer: false
    })),
    ...transfers.map(t => {
      const fromAcc = accounts.find(a => a.id === t.fromAccountId);
      const toAcc = accounts.find(a => a.id === t.toAccountId);
      return {
        id: t.id,
        type: 'transfer' as const,
        amount: t.amount,
        title: `Transfer to ${toAcc?.name || 'Account'}`,
        category: 'Transfer',
        date: t.date,
        accountId: t.fromAccountId,
        notes: t.description,
        createdAt: t.createdAt,
        sortDate: t.createdAt,
        isTransfer: true,
        fromAcc,
        toAcc
      };
    })
  ].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  const filteredActivity = allActivity.filter(item => {
    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesTitle = item.title?.toLowerCase().includes(term);
      const matchesCategory = item.category?.toLowerCase().includes(term);
      const matchesNotes = item.notes?.toLowerCase().includes(term);
      if (!matchesTitle && !matchesCategory && !matchesNotes) return false;
    }

    // Type filter
    if (filterType !== 'all') {
      if (item.type !== filterType) return false;
    }

    // Account filter
    if (filterAccount !== 'all') {
      if (item.isTransfer) {
        if (item.accountId !== filterAccount && (item as any).toAcc?.id !== filterAccount) return false;
      } else {
        if (item.accountId !== filterAccount) return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-ink">Transactions</h2>
          <p className="text-sm text-ink-muted mt-1">View and filter all your financial activity.</p>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-border/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, category, or note..." 
              className="pl-10 bg-canvas border-border text-ink"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-canvas border-border text-ink">
                <Filter className="w-4 h-4 mr-2 text-ink-muted" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAccount} onValueChange={(val: any) => setFilterAccount(val)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-canvas border-border text-ink">
                <Wallet className="w-4 h-4 mr-2 text-ink-muted" />
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.filter(a => a.isActive).map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredActivity.length > 0 ? (
          filteredActivity.map((tx) => {
            const acc = accounts.find(a => a.id === tx.accountId);
            
            return (
              <div key={tx.id} className={cn(
                "p-4 md:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/50 hover:border-border transition-colors group",
                tx.type === 'income' ? 'bg-surface-card bg-gradient-to-r from-accent-green/5 to-transparent' : 
                tx.type === 'expense' ? 'bg-surface-card bg-gradient-to-r from-accent-coral/5 to-transparent' : 
                'bg-surface-card bg-gradient-to-r from-accent-blue/5 to-transparent'
              )}>
                <div className="flex items-start sm:items-center gap-4 md:gap-5">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm shrink-0",
                    tx.type === 'income' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 
                    tx.type === 'expense' ? 'bg-accent-coral/10 text-accent-coral border border-accent-coral/20' : 
                    'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  )}>
                    {tx.type === 'income' ? <TrendingUp className="w-5 h-5 md:w-6 md:h-6" /> : 
                     tx.type === 'expense' ? <TrendingDown className="w-5 h-5 md:w-6 md:h-6" /> : 
                     <ArrowRightLeft className="w-5 h-5 md:w-6 md:h-6" />}
                  </div>
                  
                  <div>
                    <h4 className="text-base md:text-lg font-medium text-ink mb-1">{tx.title || tx.category}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-ink-muted">
                      <span>{format(parseISO(tx.date), "MMM d, yyyy")}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        {tx.isTransfer 
                          ? `${(tx as any).fromAcc?.name} → ${(tx as any).toAcc?.name}`
                          : acc?.name || 'Unknown Account'
                        }
                      </span>
                      {tx.category !== 'Transfer' && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="bg-canvas px-2 py-0.5 rounded-md border border-border/50 text-[10px] md:text-xs">{tx.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pl-14 sm:pl-0">
                  <div className="flex flex-col sm:items-end">
                    <span className={cn("text-base md:text-lg font-medium", 
                      tx.type === 'income' ? 'text-accent-green' : 
                      tx.type === 'expense' ? 'text-ink' : 
                      'text-ink-muted'
                    )}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                    </span>
                    {tx.notes && (
                      <span className="text-xs md:text-sm text-ink-muted mt-1 max-w-[200px] truncate">{tx.notes}</span>
                    )}
                  </div>
                  {!tx.isTransfer && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="p-2 -mr-2 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <span className="w-1 h-1 bg-current rounded-full mx-[1px]" />
                            <span className="w-1 h-1 bg-current rounded-full mx-[1px]" />
                            <span className="w-1 h-1 bg-current rounded-full mx-[1px]" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-surface-card border-border">
                        <DropdownMenuItem 
                          onClick={() => setTransactionToEdit(tx)}
                          className="cursor-pointer text-ink hover:text-ink hover:bg-canvas focus:bg-canvas"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="cursor-pointer text-accent-coral hover:text-accent-coral hover:bg-accent-coral/10 focus:bg-accent-coral/10 focus:text-accent-coral"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-surface-card rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-canvas flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-ink-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink">No transactions found</h3>
            <p className="text-ink-muted mt-1 max-w-sm mx-auto">
              Try adjusting your filters or search terms, or add a new transaction.
            </p>
          </div>
        )}
      </div>

      {transactionToEdit && (
        <EditTransactionDialog
          transaction={transactionToEdit}
          open={!!transactionToEdit}
          onOpenChange={(isOpen) => {
            if (!isOpen) setTransactionToEdit(null);
          }}
        />
      )}
    </div>
  );
}
