'use client';

import { motion } from 'framer-motion';
import {
  ExternalLink,
  Star,
  BarChart2,
  Table,
  Brain,
  TrendingUp,
  Truck,
  DollarSign,
  Factory,
  ShoppingCart,
} from 'lucide-react';
import { Dashboard } from '@/types/dashboard';
import { categoryColors, statusColors } from '@/lib/dashboardData';

interface DashboardCardProps {
  dashboard: Dashboard;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onLaunch: (id: string) => void;
  index: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  Sales: TrendingUp,
  Finance: DollarSign,
  Logistics: Truck,
  SCM: Factory,
  SM: ShoppingCart,
  PPC: BarChart2,
};

const statusDots: Record<string, string> = {
  Live: 'bg-emerald-500',
  UAT: 'bg-amber-500',
  WIP: 'bg-orange-500',
};

export default function DashboardCard({
  dashboard,
  isFavorite,
  onToggleFavorite,
  onLaunch,
  index,
}: DashboardCardProps) {
  const Icon = categoryIcons[dashboard.category] || BarChart2;
  const isAI = dashboard.reportName.toLowerCase().includes('ai') ||
    dashboard.url.includes('genie') ||
    dashboard.url.includes('databricks');

  const handleLaunch = () => {
    onLaunch(dashboard.id);
    window.open(dashboard.url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLaunch();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      className="dashboard-card group bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-card hover:shadow-card-hover flex flex-col overflow-hidden"
      aria-label={`${dashboard.reportName} dashboard — ${dashboard.status}`}
    >
      {/* Card header gradient strip */}
      <div
        className={`h-1 w-full ${
          dashboard.status === 'Live'
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            : dashboard.status === 'UAT'
            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
            : 'bg-gradient-to-r from-orange-400 to-orange-500'
        }`}
        aria-hidden="true"
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top row: icon + star */}
        <div className="flex items-start justify-between">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAI
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}
            aria-hidden="true"
          >
            {isAI ? (
              <Brain className="w-5 h-5 text-white" />
            ) : (
              <Icon className="w-5 h-5 text-white" />
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dashboard.id);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Name */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--text)] leading-snug line-clamp-2 mb-1.5">
            {dashboard.reportName}
          </h3>
          {dashboard.description && (
            <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
              {dashboard.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
              categoryColors[dashboard.category] ||
              'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {dashboard.category}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
              statusColors[dashboard.status] ||
              'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusDots[dashboard.status] || 'bg-slate-400'}`}
              aria-hidden="true"
            />
            {dashboard.status}
          </span>
          {isAI && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
              ✦ AI
            </span>
          )}
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          onKeyDown={handleKeyDown}
          aria-label={`Launch ${dashboard.reportName}`}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl
            bg-[var(--primary)] hover:bg-blue-700 active:bg-blue-800
            text-white text-xs font-semibold
            transition-all duration-150
            focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          Launch Dashboard
        </button>
      </div>
    </motion.article>
  );
}
