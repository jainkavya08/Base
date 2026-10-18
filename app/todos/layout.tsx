import { TodosTabs } from "@/components/todos/todos-tabs";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col gap-6 md:gap-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1A1A1A]/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-sendlinks">TASKS & PROJECTS</span>
            <span className="text-xs font-mono text-[#8A7F72]">ACTION LISTS</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#1A1A1A] leading-[1.05]">
            Todos
          </h1>
          <p className="text-[#8A7F72] mt-1 font-sans text-sm sm:text-base">
            Systematic lists and projects organized with tactile clarity.
          </p>
        </div>
      </div>

      <TodosTabs />

      {children}
    </div>
  );
}
