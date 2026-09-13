import { PomodoroTabs } from "@/components/pomodoro/pomodoro-tabs";

export default function PomodoroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-medium text-ink">Pomodoro</h1>
        <p className="text-ink-muted mt-1">Focus sessions and break intervals.</p>
      </div>

      <PomodoroTabs />

      {children}
    </div>
  );
}
