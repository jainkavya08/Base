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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">ALL ACTIVITY</span>
          </div>
          <h2 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">Transactions</h2>
          <p className="text-xs font-sans text-[#8A7F72] mt-0.5">View and filter all your financial activity.</p>
        </div>
      </div>

      <div className="bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7F72]" />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, category, or note..." 
              className="pl-9 bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A] text-xs font-mono"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-[130px] bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A] text-xs font-mono">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-[#8A7F72]" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#FDFAF4] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAccount} onValueChange={(val: any) => setFilterAccount(val)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-[#FDFAF4] border-[#1A1A1A] text-[#1A1A1A] text-xs font-mono">
                <Wallet className="w-3.5 h-3.5 mr-1.5 text-[#8A7F72]" />
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent className="bg-[#FDFAF4] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.filter(a => a.isActive).map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {filteredActivity.length > 0 ? (
          filteredActivity.map((tx) => {
            const acc = accounts.find(a => a.id === tx.accountId);
            
            return (
              <div key={tx.id} className="p-3.5 bg-[#FDFAF4] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:translate-x-0.5 transition-transform group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "w-8 h-8 rounded-[4px] border border-[#1A1A1A] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#1A1A1A]", 
                    tx.type === 'income' ? 'bg-[#FFE14D] text-[#1A1A1A]' : 
                    tx.type === 'expense' ? 'bg-[#FF4D00] text-white' : 
                    'bg-[#FDFAF4] text-[#1A1A1A]'
                  )}>
                    {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : 
                     tx.type === 'expense' ? <TrendingDown className="w-4 h-4" /> : 
                     <ArrowRightLeft className="w-4 h-4" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-[#1A1A1A] mb-0.5 truncate">{tx.title || tx.category}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono text-[#8A7F72]">
                      <span className="whitespace-nowrap">{format(parseISO(tx.date), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate max-w-full">
                        <Wallet className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                        {tx.isTransfer 
                          ? `${(tx as any).fromAcc?.name} → ${(tx as any).toAcc?.name}`
                          : acc?.name || 'Unknown'
                        }
                        </span>
                      </span>
                      {tx.category !== 'Transfer' && (
                        <>
                          <span>•</span>
                          <span className="bg-[#F5F0E8] px-1.5 py-0.2 rounded-[2px] border border-[#1A1A1A]/30 text-[10px] shrink-0 text-[#1A1A1A]">{tx.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="flex flex-col sm:items-end">
                    <span className={cn("text-sm font-mono font-medium", 
                      tx.type === 'income' ? 'text-[#1A1A1A]' : 
                      tx.type === 'expense' ? 'text-[#FF4D00]' : 
                      'text-[#8A7F72]'
                    )}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                    </span>
                    {tx.notes && (
                      <span className="text-xs text-[#8A7F72] max-w-[150px] sm:max-w-[200px] truncate">{tx.notes}</span>
                    )}
                  </div>
                  {!tx.isTransfer && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="p-1.5 rounded-[3px] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#8A7F72] hover:text-[#1A1A1A] transition-colors">
                          <span className="sr-only">Open menu</span>
                          <div className="w-4 h-4 flex items-center justify-center">
                            <span className="w-1 h-1 bg-current rounded-full mx-[1px]" />
                            <span className="w-1 h-1 bg-current rounded-full mx-[1px]" />
                            <span className="w-1 h-1 bg-current rounded-full mx-[1px]" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-[#FDFAF4] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-[4px] p-1 font-mono text-xs">
                        <DropdownMenuItem 
                          onClick={() => setTransactionToEdit(tx)}
                          className="cursor-pointer text-[#1A1A1A] hover:bg-[#FFE14D] focus:bg-[#FFE14D]"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="cursor-pointer text-[#FF4D00] hover:bg-[#FF4D00]/10 focus:bg-[#FF4D00]/10 focus:text-[#FF4D00]"
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
          <div className="text-center py-16 bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
            <div className="w-12 h-12 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-[#8A7F72]" />
            </div>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">No transactions found</h3>
            <p className="text-xs text-[#8A7F72] mt-1 max-w-sm mx-auto">
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
