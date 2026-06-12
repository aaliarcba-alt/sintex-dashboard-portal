'use client';

import { useState, useEffect } from 'react';
import { Search, Sun, Moon, User, BarChart3 } from 'lucide-react';

interface HeaderProps {
  search: string;
  onSearch: (q: string) => void;
}

export default function Header({ search, onSearch }: HeaderProps) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('sintex_theme');
      if (stored === 'dark') setDark(true);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem('sintex_theme', next ? 'dark' : 'light');
    } catch {}
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-[var(--text)] tracking-tight">
                  Sintex
                </span>
                <span className="text-base font-medium text-[var(--muted)]">
                  Analytics Hub
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] -mt-0.5">Dashboard Portal</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <label htmlFor="global-search" className="sr-only">
              Search dashboards
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
                aria-hidden="true"
              />
              <input
                id="global-search"
                type="search"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search dashboards, categories…"
                aria-label="Search dashboards"
                className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl
                  text-[var(--text)] placeholder:text-[var(--muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                  transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
              >
                {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
            )}
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer"
              aria-label="User profile"
              role="button"
              tabIndex={0}
            >
              <User className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
