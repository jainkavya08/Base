"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle, Circle, Plus, ListTodo } from "lucide-react";
import { db } from "@/lib/db";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CurrentTask() {
  const todos = useLiveQuery(() => db.todos.filter(t => !t.completed).toArray()) || [];
  const { pomodoro, setPomodoroState } = useAppStore();
  const { currentTodoId } = pomodoro;

  // Let's just show top 4 incomplete todos
  const displayTodos = todos.slice(0, 4);

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-ink flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-accent-blue" />
          Current Task
        </h3>
        <button className="text-sm text-accent-blue font-medium hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {displayTodos.length === 0 ? (
          <p className="text-sm text-ink-muted">No pending tasks. You're all caught up!</p>
        ) : (
          displayTodos.map(todo => {
            const isSelected = currentTodoId === todo.id;
            return (
              <div 
                key={todo.id}
                onClick={() => setPomodoroState({ currentTodoId: isSelected ? undefined : todo.id })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                  isSelected 
                    ? "bg-accent-blue/5 border-accent-blue/30" 
                    : "bg-canvas border-transparent hover:border-border/50"
                )}
              >
                <button className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                  isSelected ? "text-accent-blue" : "text-ink-muted"
                )}>
                  {isSelected ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-accent-blue" : "text-ink"
                )}>
                  {todo.title}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
