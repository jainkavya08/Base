"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { OverviewTab } from "./tabs/overview-tab";
import { TransactionsTab } from "./tabs/transactions-tab";
import { AccountsTab } from "./tabs/accounts-tab";
import { RecurringTab } from "./tabs/recurring-tab";
import { InvestmentsTab } from "./tabs/investments-tab";
import { DebtTab } from "./tabs/debt-tab";
import { StatsTab } from "./tabs/stats-tab";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { AddAccountDialog } from "./dialogs/add-account-dialog";
import { AddTransferDialog } from "./dialogs/add-transfer-dialog";
import { Suspense } from "react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "accounts", label: "Accounts" },
  { id: "recurring", label: "Recurring" },
  { id: "investments", label: "Investments" },
  { id: "debt", label: "Debt" },
  { id: "stats", label: "Stats & Progress" },
];

function FinanceTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentTab = searchParams.get("tab") || "overview";

  const renderTab = () => {
    switch (currentTab) {
      case "transactions":
        return <TransactionsTab />;
      case "accounts":
        return <AccountsTab />;
      case "recurring":
        return <RecurringTab />;
      case "investments":
        return <InvestmentsTab />;
      case "debt":
        return <DebtTab />;
      case "stats":
        return <StatsTab />;
      case "overview":
      default:
        return <OverviewTab />;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1A1A1A]/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sendlinks">LEDGER & ASSETS</span>
            <span className="text-xs font-mono text-[#8A7F72]">REAL-TIME</span>
          </div>
          <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">Finance</h1>
          <p className="text-sm font-sans text-[#8A7F72] mt-0.5">Track your spending, accounts, investments and financial goals.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap md:justify-end">
          <AddTransferDialog />
          <AddAccountDialog />
          <AddTransactionDialog />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#1A1A1A]/10 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/finance?tab=${tab.id}`)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition-all relative snap-start rounded-[4px] border",
                isActive
                  ? "bg-[#1A1A1A] text-[#FDFAF4] border-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00]"
                  : "bg-[#FDFAF4] text-[#8A7F72] border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-w-0 animate-in fade-in duration-300">
        {renderTab()}
      </div>
    </>
  );
}

export function FinanceLayout() {
  return (
    <div className="p-4 pb-24 md:p-8 md:pb-8 max-w-7xl mx-auto h-full flex flex-col gap-6 md:gap-8 min-w-0 w-full">
      <Suspense fallback={<div className="p-8">Loading finance...</div>}>
        <FinanceTabs />
      </Suspense>
    </div>
  );
}
