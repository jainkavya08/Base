"use client";

import useSWR from "swr";
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval, isPast, parseISO } from "date-fns";
import { fetcher } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { CheckCircle, Timer, ListTodo, Bell, Wallet, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";

export function WidgetHabits({ size }: { size: 'small' | 'large' }) {
  const { data: habitsData } = useSWR('/api/habits/habits.php', fetcher);
  const { data: completionsData } = useSWR('/api/habits/completions.php', fetcher);
  const habits = habitsData?.habits;
  const completions = completionsData?.completions;

  const todayCompletions = completions?.filter((c: any) => isSameDay(new Date(c.date), new Date())) || [];
  const completedCount = todayCompletions.length;
  const totalCount = habits?.length || 0;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-canvas text-accent-yellow flex items-center justify-center">
          <CheckCircle className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-ink">Habits Today</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="relative w-24 h-24 flex items-center justify-center mb-2">
          <svg className="w-full h-full -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="var(--color-canvas)" strokeWidth="8" fill="transparent" />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="var(--color-accent-yellow)" 
              strokeWidth="8" 
              fill="transparent" 
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={(2 * Math.PI * 40) * (1 - (totalCount === 0 ? 0 : completedCount / totalCount))}
            />
          </svg>
          <div className="text-center">
            <span className="text-xl font-medium text-ink">{completedCount}</span>
            <span className="text-ink-muted">/{totalCount}</span>
          </div>
        </div>
        {size === 'large' && (
          <p className="text-sm text-ink-muted text-center max-w-[200px]">
            Keep up the good work! You are on track today.
          </p>
        )}
      </div>
    </div>
  );
}

export function WidgetPomodoro({ size }: { size: 'small' | 'large' }) {
  const { pomodoro, setPomodoroState } = useAppStore();
  const { isRunning, timeLeft, mode } = pomodoro;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-canvas text-accent-coral flex items-center justify-center">
          <Timer className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-ink">Pomodoro</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div className="text-4xl font-mono tracking-tight text-ink">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setPomodoroState({ 
                isRunning: !isRunning, 
                targetEndTime: !isRunning ? Date.now() + timeLeft * 1000 : undefined 
              });
            }}
            className={`rounded-full ${mode === 'focus' ? 'bg-accent-yellow text-white hover:bg-accent-yellow/90' : 'bg-accent-coral text-white hover:bg-accent-coral/90'}`}
          >
            {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WidgetTodos({ size }: { size: 'small' | 'large' }) {
  const { data } = useSWR('/api/todos/tasks.php', fetcher);
  const todos = data?.tasks;
  
  if (!todos) return null;
  const incompleteTodos = todos.filter((t: any) => !t.completed);
  const displayCount = size === 'large' ? 4 : 2;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-canvas text-ink flex items-center justify-center">
          <ListTodo className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-ink">Tasks</h3>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {incompleteTodos.slice(0, displayCount).map((todo: any) => (
          <div key={todo.id} className="flex items-start gap-2 bg-canvas/50 p-2 rounded-lg">
            <div className="w-4 h-4 mt-0.5 rounded-sm border border-ink-muted/50" />
            <p className="text-sm text-ink truncate flex-1">{todo.title}</p>
          </div>
        ))}
        {incompleteTodos.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-ink-muted">
            All caught up!
          </div>
        )}
        {incompleteTodos.length > displayCount && (
          <p className="text-xs text-ink-muted text-center mt-1">
            +{incompleteTodos.length - displayCount} more
          </p>
        )}
      </div>
    </div>
  );
}

export function WidgetReminders({ size }: { size: 'small' | 'large' }) {
  const { data } = useSWR('/api/reminders/reminders.php', fetcher);
  const reminders = data?.reminders;
  
  if (!reminders) return null;
  
  const upcoming = reminders
    .filter((r: any) => !isPast(new Date(r.fireAt)))
    .sort((a: any, b: any) => new Date(a.fireAt).getTime() - new Date(b.fireAt).getTime());
    
  const displayCount = size === 'large' ? 3 : 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-canvas text-accent-yellow flex items-center justify-center">
          <Bell className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-ink">Next Up</h3>
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        {upcoming.slice(0, displayCount).map((reminder: any) => (
          <div key={reminder.id} className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-ink truncate">{reminder.title}</p>
            <p className="text-xs text-ink-muted">{format(new Date(reminder.fireAt), "MMM d, h:mm a")}</p>
          </div>
        ))}
        {upcoming.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-ink-muted">
            No upcoming reminders
          </div>
        )}
      </div>
    </div>
  );
}

export function WidgetFinance({ size }: { size: 'small' | 'large' }) {
  const { data } = useSWR('/api/finance/transactions.php', fetcher);
  const transactions = data?.transactions;
  
  if (!transactions) return null;

  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const currentMonthTx = transactions.filter((tx: any) => {
    const txDate = parseISO(tx.date);
    return isWithinInterval(txDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  const income = currentMonthTx.filter((t: any) => t.type === 'income').reduce((acc: any, t: any) => acc + parseFloat(t.amount), 0);
  const expense = currentMonthTx.filter((t: any) => t.type === 'expense').reduce((acc: any, t: any) => acc + parseFloat(t.amount), 0);
  const net = income - expense;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-canvas text-accent-coral flex items-center justify-center">
          <Wallet className="w-4 h-4" />
        </div>
        <h3 className="font-medium text-ink">This Month</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-1">
        <p className="text-xs text-ink-muted uppercase tracking-wider">Net Balance</p>
        <h4 className="text-2xl font-medium text-ink">{formatCurrency(net, false)}</h4>
        
        {size === 'large' && (
          <div className="flex gap-4 mt-4">
            <div>
              <p className="text-xs text-ink-muted">In</p>
              <p className="text-sm font-medium text-ink">{formatCurrency(income, true)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Out</p>
              <p className="text-sm font-medium text-ink">{formatCurrency(expense, true)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
