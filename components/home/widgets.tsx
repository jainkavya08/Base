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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#FFE14D] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Daily Habits</h3>
        </div>
        <span className="badge-sendlinks">GOALS</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="relative w-24 h-24 flex items-center justify-center mb-2">
          <svg className="w-full h-full -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#EDE8DC" strokeWidth="8" fill="transparent" />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#FF4D00" 
              strokeWidth="8" 
              fill="transparent" 
              strokeLinecap="butt"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={(2 * Math.PI * 40) * (1 - (totalCount === 0 ? 0 : completedCount / totalCount))}
            />
          </svg>
          <div className="text-center">
            <span className="font-serif text-2xl font-normal text-[#1A1A1A]">{completedCount}</span>
            <span className="font-sans text-xs text-[#544C40]">/{totalCount}</span>
          </div>
        </div>
        {size === 'large' && (
          <p className="text-xs text-[#544C40] text-center max-w-[200px] mt-1 font-sans">
            Consistent rhythm builds lifelong progress.
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#FF4D00] text-white border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Focus Timer</h3>
        </div>
        <span className="badge-sendlinks">{mode.toUpperCase()}</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center gap-3">
        <div className="text-4xl font-mono tracking-tight font-normal text-[#1A1A1A]">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant={isRunning ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              setPomodoroState({ 
                isRunning: !isRunning, 
                targetEndTime: !isRunning ? Date.now() + timeLeft * 1000 : undefined 
              });
            }}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isRunning ? 'Pause' : 'Start Session'}
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#FDFAF4] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Active Tasks</h3>
        </div>
        <span className="badge-sendlinks">TODO</span>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {incompleteTodos.slice(0, displayCount).map((todo: any) => (
          <div key={todo.id} className="flex items-start gap-2 bg-[#F5F0E8] p-2 rounded-[3px] border border-[#1A1A1A]/30">
            <div className="w-3.5 h-3.5 mt-0.5 rounded-[2px] border border-[#1A1A1A] bg-white shrink-0" />
            <p className="text-xs text-[#1A1A1A] truncate flex-1 font-sans">{todo.title}</p>
          </div>
        ))}
        {incompleteTodos.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-[#544C40] font-sans">
            All tasks clear for today
          </div>
        )}
        {incompleteTodos.length > displayCount && (
          <p className="text-[11px] text-[#544C40] text-center mt-1 font-sans">
            +{incompleteTodos.length - displayCount} more items
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#FFE14D] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Upcoming</h3>
        </div>
        <span className="badge-sendlinks">ALERTS</span>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {upcoming.slice(0, displayCount).map((reminder: any) => (
          <div key={reminder.id} className="flex flex-col gap-0.5 bg-[#F5F0E8] p-2 rounded-[3px] border border-[#1A1A1A]/30">
            <p className="text-xs font-medium text-[#1A1A1A] truncate font-sans">{reminder.title}</p>
            <p className="text-[11px] text-[#544C40] font-mono">{format(new Date(reminder.fireAt), "MMM d, h:mm a")}</p>
          </div>
        ))}
        {upcoming.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-[#544C40] font-sans">
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
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#FDFAF4] text-[#1A1A1A] border border-[#1A1A1A] shadow-[1px_1px_0px_0px_#1A1A1A] flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Monthly Ledger</h3>
        </div>
        <span className="badge-sendlinks">CASH</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-1">
        <p className="text-[11px] text-[#544C40] uppercase font-mono tracking-wider">Net Balance</p>
        <h4 className="font-serif text-2xl md:text-3xl font-normal text-[#1A1A1A]">{formatCurrency(net, false)}</h4>
        
        {size === 'large' && (
          <div className="flex gap-4 mt-3 pt-2 border-t border-[#1A1A1A]/10">
            <div>
              <p className="text-[10px] text-[#544C40] uppercase font-mono">Inflow</p>
              <p className="text-xs font-mono font-medium text-[#1A1A1A]">{formatCurrency(income, true)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#544C40] uppercase font-mono">Outflow</p>
              <p className="text-xs font-mono font-medium text-[#FF4D00]">{formatCurrency(expense, true)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
