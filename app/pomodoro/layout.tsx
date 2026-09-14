import { PomodoroTabs } from "@/components/pomodoro/pomodoro-tabs";

export default function PomodoroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-ink">Pomodoro</h1>
          <p className="text-ink-muted mt-1">Focus sessions and break intervals.</p>
        </div>
      </div>

      <PomodoroTabs />

      {children}
    </div>
  );
}
