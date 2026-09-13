import { HabitList } from "@/components/habits/habit-list";
import { HabitCalendar } from "@/components/habits/habit-calendar";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";

export default function HabitsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Habits</h1>
          <p className="text-ink-muted mt-1">Track your daily and weekly goals.</p>
        </div>
        <AddHabitDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-medium text-ink">My Habits</h2>
          </div>
          <HabitList />
        </div>
        
        <div className="sticky top-8">
          <HabitCalendar />
        </div>
      </div>
    </div>
  );
}
