// app/portal/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LogOut, Shield, BarChart3, Sparkles, AppWindow,
  X, Star, Sun, Moon, ChevronDown,
} from 'lucide-react';
import AppCard from '@/components/AppCard';
import SkeletonCard from '@/components/SkeletonCard';

interface App {
  app_id: number;
  app_name: string;
  app_type: string;
  app_status: string;
  description: string;
  url_link: string;
  dept_name: string;
  subdivision: string;
  tags: string[];
  can_export: boolean;
  can_embed: boolean;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  role_name: string;
  access_level: number;
}

// ── Theme hook ────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sintex_theme') as 'dark' | 'light' | null;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('sintex_theme', next); } catch {}
  };

  return { theme, toggleTheme };
}

// ── Dropdown ──────────────────────────────────────────────────
function FilterDropdown({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const isActive = value !== 'All';
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none"
        style={
          isActive
            ? { background: 'var(--primary)', color: '#000', border: 'none' }
            : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }
        }
      >
        <option value="All">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
        style={{ color: isActive ? '#000' : 'var(--text2)' }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function PortalPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser]               = useState<User | null>(null);
  const [apps, setApps]               = useState<App[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDept, setSelectedDept]     = useState('All');
  const [selectedSubdiv, setSelectedSubdiv] = useState('All');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favourites, setFavourites]   = useState<number[]>([]);

  // ── Load user, apps, favourites ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const { user } = await meRes.json();
      setUser(user);

      const [appsRes, favRes] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/favourites'),
      ]);

      if (appsRes.ok) {
        const { apps } = await appsRes.json();
        setApps(apps);
      }

      if (favRes.ok) {
        const { favourites } = await favRes.json();
        setFavourites(favourites);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  // ── Toggle favourite (optimistic) ───────────────────────────
  const toggleFav = useCallback((id: number) => {
    setFavourites(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  // ── Derived filter options ───────────────────────────────────
  const depts = useMemo(() => {
    const set = new Set(apps.map(a => a.dept_name).filter(Boolean));
    return Array.from(set).sort();
  }, [apps]);

  const subdivs = useMemo(() => {
    const base = selectedDept === 'All' ? apps : apps.filter(a => a.dept_name === selectedDept);
    const set = new Set(base.map(a => a.subdivision).filter(Boolean));
    return Array.from(set).sort();
  }, [apps, selectedDept]);

  // Reset subdivision when dept changes
  useEffect(() => { setSelectedSubdiv('All'); }, [selectedDept]);

  // ── Filtered apps ────────────────────────────────────────────
  const filtered = useMemo(() => {
    return apps.filter(app => {
      if (showFavOnly && !favourites.includes(app.app_id)) return false;
      if (selectedStatus !== 'All' && app.app_status !== selectedStatus) return false;
      if (selectedDept !== 'All' && app.dept_name !== selectedDept) return false;
      if (selectedSubdiv !== 'All' && app.subdivision !== selectedSubdiv) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          app.app_name.toLowerCase().includes(q) ||
          (app.description ?? '').toLowerCase().includes(q) ||
          (app.dept_name ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [apps, search, selectedStatus, selectedDept, selectedSubdiv, showFavOnly, favourites]);

  // ── Stat counts ──────────────────────────────────────────────
  const counts = useMemo(() => ({
    Dashboard: apps.filter(a => a.app_type === 'Dashboard').length,
    Genie: apps.filter(a => a.app_type === 'Genie').length,
    Application: apps.filter(a => a.app_type === 'Application').length,
  }), [apps]);

  // ── Helpers ──────────────────────────────────────────────────
  const clearAll = () => {
    setSearch(''); setSelectedStatus('All');
    setSelectedDept('All'); setSelectedSubdiv('All');
    setShowFavOnly(false);
  };

  const hasFilters = search || selectedStatus !== 'All' || selectedDept !== 'All' ||
    selectedSubdiv !== 'All' || showFavOnly;

  const statCards = [
    { label: 'Dashboards', count: counts.Dashboard, icon: <BarChart3 className="w-5 h-5" />, type: 'Dashboard' },
    { label: 'Genie', count: counts.Genie, icon: <Sparkles className="w-5 h-5" />, type: 'Genie' },
    { label: 'Applications', count: counts.Application, icon: <AppWindow className="w-5 h-5" />, type: 'Application' },
  ];

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <span className="font-bold text-sm tracking-tight whitespace-nowrap" style={{ color: 'var(--primary)' }}>
          Sintex Digital Portal
        </span>

        {/* Search */}
        <div className="relative flex-1 max-w-sm ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text2)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none"
            style={{
              background: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3" style={{ color: 'var(--text2)' }} />
            </button>
          )}
        </div>

        {/* Dept + Subdiv dropdowns */}
        <div className="hidden md:flex items-center gap-2">
          <FilterDropdown label="Department" value={selectedDept} options={depts} onChange={setSelectedDept} />
          {subdivs.length > 0 && (
            <FilterDropdown label="Subdivision" value={selectedSubdiv} options={subdivs} onChange={setSelectedSubdiv} />
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin button (access_level 1 only) */}
          {user?.access_level === 1 && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          )}

          {/* Logout */}
          <button
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="px-4 md:px-6 py-6 max-w-7xl mx-auto">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            Welcome back, {user?.username ?? '…'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
            {user?.role_name} · {apps.length} apps available
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {statCards.map(({ label, count, icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl p-4 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <span
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: 'var(--surface2)', color: 'var(--primary)' }}
              >
                {icon}
              </span>
              <div>
                <p className="text-xl font-bold leading-none" style={{ color: 'var(--text)' }}>{count}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {/* Status pills */}
          {['All', 'Live', 'UAT'].map(s => {
            const active = selectedStatus === s && !showFavOnly;
            return (
              <button
                key={s}
                onClick={() => { setSelectedStatus(s); setShowFavOnly(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={
                  active
                    ? { background: 'var(--primary)', color: '#000' }
                    : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }
                }
              >
                {s !== 'All' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s === 'Live' ? '#22c55e' : '#f59e0b' }}
                  />
                )}
                {s}
              </button>
            );
          })}

          {/* Favourites pill */}
          <button
            onClick={() => setShowFavOnly(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={
              showFavOnly
                ? { background: '#f59e0b', color: '#000' }
                : { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }
            }
          >
            <Star className={`w-3 h-3 ${showFavOnly ? 'fill-black' : ''}`} />
            Favourites
            {favourites.length > 0 && (
              <span
                className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: showFavOnly ? 'rgba(0,0,0,0.2)' : 'var(--border)', color: showFavOnly ? '#000' : 'var(--text2)' }}
              >
                {favourites.length}
              </span>
            )}
          </button>

          {/* Mobile dropdowns */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <FilterDropdown label="Dept" value={selectedDept} options={depts} onChange={setSelectedDept} />
            {subdivs.length > 0 && (
              <FilterDropdown label="Subdiv" value={selectedSubdiv} options={subdivs} onChange={setSelectedSubdiv} />
            )}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
          {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* App grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Search className="w-10 h-10 opacity-20" style={{ color: 'var(--text2)' }} />
            <p className="text-sm" style={{ color: 'var(--text2)' }}>No apps match your filters.</p>
            <button onClick={clearAll} className="btn-cyan text-xs px-4 py-2 rounded-xl">Clear filters</button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map(app => (
                <AppCard
                  key={app.app_id}
                  app={app}
                  isFav={favourites.includes(app.app_id)}
                  onToggleFav={toggleFav}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}