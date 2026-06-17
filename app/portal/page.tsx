'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, LogOut, Shield, BarChart3, Sparkles, AppWindow, Zap, X, Star, Sun, Moon, ChevronDown } from 'lucide-react';
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

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const isActive = value !== 'All';
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none"
        style={isActive
          ? { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)', color: '#A78BFA' }
          : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text2)' }
        }
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>
            {o === 'All' ? label : o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3"
        style={{ color: isActive ? '#A78BFA' : 'var(--text2)' }} />
    </div>
  );
}

export default function PortalPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSubdiv, setSelectedSubdiv] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);

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

  const departments = useMemo(() => {
    const d = Array.from(new Set(apps.map(a => a.dept_name).filter(Boolean))).sort();
    return ['All', ...d];
  }, [apps]);

  const subdivisions = useMemo(() => {
    const base = selectedDept === 'All' ? apps : apps.filter(a => a.dept_name === selectedDept);
    const s = Array.from(new Set(base.map(a => a.subdivision).filter(Boolean))).sort();
    return ['All', ...s];
  }, [apps, selectedDept]);

  const handleDeptChange = (v: string) => {
    setSelectedDept(v);
    setSelectedSubdiv('All');
  };

  // Counts per type (unfiltered by type, so stat boxes always show total)
  const dashboardCount = useMemo(() => apps.filter(a => a.app_type === 'Dashboard').length, [apps]);
  const genieCount = useMemo(() => apps.filter(a => a.app_type === 'Genie').length, [apps]);
  const appCount = useMemo(() => apps.filter(a => a.app_type === 'Application').length, [apps]);

  const filtered = useMemo(() => apps.filter(a => {
    const matchSearch = !search ||
      a.app_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = selectedStatus === 'All' || a.app_status === selectedStatus;
    const matchType = selectedType === 'All' || a.app_type === selectedType;
    const matchDept = selectedDept === 'All' || a.dept_name === selectedDept;
    const matchSubdiv = selectedSubdiv === 'All' || a.subdivision === selectedSubdiv;
    return matchSearch && matchStatus && matchType && matchDept && matchSubdiv;
  }), [apps, search, selectedStatus, selectedType, selectedDept, selectedSubdiv]);

  const isAdmin = (user?.access_level ?? 99) <= 1;
  const hasActiveFilters = search || selectedStatus !== 'All' || selectedType !== 'All' || selectedDept !== 'All' || selectedSubdiv !== 'All';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const statusBtnStyle = (active: boolean): React.CSSProperties => active
    ? { background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.5)', color: 'var(--primary)' }
    : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text2)' };

  // Stat boxes config — clicking sets the type filter
  const statCards = [
    {
      type: 'Dashboard',
      label: 'Dashboards',
      value: dashboardCount,
      icon: BarChart3,
      activeColor: '#00D4FF',
      activeBg: 'rgba(0,212,255,0.15)',
      activeBorder: 'rgba(0,212,255,0.4)',
      glow: 'rgba(0,212,255,0.15)',
    },
    {
      type: 'Genie',
      label: 'Genie',
      value: genieCount,
      icon: Sparkles,
      activeColor: '#A78BFA',
      activeBg: 'rgba(124,58,237,0.15)',
      activeBorder: 'rgba(124,58,237,0.4)',
      glow: 'rgba(124,58,237,0.15)',
    },
    {
      type: 'Application',
      label: 'Applications',
      value: appCount,
      icon: AppWindow,
      activeColor: '#34D399',
      activeBg: 'rgba(52,211,153,0.15)',
      activeBorder: 'rgba(52,211,153,0.4)',
      glow: 'rgba(52,211,153,0.15)',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen grid-bg">
        <div className="h-16 border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border)' }} />
        <div className="max-w-screen-2xl mx-auto px-6 pt-8">
          <div className="h-8 w-64 skeleton rounded-xl mb-2" />
          <div className="h-4 w-40 skeleton rounded-lg mb-8" />
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
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
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary-dim), var(--purple-dim))', border: '1px solid var(--border-glow)' }}>
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Sintex</span>
              <span className="text-sm font-medium ml-1" style={{ color: 'var(--text2)' }}>Digital Portal</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text2)' }} />
              <input
                type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search dashboards, tags…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)' }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {isAdmin && (
              <button onClick={() => router.push('/admin')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium btn-cyan">
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text2)' }}
              aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))', color: 'white' }}>
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

        {/* ── Hero: welcome + 3 stat boxes ── */}
        <section className="py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.username}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
              {user?.role_name} · {apps.length} dashboards available
            </p>
          </motion.div>

          {/* 3 clickable stat cards that also act as type filters */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-3 flex-wrap">
            {statCards.map((card, i) => {
              const isActive = selectedType === card.type;
              return (
                <motion.button
                  key={card.type}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => setSelectedType(isActive ? 'All' : card.type)}
                  className="rounded-2xl p-4 text-left transition-all min-w-[140px]"
                  style={{
                    background: isActive ? card.activeBg : 'var(--surface)',
                    border: `1px solid ${isActive ? card.activeBorder : 'var(--border)'}`,
                    boxShadow: isActive ? `0 0 24px ${card.glow}` : `0 0 12px ${card.glow}`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: card.glow }}>
                    <card.icon className="w-4 h-4" style={{ color: card.activeColor }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: card.activeColor }}>{card.value}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: isActive ? card.activeColor : 'var(--text2)' }}>
                    {card.label}
                    {isActive && <span className="text-xs opacity-60">✕</span>}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ── Favourites section ── */}
        {favorites.length > 0 && (() => {
          const favApps = apps.filter(a => favorites.includes(a.app_id));
          return favApps.length > 0 ? (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Favourites</span>
                <span className="text-xs px-2 py-0.5 rounded-lg"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#FBBF24' }}>
                  {favApps.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {favApps.map((app, i) => (
                  <AppCard key={app.app_id} app={app} index={i} isFavorite={true} onToggleFavorite={toggleFav} />
                ))}
              </div>
              <div className="mt-4 border-t" style={{ borderColor: 'var(--border)' }} />
            </section>
          ) : null;
        })()}

        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

          {/* Left: All / Live / UAT */}
          <div className="flex items-center gap-2">
            {statuses.map(s => (
              <button key={s} onClick={() => setSelectedStatus(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={statusBtnStyle(selectedStatus === s)}>
                {s !== 'All' && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${s === 'Live' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                )}
                {s}
              </button>
            ))}
          </div>

          {/* Right: Dept + Subdivision dropdowns + count + clear */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterDropdown
              label="All Departments"
              value={selectedDept}
              options={departments}
              onChange={handleDeptChange}
            />
            {selectedDept !== 'All' && subdivisions.length > 2 && (
              <FilterDropdown
                label="All Subdivisions"
                value={selectedSubdiv}
                options={subdivisions}
                onChange={setSelectedSubdiv}
              />
            )}
            <span className="text-xs px-2" style={{ color: 'var(--text2)' }}>{filtered.length} of {apps.length}</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setSelectedStatus('All'); setSelectedType('All'); setSelectedDept('All'); setSelectedSubdiv('All'); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(255,45,155,0.1)', border: '1px solid rgba(255,45,155,0.3)', color: '#FF2D9B' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Card grid ── */}
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