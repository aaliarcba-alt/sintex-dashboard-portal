'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, ArrowLeft, Plus, Edit2, ToggleLeft, ToggleRight, Save, X, Loader2, Shield, Database, Activity } from 'lucide-react';

interface App {
  app_id: number;
  app_name: string;
  app_type: string;
  app_status: string;
  description: string;
  url_link: string;
  dept_name: string;
  is_active: boolean;
}

const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
};

export default function AdminPage() {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApp, setNewApp] = useState({ app_name: '', app_type: 'Dashboard', app_status: 'Live', description: '', url_link: '' });

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const { user } = await meRes.json();
      if (user.access_level > 1) { router.push('/portal'); return; }
      fetchApps();
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
    await fetch('/api/admin/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    });
    setSaving(false);
    setShowAddForm(false);
    setNewApp({ app_name: '', app_type: 'Dashboard', app_status: 'Live', description: '', url_link: '' });
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

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(8,12,26,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => router.push('/portal')} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: 'var(--text2)' }}>
            <ArrowLeft className="w-4 h-4" /> Portal
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Admin Panel</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }}>
              {activeCount} active apps
            </span>
            <button onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold btn-cyan">
              <Plus className="w-3.5 h-3.5" /> Add App
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Database, label: 'Total Apps', value: apps.length, color: 'text-cyan-400', glow: 'rgba(0,212,255,0.15)' },
            { icon: Activity, label: 'Active', value: activeCount, color: 'text-emerald-400', glow: 'rgba(52,211,153,0.15)' },
            { icon: BarChart3, label: 'Inactive', value: apps.length - activeCount, color: 'text-gray-400', glow: 'rgba(107,114,128,0.15)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: `0 0 20px ${s.glow}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.glow }}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add App Form */}
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'var(--surface)', border: '1px solid rgba(0,212,255,0.25)', boxShadow: '0 0 24px rgba(0,212,255,0.08)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Add New Application</h3>
              <button onClick={() => setShowAddForm(false)} style={{ color: 'var(--text2)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'App Name', key: 'app_name', type: 'text', placeholder: 'e.g. Sales Dashboard' },
                { label: 'URL Link', key: 'url_link', type: 'url', placeholder: 'https://...' },
                { label: 'Description', key: 'description', type: 'text', placeholder: 'Brief description' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(newApp as any)[f.key]}
                    onChange={e => setNewApp(p => ({ ...p, [f.key]: e.target.value }))}
                    style={INPUT_STYLE} />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Type</label>
                <select value={newApp.app_type} onChange={e => setNewApp(p => ({ ...p, app_type: e.target.value }))} style={INPUT_STYLE}>
                  {['Dashboard', 'Genie', 'Automation', 'Report', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>Status</label>
                <select value={newApp.app_status} onChange={e => setNewApp(p => ({ ...p, app_status: e.target.value }))} style={INPUT_STYLE}>
                  {['Live', 'UAT', 'Development', 'Paused'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text2)' }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving || !newApp.app_name} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold btn-cyan disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add App
              </button>
            </div>
          </motion.div>
        )}

        {/* Apps table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">All Applications</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text2)' }}>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
              Loading apps…
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {apps.map(app => (
                <div key={app.app_id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  {editingApp?.app_id === app.app_id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input value={editingApp.app_name} onChange={e => setEditingApp(p => p ? { ...p, app_name: e.target.value } : null)} style={INPUT_STYLE} placeholder="App name" />
                      <input value={editingApp.url_link || ''} onChange={e => setEditingApp(p => p ? { ...p, url_link: e.target.value } : null)} style={INPUT_STYLE} placeholder="URL" />
                      <select value={editingApp.app_status} onChange={e => setEditingApp(p => p ? { ...p, app_status: e.target.value } : null)} style={INPUT_STYLE}>
                        {['Live', 'UAT', 'Development', 'Paused'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{app.app_name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: app.app_status === 'Live' ? 'rgba(0,212,255,0.1)' : 'rgba(251,191,36,0.1)', color: app.app_status === 'Live' ? '#00D4FF' : '#FBBF24', border: `1px solid ${app.app_status === 'Live' ? 'rgba(0,212,255,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                          {app.app_status}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text2)' }}>{app.url_link || '—'}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {editingApp?.app_id === app.app_id ? (
                      <>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium btn-cyan">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                        </button>
                        <button onClick={() => setEditingApp(null)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text2)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingApp(app)} className="p-1.5 rounded-lg transition-colors hover:text-cyan-400" style={{ color: 'var(--text2)' }}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleActive(app)} className="p-1.5 rounded-lg transition-colors" style={{ color: app.is_active ? '#00D4FF' : 'rgba(255,255,255,0.2)' }}>
                          {app.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
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
