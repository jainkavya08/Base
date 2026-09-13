import { TodosTabs } from "@/components/todos/todos-tabs";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-medium text-ink">Todos</h1>
        <p className="text-ink-muted mt-1">Manage your tasks and projects.</p>
      </div>

      <TodosTabs />

      {children}
    </div>
  );
}
