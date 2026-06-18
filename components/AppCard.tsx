'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, BarChart2, TrendingUp, Truck, DollarSign, Factory, ShoppingCart, Sparkles, MonitorDot } from 'lucide-react';

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
}

const deptIcons: Record<string, React.ElementType> = {
  Sales: TrendingUp,
  Finance: DollarSign,
  SCM: Factory,
  SM: ShoppingCart,
  Logistics: Truck,
  PPC: BarChart2,
};

const typeConfig: Record<string, { icon: React.ElementType; stripDark: string; stripLight: string; iconBgDark: string; iconBgLight: string; iconColor: string }> = {
  Genie: {
    icon: Sparkles,
    stripDark: 'linear-gradient(90deg, #7C3AED, #FF2D9B)',
    stripLight: 'linear-gradient(90deg, #5B35B0, #A8005A)',
    iconBgDark: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(255,45,155,0.2))',
    iconBgLight: '#EDE9F8',
    iconColor: '#7C3AED',
  },
  Other: {
    icon: MonitorDot,
    stripDark: 'linear-gradient(90deg, #34D399, #059669)',
    stripLight: 'linear-gradient(90deg, #16795A, #059669)',
    iconBgDark: 'rgba(52,211,153,0.15)',
    iconBgLight: '#D1FAE5',
    iconColor: '#16795A',
  },
  Dashboard: {
    icon: BarChart2,
    stripDark: 'linear-gradient(90deg, #00D4FF, rgba(0,212,255,0))',
    stripLight: 'linear-gradient(90deg, #1D6FA4, rgba(29,111,164,0))',
    iconBgDark: 'rgba(0,212,255,0.12)',
    iconBgLight: '#E0F0FA',
    iconColor: '#1D6FA4',
  },
};

// DB stores 'Other' for applications — map to display label
const TYPE_DISPLAY: Record<string, string> = {
  Dashboard: 'Dashboard',
  Genie: 'Genie',
  Other: 'Application',
};

const statusConfig: Record<string, { label: string; dot: string; styleDark: React.CSSProperties; styleLight: React.CSSProperties }> = {
  Live: {
    label: 'Live',
    dot: '#22D3EE',
    styleDark:  { background: 'rgba(0,212,255,0.1)',   border: '1px solid rgba(0,212,255,0.35)',   color: '#00D4FF' },
    styleLight: { background: '#E0F0FA',                border: '1px solid #93C5E8',                color: '#1D6FA4' },
  },
  Development: {
    label: 'Development',
    dot: '#A78BFA',
    styleDark:  { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.35)', color: '#A78BFA' },
    styleLight: { background: '#EDE9F8',                border: '1px solid #C4B5F0',                color: '#5B35B0' },
  },
};

export default function AppCard({ app, index, isFavorite, onToggleFavorite }: {
  app: App;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}) {
  const type = typeConfig[app.app_type] || typeConfig.Dashboard;
  const TypeIcon = type.icon;
  const DeptIcon = deptIcons[app.dept_name] || BarChart2;
  const status = statusConfig[app.app_status] || statusConfig.Development;
  const typeLabel = TYPE_DISPLAY[app.app_type] || app.app_type;

  const handleLaunch = () => {
    if (app.url_link) window.open(app.url_link, '_blank', 'noopener,noreferrer');
  };

  // Detect theme
  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') !== 'light'
    : true;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="group flex flex-col rounded-2xl overflow-hidden relative"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      whileHover={{ y: -3 }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = isDark ? 'rgba(0,212,255,0.35)' : '#93C5E8';
        el.style.boxShadow = isDark
          ? '0 0 20px rgba(0,212,255,0.08), 0 8px 24px rgba(0,0,0,0.35)'
          : '0 4px 16px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Colour strip top */}
      <div className="h-0.5 w-full shrink-0" style={{ background: isDark ? type.stripDark : type.stripLight }} />

      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 flex-1">

        {/* Icon row + star */}
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isDark ? type.iconBgDark : type.iconBgLight }}>
            <TypeIcon className="w-4 h-4" style={{ color: type.iconColor }} />
          </div>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(app.app_id); }}
            className="p-1 rounded-lg transition-all touch-manipulation"
            style={{ color: isFavorite ? '#FBBF24' : 'var(--text2)', opacity: isFavorite ? 1 : 0.4 }}
            aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1" style={{ color: 'var(--text)' }}>
            {app.app_name}
          </h3>
          {app.description && (
            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text2)' }}>
              {app.description}
            </p>
          )}
        </div>

        {/* Badges: dept + status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {app.dept_name && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
              style={isDark
                ? { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }
                : { background: '#E0F0FA', border: '1px solid #93C5E8', color: '#1D6FA4' }
              }>
              {app.dept_name}
            </span>
          )}
          {app.subdivision && app.subdivision !== app.dept_name && (
            <span className="px-2 py-0.5 rounded-lg text-xs"
              style={isDark
                ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text2)' }
                : { background: '#F4F6FB', border: '1px solid #D1D5DB', color: '#4B5563' }
              }>
              {app.subdivision}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
            style={isDark ? status.styleDark : status.styleLight}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status.dot }} />
            {status.label}
          </span>
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          disabled={!app.url_link}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed"
          style={isDark
            ? { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }
            : { background: '#E0F0FA', border: '1px solid #93C5E8', color: '#1D6FA4' }
          }
          onMouseEnter={e => {
            if (!app.url_link) return;
            const el = e.currentTarget as HTMLElement;
            el.style.background = isDark ? 'rgba(0,212,255,0.18)' : '#BFE0F5';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = isDark ? 'rgba(0,212,255,0.08)' : '#E0F0FA';
          }}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          {app.url_link ? 'Launch' : 'Coming Soon'}
        </button>
      </div>
    </motion.article>
  );
}