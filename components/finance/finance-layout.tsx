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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-ink">Finance</h1>
          <p className="text-ink-muted mt-1">Track your spending, accounts, investments and financial goals.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap md:justify-end">
          <AddTransferDialog />
          <AddAccountDialog />
          <AddTransactionDialog />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 border-b border-border overflow-x-auto pb-px no-scrollbar snap-x snap-mandatory">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(`/finance?tab=${tab.id}`)}
            className={cn(
              "pb-4 text-sm font-medium whitespace-nowrap transition-colors relative snap-start",
              currentTab === tab.id
                ? "text-ink"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
            {currentTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 animate-in fade-in duration-500">
        {renderTab()}
      </div>
    </>
  );
}

export function FinanceLayout() {
  return (
    <div className="p-4 pb-24 md:p-8 md:pb-8 max-w-7xl mx-auto h-full flex flex-col gap-6 md:gap-8">
      <Suspense fallback={<div className="p-8">Loading finance...</div>}>
        <FinanceTabs />
      </Suspense>
    </div>
  );
}
