'use client';

import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
import { dashboardData } from '@/lib/dashboardData';

interface FavoritesProps {
  favoriteIds: Set<string>;
  onToggle: (id: string) => void;
  onLaunch: (id: string) => void;
}

export default function Favorites({ favoriteIds, onToggle, onLaunch }: FavoritesProps) {
  if (favoriteIds.size === 0) return null;

  const favorites = [...favoriteIds]
    .map((id) => dashboardData.find((d) => d.id === id))
    .filter(Boolean) as typeof dashboardData;

  return (
    <section
      aria-label="Favorited dashboards"
      className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-amber-500 fill-amber-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-[var(--text)]">Favorites</h2>
        <span className="text-xs text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded-full">
          {favorites.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {favorites.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  d.status === 'Live'
                    ? 'bg-emerald-500'
                    : d.status === 'UAT'
                    ? 'bg-amber-500'
                    : 'bg-orange-500'
                }`}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-[var(--text)] truncate">{d.reportName}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  onLaunch(d.id);
                  window.open(d.url, '_blank', 'noopener,noreferrer');
                }}
                aria-label={`Launch ${d.reportName}`}
                className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggle(d.id)}
                aria-label={`Remove ${d.reportName} from favorites`}
                className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-500 hover:text-amber-600 transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
