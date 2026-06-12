'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Filters from '@/components/Filters';
import DashboardGrid from '@/components/DashboardGrid';
import RecentReports from '@/components/RecentReports';
import Favorites from '@/components/Favorites';
import SkeletonCard from '@/components/SkeletonCard';
import { useDashboards } from '@/hooks/useDashboards';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentReports } from '@/hooks/useRecentReports';

function SkeletonGrid() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const {
    dashboards,
    total,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    hasActiveFilters,
  } = useDashboards();

  const { favorites, toggleFavorite } = useFavorites();
  const { recent, addRecent } = useRecentReports();

  useEffect(() => {
    // Small delay for skeleton effect on initial load
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      <Header search={search} onSearch={setSearch} />

      <main id="main-content" tabIndex={-1}>
        <Hero />

        {mounted && (
          <>
            <RecentReports recentIds={recent} onLaunch={addRecent} />
            <Favorites
              favoriteIds={favorites}
              onToggle={toggleFavorite}
              onLaunch={addRecent}
            />
          </>
        )}

        <Filters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
          totalShown={dashboards.length}
          total={total}
        />

        {mounted ? (
          <DashboardGrid
            dashboards={dashboards}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onLaunch={addRecent}
            onClearFilters={clearFilters}
          />
        ) : (
          <SkeletonGrid />
        )}
      </main>

      <footer className="border-t border-[var(--border)] py-6 mt-4">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Sintex Analytics Hub · All dashboards are for internal use
          </p>
          <p className="text-xs text-[var(--muted)]">
            {total} dashboards · Powered by Power BI & Databricks
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
