import { useState, useEffect, useCallback } from 'react';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
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
      window.location.href = '/login';
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


