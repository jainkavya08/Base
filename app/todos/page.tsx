import { TodoList } from "@/components/todos/todo-list";
import { AddTodoDialog } from "@/components/todos/add-todo-dialog";

export default function TodosPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-ink">Todos</h1>
          <p className="text-ink-muted mt-1">Manage your tasks and projects.</p>
        </div>
        <AddTodoDialog />
      </div>

      <TodoList />
    </div>
  );
}
