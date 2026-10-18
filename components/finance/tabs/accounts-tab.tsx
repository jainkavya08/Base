"use client";

import useSWR, { mutate } from "swr";
import { fetcher, fetchApi } from "@/lib/api";
import { Wallet, Landmark, CreditCard, Coins, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { AddAccountDialog } from "../dialogs/add-account-dialog";
import { format, parseISO } from "date-fns";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EditAccountDialog } from "../dialogs/edit-account-dialog";
import { cn } from "@/lib/utils";

function AccountCard({ account, accountTx }: { account: any, accountTx: any[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (accountTx.length > 0) {
      alert("Cannot delete account with existing transactions. Please reassign or delete the transactions first.");
      return;
    }
    
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      await fetchApi(`/api/finance/accounts.php?id=${account.id}`, { method: 'DELETE' });
      mutate('/api/finance/accounts.php');
      setMenuOpen(false);
    }
  };

  const handleDeactivate = async () => {
    await fetchApi('/api/finance/accounts.php', {
      method: 'PUT',
      body: JSON.stringify({ id: account.id, isActive: !account.isActive })
    });
    mutate('/api/finance/accounts.php');
    setMenuOpen(false);
  };

  const gradientStyle = account.color ? {
    background: `linear-gradient(to bottom, ${account.color}15 0%, transparent 60%)`,
    backgroundColor: 'var(--surface-card)' // fallback/base
  } : {};

  return (
    <>
      <div 
        className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] relative overflow-hidden group shadow-[4px_4px_0px_0px_#1A1A1A]" 
        style={gradientStyle}
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#F5F0E8] flex items-center justify-center text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] overflow-hidden">
              {account.logo ? (
                <img src={account.logo} alt={account.bankName} className="w-full h-full object-cover" />
              ) : (
                account.accountType === 'Credit Card' ? <CreditCard className="w-4 h-4" /> : 
                account.accountType === 'Cash / Wallet' ? <Coins className="w-4 h-4" /> : 
                <Landmark className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm text-[#1A1A1A]">{account.name}</h3>
              <p className="text-xs font-mono text-[#8A7F72]">{account.bankName} {account.accountNumberLast4 ? `• ${account.accountNumberLast4}` : ''}</p>
            </div>
          </div>
          
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              aria-label="Account actions"
              className="text-[#8A7F72] hover:text-[#1A1A1A] p-1 rounded-[3px] border border-transparent hover:border-[#1A1A1A] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1 bg-[#FDFAF4] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-[4px] z-50 font-mono text-xs">
              <button
                onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#FFE14D] rounded-[2px]"
              >
                Edit Account
              </button>
              <button
                onClick={handleDeactivate}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#FFE14D] rounded-[2px]"
              >
                {account.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <div className="h-px bg-[#1A1A1A]/20 my-1 mx-1" />
              <button
                onClick={handleDelete}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[#FF4D00] hover:bg-[#FF4D00]/10 rounded-[2px]"
              >
                Delete Account
              </button>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="mb-5">
          <p className="font-serif italic font-normal text-3xl text-[#1A1A1A]">{formatCurrency(account.balance)}</p>
          <span className="badge-sendlinks mt-1.5">{account.accountType}</span>
        </div>
        
        <div className="border-t border-[#1A1A1A]/10 pt-3.5">
          <p className="text-[10px] font-mono text-[#8A7F72] mb-2 uppercase tracking-wider">Recent Activity</p>
          {accountTx.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {accountTx.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3).map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center text-xs">
                  <span className="text-[#1A1A1A] truncate max-w-[140px] font-medium">{tx.title || tx.category}</span>
                  <div className="text-right">
                    <span className={cn("font-mono font-medium", 
                      tx.type === 'income' ? 'text-[#1A1A1A]' : 
                      tx.type === 'expense' ? 'text-[#FF4D00]' : 'text-[#8A7F72]'
                    )}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                    </span>
                    <p className="text-[10px] font-mono text-[#8A7F72] leading-tight">{format(parseISO(tx.date), "MMM d")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[#8A7F72] italic">No recent activity.</p>
          )}
        </div>
      </div>

      <EditAccountDialog 
        account={account} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
    </>
  );
}

export function AccountsTab() {
  const { data: accountsData } = useSWR('/api/finance/accounts.php', fetcher);
  const { data: txData } = useSWR('/api/finance/transactions.php', fetcher);
  
  const accounts: any[] = accountsData?.accounts;
  const transactions: any[] = txData?.transactions;

  if (!accounts || !transactions) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">CONNECTED</span>
          </div>
          <h2 className="font-serif italic font-normal text-2xl md:text-3xl text-[#1A1A1A]">Bank Accounts</h2>
          <p className="text-xs font-sans text-[#8A7F72] mt-0.5">Manage your accounts, cards, and wallets</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.filter(a => a.isActive).map(account => {
          const accountTx = transactions.filter(t => t.accountId === account.id);
          return <AccountCard key={account.id} account={account} accountTx={accountTx} />;
        })}
        
        {accounts.filter(a => a.isActive).length === 0 && (
          <div className="col-span-full text-center py-16 bg-[#FDFAF4] rounded-[6px] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col items-center">
            <div className="w-12 h-12 rounded-[4px] bg-[#F5F0E8] border border-[#1A1A1A] flex items-center justify-center mb-3">
              <Landmark className="w-6 h-6 text-[#8A7F72]" />
            </div>
            <h3 className="font-serif italic font-normal text-xl text-[#1A1A1A]">No bank accounts yet</h3>
            <p className="text-xs text-[#8A7F72] mt-1 max-w-sm mb-5">Add your first account to start tracking your balances and transactions.</p>
            <AddAccountDialog />
          </div>
        )}
      </div>
    </div>
  );
}
