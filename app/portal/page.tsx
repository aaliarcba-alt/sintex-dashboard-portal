'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, LogOut, Shield, BarChart3, Sparkles, MonitorDot, Zap, X, Star, Sun, Moon, ChevronDown, KeyRound, Eye, EyeOff } from 'lucide-react';
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

interface Dept {
  dept_id: number;
  dept_name: string;
  subdivision: string;
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

function FilterDropdown({ label, value, options, onChange, compact }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; compact?: boolean;
}) {
  const isActive = value !== 'All';
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none"
        style={{
          paddingTop: '6px',
          paddingBottom: '6px',
          ...(isActive
            ? { background: 'var(--filter-active-bg)', border: '1px solid var(--filter-active-border)', color: 'var(--filter-active-text)' }
            : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text2)' }
          )
        }}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>
            {o === 'All' ? label : o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3"
        style={{ color: isActive ? 'var(--filter-active-text)' : 'var(--text2)' }} />
    </div>
  );
}

/* ── Change Password Modal ── */
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!current || !newPw || !confirm) { setError('All fields are required'); return; }
    if (newPw !== confirm) { setError('New passwords do not match'); return; }
    if (newPw.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPw === current) { setError('New password must be different from current password'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to change password'); return; }
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const PwInput = ({ value, onChange, show, onToggle, placeholder }: {
    value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder: string;
  }) => (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 rounded-lg text-sm focus:outline-none"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
        {show ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text2)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text2)' }} />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Change Password</h2>
          </div>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-5 h-5" style={{ color: 'var(--text)' }} />
          </button>
        </div>
        {success ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-medium" style={{ color: 'var(--text)' }}>Password updated successfully!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Current Password</label>
              <PwInput value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>New Password</label>
              <PwInput value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Enter new password" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Confirm New Password</label>
              <PwInput value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} placeholder="Confirm new password" />
            </div>
            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>{error}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'var(--input-bg)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-semibold btn-cyan disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [deptTree, setDeptTree] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSubdiv, setSelectedSubdiv] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      const deptRes = await fetch('/api/admin/departments');
      if (deptRes.ok) {
        const { depts } = await deptRes.json();
        setDeptTree(depts);
      }

      try {
        const meData = await fetch('/api/auth/me').then(r => r.json());
        const uid = meData?.user?.user_id;
        if (uid) {
          const stored = localStorage.getItem(`sintex_favs_${uid}`);
          if (stored) setFavorites(JSON.parse(stored));
        }
      } catch {}

      setLoading(false);
    };
    init();
  }, [router]);

  const toggleFav = (id: number) => {
    if (!user) return;
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(`sintex_favs_${user.user_id}`, JSON.stringify(next));
      return next;
    });
  };

  const statuses = ['All', 'Live', 'Development'];

  const departments = useMemo(() => {
    const d = Array.from(new Set(deptTree.map(r => r.dept_name).filter(Boolean))).sort();
    return ['All', ...d];
  }, [deptTree]);

  const subdivisions = useMemo(() => {
    if (selectedDept === 'All') return ['All'];
    const s = deptTree
      .filter(r => r.dept_name === selectedDept)
      .map(r => r.subdivision)
      .filter(Boolean)
      .sort();
    return ['All', ...Array.from(new Set(s))];
  }, [deptTree, selectedDept]);

  const handleDeptChange = (v: string) => {
    setSelectedDept(v);
    setSelectedSubdiv('All');
  };

  const dashboardCount = useMemo(() => apps.filter(a => a.app_type === 'Dashboard').length, [apps]);
  const genieCount = useMemo(() => apps.filter(a => a.app_type === 'Genie').length, [apps]);
  const appCount = useMemo(() => apps.filter(a => a.app_type === 'Other').length, [apps]);

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
  const hasActiveFilters = !!(search || selectedStatus !== 'All' || selectedType !== 'All' || selectedDept !== 'All' || selectedSubdiv !== 'All');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const statusBtnStyle = (active: boolean): React.CSSProperties => active
    ? { background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)', color: 'var(--status-active-text)' }
    : { background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text2)' };

  const statCards = [
    { type: 'Dashboard',  label: 'Dashboards',  value: dashboardCount, icon: BarChart3,  activeColor: 'var(--card-cyan)',   activeBg: 'var(--card-cyan-bg)',   activeBorder: 'var(--card-cyan-border)'   },
    { type: 'Genie',      label: 'Genie',        value: genieCount,     icon: Sparkles,  activeColor: 'var(--card-purple)', activeBg: 'var(--card-purple-bg)', activeBorder: 'var(--card-purple-border)' },
    { type: 'Other',      label: 'Applications', value: appCount,       icon: MonitorDot,activeColor: 'var(--card-green)',  activeBg: 'var(--card-green-bg)',  activeBorder: 'var(--card-green-border)'  },
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

  const favApps = apps.filter(a => favorites.includes(a.app_id));

  return (
    <div className="min-h-screen grid-bg">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary-dim), var(--purple-dim))', border: '1px solid var(--border-glow)' }}>
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}> Welspun Sintex</span>
              <span className="text-sm font-medium ml-1" style={{ color: 'var(--text2)' }}>Digital Portal</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm">
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

          {/* Dept + Subdivision filters */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <FilterDropdown label="All Departments" value={selectedDept} options={departments} onChange={handleDeptChange} compact />
            {selectedDept !== 'All' && (
              <FilterDropdown label="All Subdivisions" value={selectedSubdiv} options={subdivisions} onChange={setSelectedSubdiv} compact />
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setSelectedStatus('All'); setSelectedType('All'); setSelectedDept('All'); setSelectedSubdiv('All'); }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--clear-bg)', border: '1px solid var(--clear-border)', color: 'var(--clear-text)' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
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

            {/* Avatar pill — click opens dropdown with Change Password */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))', color: 'white' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: 'var(--text2)' }}>{user?.username}</span>
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl z-40 py-1"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.username}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text2)' }}>{user?.email}</p>
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}>
                      {user?.role_name}
                    </span>
                  </div>
                  <button
                    onClick={() => { setAvatarOpen(false); setShowChangePassword(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left"
                    style={{ color: 'var(--text)' }}>
                    <KeyRound className="w-4 h-4" style={{ color: 'var(--text2)' }} />
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* Logout — separate icon button, same as original */}
            <button onClick={handleLogout} className="p-2 rounded-xl transition-colors hover:opacity-80" style={{ color: 'var(--text2)' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-16">

        {/* ── Hero ── */}
        <section className="py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.username}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
              {user?.role_name} · {apps.length} dashboards available
            </p>
          </motion.div>

          {/* 3 stat/filter cards — Dashboards, Genie, Applications */}
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
                    cursor: 'pointer',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: card.activeBg }}>
                    <card.icon className="w-4 h-4" style={{ color: card.activeColor }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: card.activeColor }}>{card.value}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-1.5"
                    style={{ color: isActive ? card.activeColor : 'var(--text2)' }}>
                    {card.label}
                    {isActive && <span className="opacity-60">✕</span>}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ── Favourites pinned at top ── */}
        {favApps.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Favourites</span>
              <span className="text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'var(--fav-badge-bg)', border: '1px solid var(--fav-badge-border)', color: 'var(--fav-badge-text)' }}>
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
        )}

        {/* ── Filter bar: Live / Development ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            {statuses.map(s => (
              <button key={s} onClick={() => setSelectedStatus(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={statusBtnStyle(selectedStatus === s)}>
                {s !== 'All' && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${s === 'Live' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                )}
                {s}
              </button>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--text2)' }}>{filtered.length} of {apps.length}</span>
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

      {/* ── Change Password Modal ── */}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}