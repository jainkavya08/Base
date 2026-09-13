import { HabitList } from "@/components/habits/habit-list";
import { HabitCalendar } from "@/components/habits/habit-calendar";
import { TodayProgress } from "@/components/habits/today-progress";
import { WeeklyOverview } from "@/components/habits/weekly-overview";

export default function HabitsPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <TodayProgress />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="flex flex-col gap-8">
          <WeeklyOverview />
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium text-ink">My Habits</h2>
            <HabitList />
          </div>
        </div>
        
        <div className="sticky top-8">
          <HabitCalendar />
        </div>
      </div>
    </div>
  );
}
