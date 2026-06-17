'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, ArrowLeft, Plus, Edit2, ToggleLeft, ToggleRight,
  Save, X, Loader2, Shield, Database, Activity, Trash2, ChevronDown, AlertTriangle,
} from 'lucide-react';

interface App {
  app_id: number;
  app_name: string;
  app_type: string;
  app_status: string;
  description: string;
  url_link: string;
  dept_name: string;
  dept_id: number | null;
  is_active: boolean;
}

interface Dept {
  dept_id: number;
  dept_name: string;
  subdivision: string;
}

const INPUT: React.CSSProperties = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  color: 'var(--text)',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
};

const SELECT: React.CSSProperties = {
  ...INPUT,
  appearance: 'none',
  paddingRight: '28px',
  cursor: 'pointer',
};

function SelectWrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text2)' }} />
    </div>
  );
}

// Department data mirrored from DB
const DEPT_TREE: Record<string, string[]> = {
  'Sales': ['B2C', 'B2B'],
  'SCM': ['Logistics', 'PPI', 'Procurement', 'PPC'],
  'CEO Office': ['CEO Office'],
  'Digital': ['Automation'],
  'MD Office': ['MD Office'],
  'HR': ['Admin', 'Training'],
  'Marketing': ['Marketing'],
  'Finance': ['Finance'],
  'Services': ['Services'],
};

