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
    <div className="bg-[#FDFAF4] rounded-[6px] p-5 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-col max-h-[600px]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1A1A1A]/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="badge-sendlinks">FOCUS TASK</span>
          <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">Objective</h3>
        </div>
        
        {/* Source Toggle */}
        <div className="flex bg-[#F5F0E8] p-1 rounded-[4px] border border-[#1A1A1A]">
          <button
            onClick={() => setTaskSource('my_tasks')}
            className={cn("px-2.5 py-0.5 text-xs font-sans font-medium rounded-[2px] transition-colors", 
              taskSource === 'my_tasks' ? "bg-[#1A1A1A] text-white" : "text-[#8A7F72] hover:text-[#1A1A1A]"
            )}
          >
            My Tasks
          </button>
          <button
            onClick={() => setTaskSource('all_lists')}
            className={cn("px-2.5 py-0.5 text-xs font-sans font-medium rounded-[2px] transition-colors", 
              taskSource === 'all_lists' ? "bg-[#1A1A1A] text-white" : "text-[#8A7F72] hover:text-[#1A1A1A]"
            )}
          >
            All Lists
          </button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex gap-1.5 mb-4 shrink-0 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow' },
          { id: 'day_after', label: 'Day After' },
          { id: 'all', label: 'All Tasks' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setDateFilter(filter.id as any)}
            className={cn(
              "px-3 py-1 text-xs font-sans font-medium rounded-[2px] transition-all whitespace-nowrap border",
              dateFilter === filter.id 
                ? "bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] font-bold" 
                : "bg-[#F5F0E8] text-[#8A7F72] border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[180px] flex flex-col gap-2 pr-1 custom-scrollbar">
        {isTasksLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-5 h-5 animate-spin text-[#8A7F72]" />
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
            <Calendar className="w-6 h-6 text-[#8A7F72] mb-1 opacity-40" />
            <p className="text-xs text-[#8A7F72] font-sans">No tasks scheduled for this period.</p>
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
                  "flex items-start gap-2.5 p-2.5 rounded-[4px] transition-all border",
                  isRunning && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  isSelected 
                    ? "bg-[#FFE14D]/40 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]" 
                    : "bg-[#F5F0E8] border-[#1A1A1A]/30 hover:border-[#1A1A1A]"
                )}
              >
                <button 
                  disabled={isRunning}
                  className={cn(
                  "w-4 h-4 mt-0.5 rounded-[2px] border border-[#1A1A1A] flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "bg-[#1A1A1A] text-[#FFE14D]" : "bg-white text-transparent"
                )}>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className={cn(
                    "text-xs font-sans font-medium truncate",
                    isSelected ? "text-[#1A1A1A] font-bold" : "text-[#1A1A1A]"
                  )}>
                    {todo.title}
                  </span>
                  {(listName || todo.dueDate) && (
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8A7F72] font-mono">
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

      <div className="mt-3 pt-3 border-t border-[#1A1A1A]/10 shrink-0">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex flex-col gap-2">
            <input
              autoFocus
              type="text"
              placeholder={`Add task for ${dateFilter === 'all' ? 'today' : dateFilter.replace('_', ' ')}...`}
              className="w-full text-xs bg-[#FDFAF4] border border-[#1A1A1A] rounded-[4px] px-3 py-2 text-[#1A1A1A] placeholder:text-[#8A7F72] focus:outline-none focus:ring-1 focus:ring-[#FFE14D]"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="cta" disabled={!newTaskTitle.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Task"}
              </Button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full text-xs text-[#1A1A1A] hover:bg-[#FFE14D] font-sans font-medium flex items-center justify-center gap-1.5 py-2 rounded-[4px] transition-colors border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Due Task
          </button>
        )}
      </div>

    </div>
  );
}
