import { useState, useEffect, useCallback } from 'react';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // --- LOCAL MOCK API INTERCEPTOR FOR DEVELOPMENT ---
  if (
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    endpoint.startsWith('/api/')
  ) {
    const MOCK_STORAGE_KEY = 'base:mock-db-v1';
    let mockDb: any = null;

    try {
      const stored = sessionStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        mockDb = JSON.parse(stored);
      } else {
        try {
          const res = await fetch('/dev-demo-data/mock-db.json');
          if (res.ok) {
            mockDb = await res.json();
          }
        } catch (e) {
          // ignore
        }
        if (!mockDb) {
          mockDb = {
            habits: [],
            completions: [],
            reminders: [],
            tasks: [],
            files: [],
            lists: [],
            accounts: [],
            transactions: []
          };
        }
        sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockDb));
      }
    } catch (e) {
      console.error('Mock DB error:', e);
    }

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    const saveDb = () => {
      try {
        sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockDb));
      } catch (e) {}
    };

    if (endpoint === '/api/habits/habits.php') {
      if (method === 'GET') return { success: true, habits: mockDb.habits || [] };
      if (method === 'PUT') {
        const idx = (mockDb.habits || []).findIndex((h: any) => h.id === body.id);
        if (idx >= 0) {
          mockDb.habits[idx] = { ...mockDb.habits[idx], ...body };
        } else {
          mockDb.habits.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), ...body });
        }
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.habits = (mockDb.habits || []).filter((h: any) => h.id !== body.id);
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/habits/completions.php') {
      if (method === 'GET') return { success: true, completions: mockDb.completions || [] };
      if (method === 'PUT') {
        mockDb.completions = mockDb.completions || [];
        const existingIdx = mockDb.completions.findIndex((c: any) => c.habitId === body.habitId && c.date === body.date);
        if (existingIdx >= 0) {
          mockDb.completions.splice(existingIdx, 1);
        } else {
          mockDb.completions.push({ id: crypto.randomUUID(), habitId: body.habitId, date: body.date, value: body.value || 1 });
        }
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/reminders/reminders.php') {
      if (method === 'GET') return { success: true, reminders: mockDb.reminders || [] };
      if (method === 'PUT') {
        mockDb.reminders = mockDb.reminders || [];
        const idx = mockDb.reminders.findIndex((r: any) => r.id === body.id);
        if (idx >= 0) {
          mockDb.reminders[idx] = { ...mockDb.reminders[idx], ...body };
        } else {
          mockDb.reminders.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), ...body });
        }
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.reminders = (mockDb.reminders || []).filter((r: any) => r.id !== body.id);
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/todos/files.php') {
      if (method === 'GET') return { success: true, files: mockDb.files || [] };
      if (method === 'PUT') {
        mockDb.files = mockDb.files || [];
        const idx = mockDb.files.findIndex((f: any) => f.id === body.id);
        if (idx >= 0) mockDb.files[idx] = { ...mockDb.files[idx], ...body, updatedAt: new Date().toISOString() };
        else mockDb.files.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body });
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.files = (mockDb.files || []).filter((f: any) => f.id !== body.id);
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/todos/lists.php') {
      if (method === 'GET') return { success: true, lists: mockDb.lists || [] };
      if (method === 'PUT') {
        mockDb.lists = mockDb.lists || [];
        const idx = mockDb.lists.findIndex((l: any) => l.id === body.id);
        if (idx >= 0) mockDb.lists[idx] = { ...mockDb.lists[idx], ...body, updatedAt: new Date().toISOString() };
        else mockDb.lists.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body });
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.lists = (mockDb.lists || []).filter((l: any) => l.id !== body.id);
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/todos/tasks.php') {
      mockDb.tasks = mockDb.tasks || [];
      if (method === 'GET') return { success: true, tasks: mockDb.tasks };
      if (method === 'PUT') {
        if (body.action === 'toggle') {
          mockDb.tasks = mockDb.tasks.map((t: any) =>
            t.id === body.id ? { ...t, completed: body.completed, status: body.completed ? 'completed' : 'todo', updatedAt: new Date().toISOString() } : t
          );
          saveDb();
          return { success: true };
        }
        const idx = mockDb.tasks.findIndex((t: any) => t.id === body.id);
        if (idx >= 0) mockDb.tasks[idx] = { ...mockDb.tasks[idx], ...body, updatedAt: new Date().toISOString() };
        else mockDb.tasks.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body });
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.tasks = mockDb.tasks.filter((t: any) => t.id !== body.id);
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/pomodoro/stats.php' || endpoint === '/api/pomodoro/sessions.php') {
      const todayISO = new Date().toISOString();
      const demoSessions = [
        { id: 'p-1', durationMinutes: 25, completedAt: todayISO, type: 'focus', status: 'completed' },
        { id: 'p-2', durationMinutes: 25, completedAt: todayISO, type: 'focus', status: 'completed' },
        { id: 'p-3', durationMinutes: 25, completedAt: todayISO, type: 'focus', status: 'completed' }
      ];
      return { success: true, sessions: demoSessions };
    }

    if (endpoint === '/api/finance/accounts.php') {
      if (method === 'GET') return { success: true, accounts: mockDb.accounts || [] };
      if (method === 'PUT') {
        mockDb.accounts = mockDb.accounts || [];
        const idx = mockDb.accounts.findIndex((a: any) => a.id === body.id);
        if (idx >= 0) mockDb.accounts[idx] = { ...mockDb.accounts[idx], ...body, updatedAt: new Date().toISOString() };
        else mockDb.accounts.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body });
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.accounts = (mockDb.accounts || []).filter((a: any) => a.id !== body.id);
        saveDb();
        return { success: true };
      }
    }

    if (endpoint === '/api/finance/transactions.php') {
      if (method === 'GET') return { success: true, transactions: mockDb.transactions || [] };
      if (method === 'PUT') {
        mockDb.transactions = mockDb.transactions || [];
        const idx = mockDb.transactions.findIndex((t: any) => t.id === body.id);
        if (idx >= 0) mockDb.transactions[idx] = { ...mockDb.transactions[idx], ...body, updatedAt: new Date().toISOString() };
        else mockDb.transactions.push({ id: body.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body });
        saveDb();
        return { success: true };
      }
      if (method === 'DELETE') {
        mockDb.transactions = (mockDb.transactions || []).filter((t: any) => t.id !== body.id);
        saveDb();
        return { success: true };
      }
    }
  }
  // --- END MOCK API INTERCEPTOR ---

  try {
    const res = await fetch(endpoint, {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If it's a 401 Unauthorized, we might want to redirect to login
    // But since this is a SPA, we can just throw or let the UI handle it.
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      return { success: res.ok, data: await res.text() };
    }
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const fetcher = (url: string) => fetchApi(url).then(res => {
  if (!res.success) throw new Error(res.error || 'Failed to fetch');
  return res;
});


