import { WorkspaceTimer } from "@/components/pomodoro/workspace/workspace-timer";
import { CurrentTask } from "@/components/pomodoro/workspace/current-task";
import { FocusCalendar } from "@/components/pomodoro/workspace/focus-calendar";
import { TodaySummary } from "@/components/pomodoro/workspace/today-summary";
import { FocusMusic } from "@/components/pomodoro/workspace/focus-music";
import { RecentSessions } from "@/components/pomodoro/workspace/recent-sessions";

export default function PomodoroPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start animate-in fade-in duration-500">
      
      {/* Left Column - Hero Workspace */}
      <div className="flex flex-col gap-8">
        <WorkspaceTimer />
        <CurrentTask />
        <FocusMusic />
      </div>

      {/* Right Column - Today's Context */}
      <div className="flex flex-col gap-8">
        <TodaySummary />
        <FocusCalendar />
        <RecentSessions />
      </div>

    </div>
  );
}
