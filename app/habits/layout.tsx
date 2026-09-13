import { HabitsTabs } from "@/components/habits/habits-tabs";

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-medium text-ink">Habits</h1>
        <p className="text-ink-muted mt-1">Track your daily and weekly goals.</p>
      </div>

      <HabitsTabs />

      {children}
    </div>
  );
}
