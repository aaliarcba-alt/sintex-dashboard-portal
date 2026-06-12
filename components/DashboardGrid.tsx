'use client';

import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from './DashboardCard';
import EmptyState from './EmptyState';
import { Dashboard } from '@/types/dashboard';

interface DashboardGridProps {
  dashboards: Dashboard[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onLaunch: (id: string) => void;
  onClearFilters: () => void;
}

export default function DashboardGrid({
  dashboards,
  favorites,
  onToggleFavorite,
  onLaunch,
  onClearFilters,
}: DashboardGridProps) {
  return (
    <section
      aria-label="Dashboard tiles"
      className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto pb-16"
    >
      <AnimatePresence mode="wait">
        {dashboards.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid"
          >
            <EmptyState onClear={onClearFilters} />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
            role="list"
          >
            {dashboards.map((dashboard, index) => (
              <div key={dashboard.id} role="listitem">
                <DashboardCard
                  dashboard={dashboard}
                  isFavorite={favorites.has(dashboard.id)}
                  onToggleFavorite={onToggleFavorite}
                  onLaunch={onLaunch}
                  index={index}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
