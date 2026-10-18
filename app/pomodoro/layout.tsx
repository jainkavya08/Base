import { PomodoroTabs } from "@/components/pomodoro/pomodoro-tabs";

export default function PomodoroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col gap-6 md:gap-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1A1A1A]/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-sendlinks">TIMEBLOCK</span>
            <span className="text-xs font-mono text-[#8A7F72]">FOCUSED CADENCE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#1A1A1A] leading-[1.05]">
            Pomodoro
          </h1>
          <p className="text-[#8A7F72] mt-1 font-sans text-sm sm:text-base">
            Intentional focus sessions and deliberate rest intervals.
          </p>
        </div>
      </div>

      <PomodoroTabs />

      {children}
    </div>
  );
}
