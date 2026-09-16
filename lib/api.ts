import { useState, useEffect, useCallback } from 'react';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // --- LOCAL MOCK API INTERCEPTOR ---
  if (
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    endpoint === '/api/todos/tasks.php'
  ) {
    const MOCK_KEY = 'base:mock-todos';
    let mockTasks: any[] = [];
    
    try {
      const stored = sessionStorage.getItem(MOCK_KEY);
      if (stored) {
        mockTasks = JSON.parse(stored);
      } else {
        try {
          const res = await fetch('/dev-demo-data/mock-db.json');
          if (res.ok) {
            const data = await res.json();
            if (data.tasks) {
              mockTasks = data.tasks;
            }
          }
        } catch (e) {
          // ignore fetch error
        }
        sessionStorage.setItem(MOCK_KEY, JSON.stringify(mockTasks));
      }
    } catch (e) {
      console.error('Mock API Error:', e);
    }

    const method = options.method || 'GET';

    if (method === 'GET') {
      return { success: true, tasks: mockTasks };
    }

    if (method === 'PUT') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      
      if (body.action === 'toggle') {
        mockTasks = mockTasks.map(t => 
          t.id === body.id ? { ...t, completed: body.completed, updatedAt: new Date().toISOString() } : t
        );
        sessionStorage.setItem(MOCK_KEY, JSON.stringify(mockTasks));
        return { success: true };
      }

      const existingIndex = mockTasks.findIndex(t => t.id === body.id);
      if (existingIndex >= 0) {
        mockTasks[existingIndex] = { ...mockTasks[existingIndex], ...body, updatedAt: new Date().toISOString() };
      } else {
        const newTask = {
          id: body.id || crypto.randomUUID(),
          listId: body.listId,
          parentTaskId: body.parentTaskId || null,
          title: body.title,
          description: body.description || null,
          completed: body.completed || false,
          dueDate: body.dueDate || null,
          priority: body.priority || 'medium',
          status: body.status || 'pending',
          position: mockTasks.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockTasks.push(newTask);
      }
      
      sessionStorage.setItem(MOCK_KEY, JSON.stringify(mockTasks));
      return { success: true };
    }

    if (method === 'DELETE') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      mockTasks = mockTasks.filter(t => t.id !== body.id);
      sessionStorage.setItem(MOCK_KEY, JSON.stringify(mockTasks));
      return { success: true };
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