export default function AdminPage() {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [newApp, setNewApp] = useState({
    app_name: '', app_type: 'Dashboard', app_status: 'Live',
    description: '', url_link: '', dept_name: '', subdivision: '',
  });

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const { user } = await meRes.json();
      if (user.access_level > 1) { router.push('/portal'); return; }
      fetchApps();
      fetchDepts();
    };
    init();
  }, [router]);

  const fetchApps = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/apps');
    if (res.ok) {
      const { apps } = await res.json();
      setApps(apps);
    }
    setLoading(false);
  };

  const fetchDepts = async () => {
    const res = await fetch('/api/admin/departments');
    if (res.ok) {
      const { depts } = await res.json();
      setDepts(depts);
    }
  };

  // Get dept_id from dept_name + subdivision
  const getDeptId = (deptName: string, subdivision: string) => {
    const found = depts.find(d => d.dept_name === deptName && d.subdivision === subdivision);
    return found?.dept_id ?? null;
  };

  const handleSave = async () => {
    if (!editingApp) return;
    setSaving(true);
    await fetch('/api/admin/apps', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingApp),
    });
    setSaving(false);
    setEditingApp(null);
    fetchApps();
  };

  const handleAdd = async () => {
    setSaving(true);
    const dept_id = getDeptId(newApp.dept_name, newApp.subdivision);
    await fetch('/api/admin/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newApp, dept_id }),
    });
    setSaving(false);
    setShowAddForm(false);
    setNewApp({ app_name: '', app_type: 'Dashboard', app_status: 'Live', description: '', url_link: '', dept_name: '', subdivision: '' });
    fetchApps();
  };

  const handleDelete = async (appId: number) => {
    await fetch('/api/admin/apps', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId }),
    });
    setDeleteConfirm(null);
    fetchApps();
  };

  const toggleActive = async (app: App) => {
    await fetch('/api/admin/apps', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...app, is_active: !app.is_active }),
    });
    fetchApps();
  };

  const activeCount = apps.filter(a => a.is_active).length;
  const newSubdivisions = newApp.dept_name ? (DEPT_TREE[newApp.dept_name] || []) : [];

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--header-bg)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => router.push('/portal')} className="flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text2)' }}>
            <ArrowLeft className="w-4 h-4" /> Portal
          </button>
          <div className="w-px h-5" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Admin Panel</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--primary-dim)', border: '1px solid var(--border-glow)', color: 'var(--primary)' }}>
              {activeCount} active
            </span>
            <button onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold btn-cyan">
              <Plus className="w-3.5 h-3.5" /> Add App
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Database, label: 'Total Apps', value: apps.length, color: 'var(--primary)', glow: 'rgba(0,212,255,0.15)' },
            { icon: Activity, label: 'Active', value: activeCount, color: '#34D399', glow: 'rgba(52,211,153,0.15)' },
            { icon: BarChart3, label: 'Inactive', value: apps.length - activeCount, color: 'var(--text2)', glow: 'rgba(107,114,128,0.1)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: `0 0 20px ${s.glow}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.glow }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add App Form */}
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-glow)', boxShadow: '0 0 24px rgba(0,212,255,0.08)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Add New Application</h3>
              <button onClick={() => setShowAddForm(false)} style={{ color: 'var(--text2)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>App Name *</label>
                <input type="text" placeholder="e.g. Sales Dashboard" value={newApp.app_name}
                  onChange={e => setNewApp(p => ({ ...p, app_name: e.target.value }))} style={INPUT} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>URL Link</label>
                <input type="url" placeholder="https://…" value={newApp.url_link}
                  onChange={e => setNewApp(p => ({ ...p, url_link: e.target.value }))} style={INPUT} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Description</label>
                <input type="text" placeholder="Brief description" value={newApp.description}
                  onChange={e => setNewApp(p => ({ ...p, description: e.target.value }))} style={INPUT} />
              </div>

              {/* Dept dropdown */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Department *</label>
                <SelectWrap>
                  <select value={newApp.dept_name}
                    onChange={e => setNewApp(p => ({ ...p, dept_name: e.target.value, subdivision: '' }))}
                    style={SELECT}>
                    <option value="" style={{ background: 'var(--select-bg)' }}>— Select department —</option>
                    {Object.keys(DEPT_TREE).map(d => (
                      <option key={d} value={d} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>{d}</option>
                    ))}
                  </select>
                </SelectWrap>
              </div>

              {/* Subdivision dropdown */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Subdivision *</label>
                <SelectWrap>
                  <select value={newApp.subdivision}
                    onChange={e => setNewApp(p => ({ ...p, subdivision: e.target.value }))}
                    disabled={!newApp.dept_name}
                    style={{ ...SELECT, opacity: newApp.dept_name ? 1 : 0.45 }}>
                    <option value="" style={{ background: 'var(--select-bg)' }}>— Select subdivision —</option>
                    {newSubdivisions.map(s => (
                      <option key={s} value={s} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>{s}</option>
                    ))}
                  </select>
                </SelectWrap>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Type</label>
                <SelectWrap>
                  <select value={newApp.app_type} onChange={e => setNewApp(p => ({ ...p, app_type: e.target.value }))} style={SELECT}>
                    {['Dashboard', 'Genie', 'Automation', 'Report', 'Other'].map(t => (
                      <option key={t} value={t} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>{t}</option>
                    ))}
                  </select>
                </SelectWrap>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Status</label>
                <SelectWrap>
                  <select value={newApp.app_status} onChange={e => setNewApp(p => ({ ...p, app_status: e.target.value }))} style={SELECT}>
                    {['Live', 'UAT', 'WIP'].map(s => (
                      <option key={s} value={s} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>{s}</option>
                    ))}
                  </select>
                </SelectWrap>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl text-xs transition-opacity hover:opacity-70"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text2)' }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving || !newApp.app_name || !newApp.dept_name || !newApp.subdivision}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold btn-cyan disabled:opacity-40">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add App
              </button>
            </div>
          </motion.div>
        )}

        {/* Apps table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>All Applications</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text2)' }}>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--primary)' }} />
              Loading apps…
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {apps.map(app => (
                <div key={app.app_id} className="px-6 py-4 flex items-center gap-4 transition-colors hover:bg-white/[0.02]">
                  {editingApp?.app_id === app.app_id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input value={editingApp.app_name} onChange={e => setEditingApp(p => p ? { ...p, app_name: e.target.value } : null)} style={INPUT} placeholder="App name" />
                      <input value={editingApp.url_link || ''} onChange={e => setEditingApp(p => p ? { ...p, url_link: e.target.value } : null)} style={INPUT} placeholder="URL" />
                      <SelectWrap>
                        <select value={editingApp.app_status} onChange={e => setEditingApp(p => p ? { ...p, app_status: e.target.value } : null)} style={SELECT}>
                          {['Live', 'UAT', 'WIP'].map(s => <option key={s} value={s} style={{ background: 'var(--select-bg)', color: 'var(--text)' }}>{s}</option>)}
                        </select>
                      </SelectWrap>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{app.app_name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
                          style={app.app_status === 'Live'
                            ? { background: 'rgba(0,212,255,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,212,255,0.3)' }
                            : { background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}>
                          {app.app_status}
                        </span>
                        {app.dept_name && (
                          <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--purple-dim)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                            {app.dept_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text2)' }}>{app.url_link || '—'}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 shrink-0">
                    {editingApp?.app_id === app.app_id ? (
                      <>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium btn-cyan">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                        </button>
                        <button onClick={() => setEditingApp(null)} className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ border: '1px solid var(--border)', color: 'var(--text2)' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingApp(app)} className="p-1.5 rounded-lg transition-opacity hover:opacity-70" style={{ color: 'var(--text2)' }} title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleActive(app)} className="p-1.5 rounded-lg transition-opacity" title={app.is_active ? 'Deactivate' : 'Activate'}
                          style={{ color: app.is_active ? 'var(--primary)' : 'rgba(255,255,255,0.2)' }}>
                          {app.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>

                        {/* Delete — with inline confirmation */}
                        {deleteConfirm === app.app_id ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,45,155,0.08)', border: '1px solid rgba(255,45,155,0.3)' }}>
                            <AlertTriangle className="w-3 h-3 text-pink-400" />
                            <span className="text-xs" style={{ color: '#FF6BB5' }}>Delete?</span>
                            <button onClick={() => handleDelete(app.app_id)} className="text-xs font-semibold" style={{ color: '#FF2D9B' }}>Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs" style={{ color: 'var(--text2)' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(app.app_id)} className="p-1.5 rounded-lg transition-opacity hover:opacity-70" style={{ color: 'rgba(255,45,155,0.6)' }} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}