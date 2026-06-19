'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, LogOut, Star, Search, ChevronDown, X, User, KeyRound, Eye, EyeOff
} from 'lucide-react';
import AppCard from '@/components/AppCard';

interface App {
  app_id: number;
  app_name: string;
  app_type: string;
  app_status: string;
  url_link: string;
  dept_name: string;
  subdivision: string;
  description: string;
  tags: string[];
  can_export: boolean;
  can_embed: boolean;
}

interface SessionUser {
  user_id: number;
  username: string;
  email: string;
  role_name: string;
  access_level: number;
  dept_id: number;
}

function FilterDropdown({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium cursor-pointer focus:outline-none focus:ring-2"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o === 'All' ? label : o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text2)' }} />
    </div>
  );
}

/* ── Change Password Modal ─────────────────── */
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

  const PasswordInput = ({
    value, onChange, show, onToggle, placeholder,
  }: { value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder: string }) => (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2"
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
      >
        {show ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text2)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text2)' }} />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
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
              <PasswordInput value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>New Password</label>
              <PasswordInput value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Enter new password" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Confirm New Password</label>
              <PasswordInput value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} placeholder="Confirm new password" />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all btn-cyan disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── User Avatar Dropdown ──────────────────── */
function UserDropdown({ user, onChangePassword, onLogout }: {
  user: SessionUser;
  onChangePassword: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:opacity-90"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--primary)', color: '#000' }}
        >
          {initials}
        </div>
        <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--text)' }}>
          {user.username.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text2)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl z-40 py-1"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.username}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text2)' }}>{user.email}</p>
            <span
              className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--primary)' }}
            >
              {user.role_name}
            </span>
          </div>

          {/* Change Password */}
          <button
            onClick={() => { setOpen(false); onChangePassword(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left"
            style={{ color: 'var(--text)' }}
          >
            <KeyRound className="w-4 h-4" style={{ color: 'var(--text2)' }} />
            Change Password
          </button>

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left border-t"
            style={{ color: '#f87171', borderColor: 'var(--border)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Portal Page ──────────────────────── */
export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSubdiv, setSelectedSubdiv] = useState('All');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('sintex_theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sintex_theme', next);
  }

  useEffect(() => {
    async function load() {
      try {
        const [meRes, appsRes, favsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/apps'),
          fetch('/api/favourites'),
        ]);
        if (!meRes.ok) { router.push('/login'); return; }
        const [meData, appsData, favsData] = await Promise.all([
          meRes.json(), appsRes.json(), favsRes.json(),
        ]);
        setUser(meData.user);
        setApps(appsData.apps || []);
        setFavorites((favsData.favourites || []).map((f: { app_id: number }) => f.app_id));
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const toggleFav = useCallback((appId: number) => {
    setFavorites((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  }, []);

  const statuses = ['All', 'Live', 'UAT', 'Favourites'];

  const departments = useMemo(() => {
    const depts = Array.from(new Set(apps.map((a) => a.dept_name).filter(Boolean))).sort();
    return ['All', ...depts];
  }, [apps]);

  const subdivisions = useMemo(() => {
    const base = selectedDept === 'All' ? apps : apps.filter((a) => a.dept_name === selectedDept);
    const s = Array.from(new Set(base.map((a) => a.subdivision).filter(Boolean))).sort();
    return ['All', ...s];
  }, [apps, selectedDept]);

  function handleDeptChange(val: string) {
    setSelectedDept(val);
    setSelectedSubdiv('All');
  }

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      if (selectedStatus === 'Favourites' && !favorites.includes(app.app_id)) return false;
      if (selectedStatus !== 'All' && selectedStatus !== 'Favourites' && app.app_status !== selectedStatus) return false;
      if (selectedDept !== 'All' && app.dept_name !== selectedDept) return false;
      if (selectedSubdiv !== 'All' && app.subdivision !== selectedSubdiv) return false;
      if (search && !app.app_name.toLowerCase().includes(search.toLowerCase()) &&
        !app.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [apps, selectedStatus, selectedDept, selectedSubdiv, search, favorites]);

  const liveCount = apps.filter((a) => a.app_status === 'Live').length;
  const uatCount = apps.filter((a) => a.app_status === 'UAT').length;
  const favCount = favorites.length;

  const statusBtnStyle = (active: boolean) => ({
    background: active ? 'var(--primary)' : 'var(--surface2)',
    color: active ? '#000' : 'var(--text2)',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <Zap className="w-10 h-10 mx-auto mb-3 animate-pulse" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text2)' }}>Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--bg)' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-30 px-4 md:px-8 py-3 flex items-center gap-3"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-sm hidden sm:block" style={{ color: 'var(--text)' }}>Sintex Digital Portal</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text2)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dashboards..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Dept + Subdiv filters in navbar */}
        <div className="hidden md:flex items-center gap-2">
          <FilterDropdown label="All Departments" value={selectedDept} options={departments} onChange={handleDeptChange} />
          {selectedDept !== 'All' && (
            <FilterDropdown label="All Subdivisions" value={selectedSubdiv} options={subdivisions} onChange={setSelectedSubdiv} />
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-80 text-base"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Admin link */}
          {user && user.access_level <= 1 && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden sm:block px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,212,255,0.2)' }}
            >
              Admin
            </button>
          )}

          {/* User avatar dropdown */}
          {user && (
            <UserDropdown
              user={user}
              onChangePassword={() => setShowChangePassword(true)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.username.split(' ')[0]}</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Your command centre for all Sintex digital tools</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Apps', value: apps.length, color: 'var(--primary)' },
            { label: 'Live', value: liveCount, color: '#22c55e' },
            { label: 'UAT', value: uatCount, color: '#a78bfa' },
            { label: 'Favourites', value: favCount, color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Status filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
                style={statusBtnStyle(selectedStatus === s)}
              >
                {s === 'Favourites' && <Star className="w-3 h-3" />}
                {s === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                {s === 'UAT' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />}
                {s}
              </button>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--text2)' }}>{filtered.length} of {apps.length}</span>
        </div>

        {/* Mobile dept filters */}
        <div className="flex md:hidden items-center gap-2 mb-4 flex-wrap">
          <FilterDropdown label="All Departments" value={selectedDept} options={departments} onChange={handleDeptChange} />
          {selectedDept !== 'All' && (
            <FilterDropdown label="All Subdivisions" value={selectedSubdiv} options={subdivisions} onChange={setSelectedSubdiv} />
          )}
        </div>

        {/* Card grid */}
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