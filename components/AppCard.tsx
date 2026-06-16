'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Star, Brain, BarChart2, TrendingUp, Truck, DollarSign, Factory, ShoppingCart, Zap } from 'lucide-react';

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
}

const deptIcons: Record<string, React.ElementType> = {
  Sales: TrendingUp,
  Finance: DollarSign,
  Logistics: Truck,
  SCM: Factory,
  SM: ShoppingCart,
  PPC: BarChart2,
};

const statusConfig: Record<string, { color: string; dot: string; glow: string }> = {
  Live:        { color: '#00D4FF', dot: 'bg-cyan-400',   glow: 'rgba(0,212,255,0.3)' },
  UAT:         { color: '#FBBF24', dot: 'bg-amber-400',  glow: 'rgba(251,191,36,0.3)' },
  Development: { color: '#A78BFA', dot: 'bg-purple-400', glow: 'rgba(167,139,250,0.3)' },
  Paused:      { color: '#6B7280', dot: 'bg-gray-400',   glow: 'rgba(107,114,128,0.3)' },
};

export default function AppCard({ app, index, isFavorite, onToggleFavorite }: {
  app: App;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}) {
  const Icon = deptIcons[app.dept_name] || BarChart2;
  const isAI = app.app_name.toLowerCase().includes('ai') ||
    (app.url_link || '').includes('genie') ||
    (app.url_link || '').includes('databricks') ||
    app.app_type === 'Genie';
  const status = statusConfig[app.app_status] || statusConfig['Live'];

  const handleLaunch = () => {
    if (app.url_link) window.open(app.url_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group flex flex-col rounded-2xl overflow-hidden relative cursor-pointer"
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      whileHover={{ y: -3 }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.35)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(0,212,255,0.1), 0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Top glow strip */}
      <div className="h-0.5 w-full" style={{
        background: isAI
          ? 'linear-gradient(90deg, #7C3AED, #FF2D9B)'
          : `linear-gradient(90deg, ${status.color}, transparent)`,
      }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Icon + star */}
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isAI
                ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(255,45,155,0.3))'
                : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))',
              border: `1px solid ${isAI ? 'rgba(124,58,237,0.4)' : 'rgba(0,212,255,0.3)'}`,
            }}>
            {isAI ? <Brain className="w-4 h-4 text-purple-400" /> : <Icon className="w-4 h-4 text-cyan-400" />}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(app.app_id); }}
            className="p-1 rounded-lg transition-all"
            style={{ color: isFavorite ? '#FBBF24' : 'rgba(255,255,255,0.2)' }}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Name + description */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-1">
            {app.app_name}
          </h3>
          {app.description && (
            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text2)' }}>
              {app.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {app.dept_name && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
              {app.dept_name}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
            style={{ background: `${status.glow}20`, border: `1px solid ${status.glow}`, color: status.color }}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
            {app.app_status}
          </span>
          {isAI && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#A78BFA' }}>
              <Zap className="w-2.5 h-2.5" /> AI
            </span>
          )}
        </div>

        {/* Launch */}
        <button
          onClick={handleLaunch}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00D4FF',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.18)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(0,212,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <ExternalLink className="w-3 h-3" />
          Launch
        </button>
      </div>
    </motion.article>
  );
}
