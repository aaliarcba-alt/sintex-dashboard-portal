'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ClipboardList, Plus, Pencil, Check, X,
  ChevronLeft, KeyRound, Eye, EyeOff, Loader2
} from 'lucide-react';

/* ─── Types ─────────────────────────────────── */
interface App {
  app_id: number; app_name: string; app_type: string;
  app_status: string; url_link: string; dept_name: string;
  subdivision: string; description: string; is_active: boolean;
}
interface User {
  user_id: number; username: string; email: string;
  designation: string; role_name: string; role_id: number;
  is_active: boolean; last_login: string | null;
}
interface Role { role_id: number; role_name: string; }
interface AuditLog {
  log_id: number; username: string; action: string;
  details: string; created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: '#22c55e', LOGIN_FAILED: '#ef4444',
  VIEW: '#00d4ff', PASSWORD_CHANGE: '#f59e0b',
  ADMIN_PASSWORD_RESET: '#a78bfa',
};

/* ─── Reset Password Modal ───────────────────── */
function ResetPasswordModal({ targetUser, onClose }: { targetUser: User; onClose: () => void }) {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    setError('');
    if (!newPw || !confirmPw) { setError('Both fields are required'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUser.user_id, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to reset password'); return; }
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Reset Password</h2>
          </div>
          <button onClick={onClose} className="opacity-50 hover:opacity-100"><X className="w-5 h-5" style={{ color: 'var(--text)' }} /></button>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
          Setting new password for <span className="font-semibold" style={{ color: 'var(--text)' }}>{targetUser.username}</span>
        </p>

        {success ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-medium" style={{ color: 'var(--text)' }}>Password reset successfully!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>New Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
                  {show ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text2)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text2)' }} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Confirm New Password</label>
              <input
                type="password" value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleReset} disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-semibold btn-cyan disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Admin Page ────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'apps' | 'users' | 'audit'>('apps');

  // Apps state
  const [apps, setApps] = useState<App[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [editApp, setEditApp] = useState<App | null>(null);
  const [showAddApp, setShowAddApp] = useState(false);
  const [newApp, setNewApp] = useState({ app_name: '', app_type: 'Dashboard', app_status: 'UAT', url_link: '', dept_name: '', subdivision: '', description: '' });

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', designation: '', role_id: '' });
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => { loadApps(); }, []);

  async function loadApps() {
    setAppsLoading(true);
    try {
      const res = await fetch('/api/admin/apps');
      if (res.status === 401 || res.status === 403) { router.push('/login'); return; }
      const data = await res.json();
      setApps(data.apps || []);
    } finally { setAppsLoading(false); }
  }

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([fetch('/api/admin/users'), fetch('/api/admin/roles')]);
      const [uData, rData] = await Promise.all([uRes.json(), rRes.json()]);
      setUsers(uData.users || []);
      setRoles(rData.roles || []);
    } finally { setUsersLoading(false); }
  }

  async function loadAudit() {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } finally { setAuditLoading(false); }
  }

  function switchTab(t: 'apps' | 'users' | 'audit') {
    setTab(t);
    if (t === 'users' && users.length === 0) loadUsers();
    if (t === 'audit' && auditLogs.length === 0) loadAudit();
  }

  /* ─ Apps CRUD ─ */
  async function saveApp() {
    if (!editApp) return;
    await fetch('/api/admin/apps', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editApp),
    });
    setEditApp(null);
    loadApps();
  }

  async function toggleAppActive(app: App) {
    await fetch('/api/admin/apps', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...app, is_active: !app.is_active }),
    });
    loadApps();
  }

  async function addApp() {
    await fetch('/api/admin/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    });
    setShowAddApp(false);
    setNewApp({ app_name: '', app_type: 'Dashboard', app_status: 'UAT', url_link: '', dept_name: '', subdivision: '', description: '' });
    loadApps();
  }

  /* ─ Users CRUD ─ */
  async function addUser() {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    setShowAddUser(false);
    setNewUser({ username: '', email: '', password: '', designation: '', role_id: '' });
    loadUsers();
  }

  async function toggleUserActive(u: User) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: u.user_id, is_active: !u.is_active }),
    });
    loadUsers();
  }

  async function changeUserRole(userId: number, roleId: number) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role_id: roleId }),
    });
    loadUsers();
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2";
  const inputStyle = { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-30 px-4 md:px-8 py-3 flex items-center gap-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.push('/portal')} className="flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: 'var(--text)' }}>
          <ChevronLeft className="w-4 h-4" /> Portal
        </button>
        <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Admin Panel</span>
      </nav>

      <main className="px-4 md:px-8 py-6 max-w-screen-xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)' }}>
          {([
            { id: 'apps', label: 'Apps', icon: LayoutDashboard },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'audit', label: 'Audit Log', icon: ClipboardList },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => switchTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === id
                ? { background: 'var(--primary)', color: '#000' }
                : { color: 'var(--text2)' }}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ════ APPS TAB ════ */}
        {tab === 'apps' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>All Apps ({apps.length})</h2>
              <button onClick={() => setShowAddApp(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium btn-cyan">
                <Plus className="w-3.5 h-3.5" /> Add App
              </button>
            </div>

            {showAddApp && (
              <div className="rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <input className={inputCls} style={inputStyle} placeholder="App name *" value={newApp.app_name} onChange={e => setNewApp(v => ({ ...v, app_name: e.target.value }))} />
                <input className={inputCls} style={inputStyle} placeholder="URL" value={newApp.url_link} onChange={e => setNewApp(v => ({ ...v, url_link: e.target.value }))} />
                <input className={inputCls} style={inputStyle} placeholder="Department" value={newApp.dept_name} onChange={e => setNewApp(v => ({ ...v, dept_name: e.target.value }))} />
                <input className={inputCls} style={inputStyle} placeholder="Subdivision" value={newApp.subdivision} onChange={e => setNewApp(v => ({ ...v, subdivision: e.target.value }))} />
                <select className={inputCls} style={inputStyle} value={newApp.app_status} onChange={e => setNewApp(v => ({ ...v, app_status: e.target.value }))}>
                  <option>Live</option><option>UAT</option><option>Inactive</option>
                </select>
                <input className={inputCls} style={inputStyle} placeholder="Description" value={newApp.description} onChange={e => setNewApp(v => ({ ...v, description: e.target.value }))} />
                <div className="sm:col-span-2 flex gap-2 justify-end">
                  <button onClick={() => setShowAddApp(false)} className="px-4 py-1.5 rounded-xl text-xs" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
                  <button onClick={addApp} className="px-4 py-1.5 rounded-xl text-xs font-semibold btn-cyan">Save App</button>
                </div>
              </div>
            )}

            {appsLoading ? (
              <div className="text-center py-12" style={{ color: 'var(--text2)' }}>Loading...</div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      {['App Name', 'Status', 'Department', 'URL', 'Active', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app, i) => (
                      <tr key={app.app_id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>
                          {editApp?.app_id === app.app_id
                            ? <input className="px-2 py-1 rounded text-xs w-36" style={inputStyle} value={editApp.app_name} onChange={e => setEditApp(v => v ? { ...v, app_name: e.target.value } : v)} />
                            : app.app_name}
                        </td>
                        <td className="px-4 py-3">
                          {editApp?.app_id === app.app_id
                            ? <select className="px-2 py-1 rounded text-xs" style={inputStyle} value={editApp.app_status} onChange={e => setEditApp(v => v ? { ...v, app_status: e.target.value } : v)}>
                                <option>Live</option><option>UAT</option><option>Inactive</option>
                              </select>
                            : <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: app.app_status === 'Live' ? 'rgba(0,212,255,0.12)' : 'rgba(167,139,250,0.12)', color: app.app_status === 'Live' ? '#00d4ff' : '#a78bfa' }}>
                                {app.app_status}
                              </span>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{app.dept_name}</td>
                        <td className="px-4 py-3">
                          {editApp?.app_id === app.app_id
                            ? <input className="px-2 py-1 rounded text-xs w-48" style={inputStyle} value={editApp.url_link} onChange={e => setEditApp(v => v ? { ...v, url_link: e.target.value } : v)} />
                            : <span className="text-xs truncate max-w-[160px] block" style={{ color: 'var(--text2)' }}>{app.url_link || '—'}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleAppActive(app)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: app.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: app.is_active ? '#22c55e' : '#ef4444' }}>
                            {app.is_active ? '✓' : '✗'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {editApp?.app_id === app.app_id ? (
                            <div className="flex gap-1">
                              <button onClick={saveApp} className="p-1 rounded-lg hover:opacity-80" style={{ color: '#22c55e' }}><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditApp(null)} className="p-1 rounded-lg hover:opacity-80" style={{ color: '#ef4444' }}><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setEditApp(app)} className="p-1 rounded-lg hover:opacity-80" style={{ color: 'var(--text2)' }}><Pencil className="w-4 h-4" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════ USERS TAB ════ */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>All Users ({users.length})</h2>
              <button onClick={() => setShowAddUser(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium btn-cyan">
                <Plus className="w-3.5 h-3.5" /> Add User
              </button>
            </div>

            {showAddUser && (
              <div className="rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <input className={inputCls} style={inputStyle} placeholder="Full name *" value={newUser.username} onChange={e => setNewUser(v => ({ ...v, username: e.target.value }))} />
                <input className={inputCls} style={inputStyle} placeholder="Email *" value={newUser.email} onChange={e => setNewUser(v => ({ ...v, email: e.target.value }))} />
                <input type="password" className={inputCls} style={inputStyle} placeholder="Password *" value={newUser.password} onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))} />
                <input className={inputCls} style={inputStyle} placeholder="Designation" value={newUser.designation} onChange={e => setNewUser(v => ({ ...v, designation: e.target.value }))} />
                <select className={inputCls} style={inputStyle} value={newUser.role_id} onChange={e => setNewUser(v => ({ ...v, role_id: e.target.value }))}>
                  <option value="">Select role *</option>
                  {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                </select>
                <div className="flex gap-2 items-end justify-end">
                  <button onClick={() => setShowAddUser(false)} className="px-4 py-1.5 rounded-xl text-xs" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
                  <button onClick={addUser} className="px-4 py-1.5 rounded-xl text-xs font-semibold btn-cyan">Save User</button>
                </div>
              </div>
            )}

            {usersLoading ? (
              <div className="text-center py-12" style={{ color: 'var(--text2)' }}>Loading...</div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      {['Name', 'Email', 'Role', 'Last Login', 'Active', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.user_id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>{u.username}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role_id}
                            onChange={e => changeUserRole(u.user_id, Number(e.target.value))}
                            className="px-2 py-1 rounded-lg text-xs focus:outline-none"
                            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>
                          {u.last_login ? new Date(u.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleUserActive(u)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: u.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: u.is_active ? '#22c55e' : '#ef4444' }}>
                            {u.is_active ? '✓' : '✗'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setResetTarget(u)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Reset PW
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════ AUDIT LOG TAB ════ */}
        {tab === 'audit' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Audit Log</h2>
              <button onClick={loadAudit} className="text-xs px-3 py-1.5 rounded-xl" style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Refresh</button>
            </div>

            {auditLoading ? (
              <div className="text-center py-12" style={{ color: 'var(--text2)' }}>Loading...</div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.log_id} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <span className="mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${ACTION_COLORS[log.action] ?? '#888'}22`, color: ACTION_COLORS[log.action] ?? '#888' }}>
                      {log.action}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{log.username}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text2)' }}>{log.details}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text2)' }}>
                      {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reset Password Modal */}
      {resetTarget && <ResetPasswordModal targetUser={resetTarget} onClose={() => { setResetTarget(null); loadUsers(); }} />}
    </div>
  );
}