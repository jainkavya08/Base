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
  type?: "focus" | "short_break" | "long_break";
  status?: "completed" | "interrupted" | "skipped";
}

export interface TodoFile {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  fileId: string;
  name: string;
  description?: string;
  defaultView: "list" | "board" | "compact";
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  listId: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  priority: "low" | "medium" | "high";
  status?: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
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
  todoFiles: EntityTable<TodoFile, 'id'>;
  todoLists: EntityTable<TodoList, 'id'>;
  todos: EntityTable<Todo, 'id'>;
  reminders: EntityTable<Reminder, 'id'>;
  financeTransactions: EntityTable<FinanceTransaction, 'id'>;
};

// V2 mapping
db.version(2).stores({
  habits: 'id, title, type, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId',
  todos: 'id, completed, dueDate, priority, projectId',
  reminders: 'id, fireAt',
  financeTransactions: 'id, type, date, category'
});

// V3 adds type/status to PomodoroSession
db.version(3).stores({
  habits: 'id, title, type, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId, type, status',
  todos: 'id, completed, dueDate, priority, projectId',
  reminders: 'id, fireAt',
  financeTransactions: 'id, type, date, category'
}).upgrade(async (trans) => {
  // Update all old sessions to have type="focus" and status="completed"
  return trans.table('pomodoroSessions').toCollection().modify(session => {
    session.type = 'focus';
    session.status = 'completed';
  });
});

// V4 adds todoFiles, todoLists, and updates todos schema
db.version(4).stores({
  habits: 'id, title, type, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId, type, status',
  todoFiles: 'id, createdAt',
  todoLists: 'id, fileId, createdAt',
  todos: 'id, listId, completed, dueDate, priority',
  reminders: 'id, fireAt',
  financeTransactions: 'id, type, date, category'
}).upgrade(async (trans) => {
  // Migrate existing flat todos into a default "General" file and "All Tasks" list
  const todosCount = await trans.table('todos').count();
  if (todosCount > 0) {
    const fileId = crypto.randomUUID();
    const listId = crypto.randomUUID();
    const now = new Date().toISOString();

    await trans.table('todoFiles').add({
      id: fileId,
      name: 'General',
      description: 'Default folder for migrated tasks',
      createdAt: now,
      updatedAt: now
    });

    await trans.table('todoLists').add({
      id: listId,
      fileId: fileId,
      name: 'All Tasks',
      description: 'Migrated tasks',
      defaultView: 'list',
      createdAt: now,
      updatedAt: now
    });

    await trans.table('todos').toCollection().modify((todo: any) => {
      todo.listId = listId;
      todo.updatedAt = todo.createdAt || now;
      delete todo.projectId;
    });
  }
});

// V5 adds parentTaskId to todos
db.version(5).stores({
  habits: 'id, title, type, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId, type, status',
  todoFiles: 'id, createdAt',
  todoLists: 'id, fileId, createdAt',
  todos: 'id, listId, completed, dueDate, priority, parentTaskId',
  reminders: 'id, fireAt',
  financeTransactions: 'id, type, date, category'
});

export { db };
