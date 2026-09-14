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

// ---- New Finance Models (V6) ----

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountType: string;
  accountNumberLast4?: string;
  balance: number;
  currency: string;
  color?: string;
  logo?: string; // base64 or object URL (persistent)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringPayment {
  id: string;
  name: string;
  accountId: string;
  amount: number;
  categoryId: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  platform?: string;
  symbol?: string;
  quantity?: number;
  investedAmount: number;
  currentValue: number;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  type: "owed_by_you" | "owed_to_you";
  personOrOrganization: string;
  title: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate?: string;
  interestRate?: number;
  status: "outstanding" | "partially_paid" | "paid" | "overdue";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: string;
  accountId: string; // Added in V6
  type: "income" | "expense";
  amount: number;
  category: string;
  title?: string;    // Added in V6
  date: string;      // YYYY-MM-DD
  note?: string;     // Legacy support
  notes?: string;    // Added in V6
  recurringPaymentId?: string; // Added in V6
  createdAt: string;
  updatedAt?: string; // Added in V6
}

const db = new Dexie('PersonalDashboardDB') as Dexie & {
  habits: EntityTable<Habit, 'id'>;
  habitCompletions: EntityTable<HabitCompletion, 'id'>;
  pomodoroSessions: EntityTable<PomodoroSession, 'id'>;
  todoFiles: EntityTable<TodoFile, 'id'>;
  todoLists: EntityTable<TodoList, 'id'>;
  todos: EntityTable<Todo, 'id'>;
  reminders: EntityTable<Reminder, 'id'>;
  
  // Finance V6 tables
  financeTransactions: EntityTable<FinanceTransaction, 'id'>;
  bankAccounts: EntityTable<BankAccount, 'id'>;
  categories: EntityTable<Category, 'id'>;
  transfers: EntityTable<Transfer, 'id'>;
  recurringPayments: EntityTable<RecurringPayment, 'id'>;
  investments: EntityTable<Investment, 'id'>;
  debts: EntityTable<Debt, 'id'>;
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

// V6 expands Finance section
db.version(6).stores({
  habits: 'id, title, type, createdAt',
  habitCompletions: 'id, habitId, date, [habitId+date]',
  pomodoroSessions: 'id, completedAt, todoId, type, status',
  todoFiles: 'id, createdAt',
  todoLists: 'id, fileId, createdAt',
  todos: 'id, listId, completed, dueDate, priority, parentTaskId',
  reminders: 'id, fireAt',
  
  financeTransactions: 'id, accountId, type, date, category',
  bankAccounts: 'id, name, accountType, isActive',
  categories: 'id, type, name, isDefault',
  transfers: 'id, fromAccountId, toAccountId, date',
  recurringPayments: 'id, accountId, categoryId, nextDueDate, isActive',
  investments: 'id, type, platform, purchaseDate',
  debts: 'id, type, status, dueDate'
}).upgrade(async (trans) => {
  const transactionsCount = await trans.table('financeTransactions').count();
  
  // If there are existing transactions, create a fallback account and assign them
  if (transactionsCount > 0) {
    const cashAccountId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create default Cash account
    await trans.table('bankAccounts').add({
      id: cashAccountId,
      name: 'Cash',
      bankName: 'Wallet',
      accountType: 'Cash / Wallet',
      balance: 0, // Recalculated if needed, but keeping simple
      currency: 'INR',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      color: '#f5c542'
    });

    // Migrate all old transactions to use this account
    await trans.table('financeTransactions').toCollection().modify((tx: any) => {
      if (!tx.accountId) {
        tx.accountId = cashAccountId;
      }
      if (!tx.updatedAt) {
        tx.updatedAt = tx.createdAt;
      }
      if (!tx.title) {
        tx.title = tx.category || 'Transaction';
      }
    });
  }
});

export { db };
