import { HabitsTabs } from "@/components/habits/habits-tabs";

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-ink">Habits</h1>
          <p className="text-ink-muted mt-1">Track your daily and weekly goals.</p>
        </div>
      </div>

      <HabitsTabs />

      {children}
    </div>
  );
}
