import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";
import { PomodoroHistory } from "@/components/pomodoro/pomodoro-history";

export default function PomodoroPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-medium text-ink">Pomodoro</h1>
        <p className="text-ink-muted mt-1">Focus sessions and break intervals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <PomodoroTimer />
        <PomodoroHistory />
      </div>
    </div>
  );
}
