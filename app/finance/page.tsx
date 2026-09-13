import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { AddTransactionDialog } from "@/components/finance/add-transaction-dialog";

export default function FinancePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Finance</h1>
          <p className="text-ink-muted mt-1">Track your spending and income.</p>
        </div>
        <AddTransactionDialog />
      </div>

      <FinanceDashboard />
    </div>
  );
}
