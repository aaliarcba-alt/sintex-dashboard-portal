'use client';

import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  onClear: () => void;
}

export default function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 bg-[var(--bg)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--border)]">
        <SearchX className="w-7 h-7 text-[var(--muted)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text)] mb-1">No dashboards found</h3>
      <p className="text-sm text-[var(--muted)] max-w-xs mb-5">
        No results match your current filters. Try adjusting your search or clearing filters.
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
      >
        Clear filters
      </button>
    </motion.div>
  );
}
