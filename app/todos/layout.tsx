import { TodosTabs } from "@/components/todos/todos-tabs";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-ink">Todos</h1>
          <p className="text-ink-muted mt-1">Manage your tasks and projects.</p>
        </div>
      </div>

      <TodosTabs />

      {children}
    </div>
  );
}
