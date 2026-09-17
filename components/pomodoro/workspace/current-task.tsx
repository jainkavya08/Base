"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { CheckCircle, Circle, Plus, ListTodo, Calendar, Loader2 } from "lucide-react";
import { fetcher, fetchApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CurrentTask() {
  const { data: tasksData, isLoading: isTasksLoading } = useSWR('/api/todos/tasks.php', fetcher);
  const { data: listsData } = useSWR('/api/todos/lists.php', fetcher);
  
  const [taskSource, setTaskSource] = useState<'my_tasks' | 'all_lists'>('my_tasks');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'day_after' | 'all'>('today');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { pomodoro, setPomodoroState } = useAppStore();
  const { currentTodoId, isRunning } = pomodoro;

  const lists = listsData?.lists || [];
  const primaryListId = lists[0]?.id;

  let todos = tasksData?.tasks || [];
  
  // 1. Filter by completed
  todos = todos.filter((t: any) => !t.completed);

  // 2. Filter by source (My Tasks = Primary List, All Lists = everything)
  if (taskSource === 'my_tasks' && primaryListId) {
    todos = todos.filter((t: any) => t.listId === primaryListId);
  }

  // 3. Filter by date
  const now = new Date();
  
  const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  
  const todayStart = getStartOfDay(now);
  const tomorrowStart = todayStart + 86400000;
  const dayAfterStart = todayStart + 86400000 * 2;

  if (dateFilter !== 'all') {
    todos = todos.filter((t: any) => {
      if (!t.dueDate) return false;
      const dueTime = getStartOfDay(new Date(t.dueDate));
      
      if (dateFilter === 'today') {
        return dueTime === todayStart;
      } else if (dateFilter === 'tomorrow') {
        return dueTime === tomorrowStart;
      } else if (dateFilter === 'day_after') {
        return dueTime === dayAfterStart;
      }
      return true;
    });
  }

  // 4. Sort (position ASC, created_at ASC is default from API usually, but we can enforce)
  todos.sort((a: any, b: any) => {
    if (a.position !== b.position) return a.position - b.position;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const getTargetDate = () => {
    const d = new Date(now);
    if (dateFilter === 'tomorrow') d.setDate(d.getDate() + 1);
    if (dateFilter === 'day_after') d.setDate(d.getDate() + 2);
    // If 'all', default to today for new tasks
    return d.toISOString().split('T')[0];
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !primaryListId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetchApi("/api/todos/tasks.php", {
        method: "PUT",
        body: JSON.stringify({
          listId: primaryListId,
          title: newTaskTitle.trim(),
          dueDate: getTargetDate(),
          completed: false,
          status: 'todo',
          priority: "medium",
          position: todos.length
        }),
      });
      mutate("/api/todos/tasks.php");
      setNewTaskTitle("");
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskClick = (id: string) => {
    if (isRunning) return; // Lock during active session
    setPomodoroState({ currentTodoId: currentTodoId === id ? undefined : id });
  };

  return (
    <div className="bg-surface-card rounded-[32px] p-6 lg:p-8 shadow-sm border border-border/50 flex flex-col max-h-[600px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-medium text-ink flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-accent-blue" />
          Focus Task
        </h3>
        
        {/* Source Toggle */}
        <div className="flex bg-canvas p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setTaskSource('my_tasks')}
            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", 
              taskSource === 'my_tasks' ? "bg-accent-blue text-white shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            My Tasks
          </button>
          <button
            onClick={() => setTaskSource('all_lists')}
            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", 
              taskSource === 'all_lists' ? "bg-accent-blue text-white shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            All Lists
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow' },
          { id: 'day_after', label: 'Day After' },
          { id: 'all', label: 'All' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setDateFilter(filter.id as any)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap border",
              dateFilter === filter.id 
                ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20" 
                : "bg-canvas text-ink-muted border-transparent hover:border-border/50 hover:text-ink"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[200px] flex flex-col gap-2 pr-2 custom-scrollbar">
        {isTasksLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
            <Calendar className="w-8 h-8 text-ink-muted mb-2 opacity-50" />
            <p className="text-sm text-ink-muted">No tasks due {dateFilter !== 'all' ? dateFilter.replace('_', ' ') : 'here'}.</p>
          </div>
        ) : (
          todos.map((todo: any) => {
            const isSelected = currentTodoId === todo.id;
            const listName = lists.find((l: any) => l.id === todo.listId)?.name;
            return (
              <div 
                key={todo.id}
                onClick={() => handleTaskClick(todo.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-all border",
                  isRunning && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  isSelected 
                    ? "bg-accent-blue/5 border-accent-blue/30 shadow-sm ring-1 ring-accent-blue/20" 
                    : "bg-canvas border-transparent hover:border-border/50"
                )}
              >
                <button 
                  disabled={isRunning}
                  className={cn(
                  "w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "text-accent-blue" : "text-ink-muted"
                )}>
                  {isSelected ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isSelected ? "text-accent-blue" : "text-ink"
                  )}>
                    {todo.title}
                  </span>
                  {(listName || todo.dueDate) && (
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-muted">
                      {listName && <span className="truncate max-w-[100px]">{listName}</span>}
                      {listName && todo.dueDate && <span>•</span>}
                      {todo.dueDate && (
                        <span>
                          {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 shrink-0">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
            <input
              autoFocus
              type="text"
              placeholder={`Add task for ${dateFilter === 'all' ? 'today' : dateFilter.replace('_', ' ')}...`}
              className="w-full text-sm bg-canvas border border-border/50 rounded-lg px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-accent-blue text-white" disabled={!newTaskTitle.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full text-sm text-ink-muted hover:text-accent-blue font-medium flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-accent-blue/5 transition-colors border border-dashed border-transparent hover:border-accent-blue/20"
          >
            <Plus className="w-4 h-4" /> Add Due Task
          </button>
        )}
      </div>

    </div>
  );
}
