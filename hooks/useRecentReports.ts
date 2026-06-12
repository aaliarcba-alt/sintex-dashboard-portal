'use client';

import { useState, useEffect, useCallback } from 'react';

const RECENT_KEY = 'sintex_recent';
const MAX_RECENT = 6;

export function useRecentReports() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecent(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { recent, addRecent };
}
