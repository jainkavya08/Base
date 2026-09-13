import Dexie, { type EntityTable } from 'dexie';

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekly";
  targetCount: number; // e.g., 1 for daily, 3 for weekly
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  todoId?: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  priority: "low" | "medium" | "high";
  projectId?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  fireAt: string; // ISO string
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

const db = new Dexie('PersonalDashboardDB') as Dexie & {
  habits: EntityTable<Habit, 'id'>;
  habitCompletions: EntityTable<HabitCompletion, 'id'>;
  pomodoroSessions: EntityTable<PomodoroSession, 'id'>;
  todos: EntityTable<Todo, 'id'>;
  reminders: EntityTable<Reminder, 'id'>;
  financeTransactions: EntityTable<FinanceTransaction, 'id'>;
};

db.version(1).stores({
  habits: 'id, title, frequency, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId',
  todos: 'id, completed, dueDate, priority, projectId',
  reminders: 'id, fireAt',
  financeTransactions: 'id, type, date, category'
});

export { db };
