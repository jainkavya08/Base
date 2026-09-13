"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import { db, Todo } from "@/lib/db";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export function TodoList() {
  const todos = useLiveQuery(() => db.todos.toArray());

  if (!todos) return null;

  const today = startOfDay(new Date());

  const groupedTodos = todos.reduce((acc, todo) => {
    if (!todo.dueDate) {
      acc.noDate.push(todo);
    } else {
      const dueDate = parseISO(todo.dueDate);
      if (isSameDay(dueDate, today) || isBefore(dueDate, today)) {
        acc.today.push(todo);
      } else {
        acc.upcoming.push(todo);
      }
    }
    return acc;
  }, { today: [] as Todo[], upcoming: [] as Todo[], noDate: [] as Todo[] });

  // Sort each group: uncompleted first, then by priority
  const sortTodos = (a: Todo, b: Todo) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  };

  groupedTodos.today.sort(sortTodos);
  groupedTodos.upcoming.sort(sortTodos);
  groupedTodos.noDate.sort(sortTodos);

  const toggleTodo = async (id: string, current: boolean) => {
    await db.todos.update(id, { completed: !current });
  };

  const deleteTodo = async (id: string) => {
    await db.todos.delete(id);
  };

  const renderGroup = (title: string, list: Todo[]) => {
    if (list.length === 0) return null;
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-medium text-ink flex items-center gap-2">
          {title}
          <span className="text-xs font-normal bg-canvas text-ink-muted px-2 py-0.5 rounded-full">
            {list.length}
          </span>
        </h3>
        <div className="flex flex-col gap-2">
          {list.map((todo) => (
            <div 
              key={todo.id} 
              className={cn(
                "group flex items-center gap-3 p-4 bg-surface-card rounded-2xl transition-all border border-transparent hover:border-border",
                todo.completed && "opacity-60"
              )}
            >
              <Checkbox 
                checked={todo.completed} 
                onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                className="w-5 h-5 rounded-full border-border data-[state=checked]:bg-accent-yellow data-[state=checked]:border-accent-yellow data-[state=checked]:text-surface-dark"
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-ink font-medium truncate transition-all", todo.completed && "line-through text-ink-muted")}>
                  {todo.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                  {todo.projectId && (
                    <span className="bg-canvas px-2 py-0.5 rounded-md truncate max-w-[120px]">
                      {todo.projectId}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Flag className={cn(
                      "w-3 h-3",
                      todo.priority === 'high' ? 'text-accent-coral' : 
                      todo.priority === 'medium' ? 'text-accent-yellow' : 'text-ink-muted'
                    )} />
                    <span className="capitalize">{todo.priority}</span>
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted hover:text-accent-coral hover:bg-canvas"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {renderGroup("Today & Overdue", groupedTodos.today)}
      {renderGroup("Upcoming", groupedTodos.upcoming)}
      {renderGroup("Someday", groupedTodos.noDate)}

      {todos.length === 0 && (
        <div className="text-center py-16 bg-surface-card rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-canvas flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-ink-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink">All caught up!</h3>
          <p className="text-ink-muted mt-1">Add a new task to get started.</p>
        </div>
      )}
    </div>
  );
}

// Ensure CheckCircle is imported if used in empty state
import { CheckCircle } from "lucide-react";
