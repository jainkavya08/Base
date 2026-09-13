import Dexie, { type EntityTable } from 'dexie';

export type HabitType = "daily" | "weekly" | "numeric" | "duration" | "avoid";

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  description?: string;
  activeDays?: number[]; // 0 (Sun) to 6 (Sat)
  target?: number; // e.g., 1 for daily, 3 for weekly, 2000 for ml of water, 60 for minutes
  unit?: string;
  icon?: string;
  color?: string;
  reminderTime?: string;
  paused?: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value?: number; // for tracking numeric/duration progress
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

db.version(2).stores({
  habits: 'id, title, type, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId',
  todos: 'id, completed, dueDate, priority, projectId',
  reminders: 'id, fireAt',
  financeTransactions: 'id, type, date, category'
});

export { db };
