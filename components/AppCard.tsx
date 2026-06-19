// components/AppCard.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, BarChart3, Sparkles, AppWindow, Download, Code2 } from 'lucide-react';

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

interface AppCardProps {
  app: App;
  isFav: boolean;
  onToggleFav: (id: number) => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  Dashboard: <BarChart3 className="w-4 h-4" />,
  Genie: <Sparkles className="w-4 h-4" />,
  Application: <AppWindow className="w-4 h-4" />,
};

const STATUS_DOT: Record<string, string> = {
  Live: '#22c55e',
  UAT: '#f59e0b',
  WIP: '#6366f1',
};

export default function AppCard({ app, isFav, onToggleFav }: AppCardProps) {
  const [toggling, setToggling] = useState(false);

  const handleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: app.app_id }),
      });
      onToggleFav(app.app_id);
    } catch {
      // silent fail — UI already optimistic via parent
    } finally {
      setToggling(false);
    }
  };

  const handleLaunch = async () => {
    if (!app.url_link) return;
    // Fire audit log (fire-and-forget)
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: app.app_id, action_type: 'VIEW' }),
    }).catch(() => {});
    window.open(app.url_link, '_blank', 'noopener,noreferrer');
  };

  const dotColor = STATUS_DOT[app.app_status] ?? '#6b7280';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="app-card group relative flex flex-col gap-3 rounded-2xl p-4 border border-white/5 transition-all duration-200"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        {/* Type icon + name */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'var(--surface2)', color: 'var(--primary)' }}
          >
            {TYPE_ICON[app.app_type] ?? <AppWindow className="w-4 h-4" />}
          </span>
          <span
            className="font-semibold text-sm leading-tight line-clamp-2"
            style={{ color: 'var(--text)' }}
          >
            {app.app_name}
          </span>
        </div>

        {/* Star */}
        <button
          onClick={handleFav}
          disabled={toggling}
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          className="flex-shrink-0 p-1 rounded-lg transition-all duration-150 hover:scale-110"
          style={{ color: isFav ? '#f59e0b' : 'var(--text2)' }}
        >
          <Star
            className="w-4 h-4"
            fill={isFav ? '#f59e0b' : 'none'}
            strokeWidth={isFav ? 0 : 1.5}
          />
        </button>
      </div>

      {/* Description */}
      {app.description && (
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: 'var(--text2)' }}
        >
          {app.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-1 gap-2">
        {/* Status + dept */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: dotColor }}
            />
            {app.app_status}
          </span>

          {/* Export badge */}
          {app.can_export && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              <Download className="w-2.5 h-2.5" />
              Export
            </span>
          )}

          {/* Embed badge */}
          {app.can_embed && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              <Code2 className="w-2.5 h-2.5" />
              Embed
            </span>
          )}
        </div>

        {/* Launch button */}
        {app.url_link ? (
          <button
            onClick={handleLaunch}
            className="btn-cyan flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            Launch
          </button>
        ) : (
          <span
            className="text-xs px-3 py-1.5 rounded-xl font-medium flex-shrink-0 opacity-40 cursor-not-allowed"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
          >
            WIP
          </span>
        )}
      </div>
    </motion.div>
  );
}