'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, LogOut, Shield, BarChart3, Layers, Sparkles, Zap, X, Star, Sun, Moon } from 'lucide-react';
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

export default function PortalPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavOnly, setShowFavOnly] = useState(false);

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const { user } = await meRes.json();
      setUser(user);

      const appsRes = await fetch('/api/apps');
      if (appsRes.ok) {
        const { apps } = await appsRes.json();
        setApps(apps);
      }

      try {
        const stored = localStorage.getItem('sintex_favs');
        if (stored) setFavorites(JSON.parse(stored));
      } catch {}

      setLoading(false);
    };
    init();
  }, [router]);

  const toggleFav = (id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('sintex_favs', JSON.stringify(next));
      return next;
    });
  };

  const statuses = ['All', 'Live', 'UAT'];

  // Build unique department list from actual app data
  const departments = useMemo(() => {
    const depts = Array.from(new Set(apps.map(a => a.dept_name).filter(Boolean))).sort();
    return ['All', ...depts];
  }, [apps]);

  const filtered = useMemo(() => apps.filter(a => {
    const matchSearch = !search || a.app_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = selectedStatus === 'All' || a.app_status === selectedStatus;
    const matchDept = selectedDept === 'All' || a.dept_name === selectedDept;
    const matchFav = !showFavOnly || favorites.includes(a.app_id);
    return matchSearch && matchStatus && matchDept && matchFav;
  }), [apps, search, selectedStatus, selectedDept, favorites, showFavOnly]);

  const favApps = useMemo(() => apps.filter(a => favorites.includes(a.app_id)), [apps, favorites]);
  const deptCount = new Set(apps.map(a => a.dept_name)).size;
  const isAdmin = (user?.access_level ?? 99) <= 1;
  const hasActiveFilters = search || selectedStatus !== 'All' || selectedDept !== 'All' || showFavOnly;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isDark = theme === 'dark';

  const filterBtn = (active: boolean, color: 'cyan' | 'amber' | 'purple') => {
    const colors = {
      cyan: { active: { background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.5)', color: 'var(--primary)' }, inactive: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text2)' } },
      amber: { active: { background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', color: '#FBBF24' }, inactive: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text2)' } },
      purple: { active: { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)', color: '#A78BFA' }, inactive: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text2)' } },
    };
    return active ? colors[color].active : colors[color].inactive;
  };

  if (loading) {
    return (
      <div className="min-h-screen grid-bg">
        <div className="h-16 border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border)' }} />
        <div className="max-w-screen-2xl mx-auto px-6 pt-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-dim), var(--purple-dim))', border: '1px solid var(--border-glow)' }}>
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Sintex</span>
              <span className="text-sm font-medium ml-1" style={{ color: 'var(--text2)' }}>Digital Portal</span>
            </div>
          </div>

          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text2)' }} />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search dashboards, tags…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {isAdmin && (
              <button onClick={() => router.push('/admin')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium btn-cyan">
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text2)' }}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))', color: 'white' }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: 'var(--text2)' }}>{user?.username}</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-xl transition-colors hover:opacity-80" style={{ color: 'var(--text2)' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-16">
        {/* Hero */}
        <section className="py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.username}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
              {user?.role_name} · {apps.length} dashboards available
            </p>
          </motion.div>

          {/* 2-col KPI cards: Total Dashboards + Departments only */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { icon: BarChart3, label: 'Total Dashboards', value: apps.length, color: 'text-cyan-400', glowColor: 'var(--primary)', glow: 'rgba(0,212,255,0.15)' },
              { icon: Layers, label: 'Departments', value: deptCount, color: 'text-purple-400', glowColor: 'var(--purple)', glow: 'rgba(124,58,237,0.15)' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: `0 0 20px ${stat.glow}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.glow }}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Favourites section */}
        {favApps.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Favourites</span>
              <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#FBBF24' }}>{favApps.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {favApps.map((app, i) => (
                <AppCard key={app.app_id} app={app} index={i} isFavorite={true} onToggleFavorite={toggleFav} />
              ))}
            </div>
            <div className="mt-4 border-t" style={{ borderColor: 'var(--border)' }} />
          </section>
        )}

        {/* Filter bar — status left, dept right, count + clear far right */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Left group: All / Live / UAT / Favourites */}
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setSelectedStatus(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={filterBtn(selectedStatus === s, 'cyan')}>
                {s !== 'All' && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${s === 'Live' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                )}
                {s}
              </button>
            ))}

            <button
              onClick={() => setShowFavOnly(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={filterBtn(showFavOnly, 'amber')}>
              <Star className={`w-3 h-3 ${showFavOnly ? 'fill-amber-400' : ''}`} />
              Favourites
            </button>
          </div>

          {/* Separator */}
          <div className="hidden sm:block h-4 w-px mx-1" style={{ background: 'var(--border)' }} />

          {/* Right group: Department filters */}
          <div className="flex gap-1.5 flex-wrap">
            {departments.map(dept => (
              <button key={dept} onClick={() => setSelectedDept(dept)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={filterBtn(selectedDept === dept, 'purple')}>
                {dept}
              </button>
            ))}
          </div>

          {/* Count + clear */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className="text-xs" style={{ color: 'var(--text2)' }}>{filtered.length} of {apps.length}</span>
            {hasActiveFilters && (
              <button onClick={() => { setSearch(''); setSelectedStatus('All'); setSelectedDept('All'); setShowFavOnly(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(255,45,155,0.1)', border: '1px solid rgba(255,45,155,0.3)', color: '#FF2D9B' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--primary)', opacity: 0.3 }} />
            <p className="font-medium" style={{ color: 'var(--text)' }}>No dashboards found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filtered.map((app, i) => (
              <AppCard key={app.app_id} app={app} index={i} isFavorite={favorites.includes(app.app_id)} onToggleFavorite={toggleFav} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
