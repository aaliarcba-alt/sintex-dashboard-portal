// components/AppCard.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, BarChart3, Sparkles, AppWindow } from 'lucide-react';

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

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; iconBg: string; iconColor: string }> = {
  Dashboard: {
    icon: <BarChart3 className="w-5 h-5" />,
    gradient: 'linear-gradient(90deg, #00d4ff, #0099ff)',
    iconBg: 'rgba(0,212,255,0.15)',
    iconColor: '#00d4ff',
  },
  Genie: {
    icon: <Sparkles className="w-5 h-5" />,
    gradient: 'linear-gradient(90deg, #a855f7, #ec4899)',
    iconBg: 'rgba(168,85,247,0.15)',
    iconColor: '#a855f7',
  },
  Application: {
    icon: <AppWindow className="w-5 h-5" />,
    gradient: 'linear-gradient(90deg, #22c55e, #10b981)',
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: '#22c55e',
  },
};

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  Live:        { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e', dot: '#22c55e' },
  UAT:         { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', dot: '#f59e0b' },
  WIP:         { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
  Development: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', dot: '#818cf8' },
};

export default function AppCard({ app, isFav, onToggleFav }: AppCardProps) {
  const [toggling, setToggling] = useState(false);

  const typeConfig = TYPE_CONFIG[app.app_type] ?? TYPE_CONFIG['Application'];
  const statusStyle = STATUS_COLOR[app.app_status] ?? { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', dot: '#6b7280' };

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
      // silent fail — optimistic update already applied
    } finally {
      setToggling(false);
    }
  };

  const handleLaunch = () => {
    if (!app.url_link) return;
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: app.app_id, action_type: 'VIEW' }),
    }).catch(() => {});
    window.open(app.url_link, '_blank', 'noopener,noreferrer');
  };

  // Build tag pills: dept, subdivision, status
  const pills = [
    app.dept_name,
    app.subdivision,
    app.app_status,
  ].filter(Boolean);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Gradient top bar */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: typeConfig.gradient }} />

      {/* Card body */}
      <div className="flex flex-col gap-3 p-4 flex-1">

        {/* Icon + star row */}
        <div className="flex items-start justify-between">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl"
            style={{ background: typeConfig.iconBg, color: typeConfig.iconColor }}
          >
            {typeConfig.icon}
          </div>
          <button
            onClick={handleFav}
            disabled={toggling}
            aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
            className="p-1 rounded-lg transition-all duration-150 hover:scale-110 mt-0.5"
            style={{ color: isFav ? '#f59e0b' : 'var(--text2)' }}
          >
            <Star
              className="w-4 h-4"
              fill={isFav ? '#f59e0b' : 'none'}
              strokeWidth={isFav ? 0 : 1.5}
            />
          </button>
        </div>

        {/* App name */}
        <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
          {app.app_name}
        </p>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-1.5">
          {app.dept_name && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              {app.dept_name}
            </span>
          )}
          {app.subdivision && app.subdivision !== app.dept_name && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
              {app.subdivision}
            </span>
          )}
          {/* Status pill */}
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.text }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusStyle.dot }} />
            {app.app_status}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Launch button */}
        {app.url_link ? (
          <button
            onClick={handleLaunch}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 mt-1"
            style={{
              background: typeConfig.iconBg,
              color: typeConfig.iconColor,
              border: `1px solid ${typeConfig.iconColor}33`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = typeConfig.gradient;
              (e.currentTarget as HTMLButtonElement).style.color = '#000';
              (e.currentTarget as HTMLButtonElement).style.border = 'none';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = typeConfig.iconBg;
              (e.currentTarget as HTMLButtonElement).style.color = typeConfig.iconColor;
              (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${typeConfig.iconColor}33`;
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Launch
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center py-2 rounded-xl text-xs font-medium mt-1 opacity-30 cursor-not-allowed"
            style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
          >
            WIP
          </div>
        )}
      </div>
    </motion.div>
  );
}