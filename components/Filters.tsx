'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { categories, categoryColors, statusColors } from '@/lib/dashboardData';
import { FilterStatus } from '@/types/dashboard';

interface FiltersProps {
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedStatus: FilterStatus;
  onStatusChange: (s: FilterStatus) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  totalShown: number;
  total: number;
}

const statusOptions: FilterStatus[] = ['All', 'Live', 'UAT', 'WIP'];

export default function Filters({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  hasActiveFilters,
  onClear,
  totalShown,
  total,
}: FiltersProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onCategoryChange('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              selectedCategory === 'All'
                ? 'bg-[var(--primary)] text-white border-transparent'
                : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
            }`}
            aria-pressed={selectedCategory === 'All'}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                selectedCategory === cat
                  ? 'bg-[var(--primary)] text-white border-transparent'
                  : `${categoryColors[cat] || 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]'} hover:border-[var(--primary)] hover:text-[var(--primary)]`
              }`}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border)]" aria-hidden="true" />

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                selectedStatus === s
                  ? 'bg-[var(--primary)] text-white border-transparent'
                  : s !== 'All'
                  ? `${statusColors[s] || 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]'} hover:border-[var(--primary)] hover:text-[var(--primary)]`
                  : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
              aria-pressed={selectedStatus === s}
            >
              {s !== 'All' && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    s === 'Live' ? 'bg-emerald-500' : s === 'UAT' ? 'bg-amber-500' : 'bg-orange-500'
                  }`}
                />
              )}
              {s}
            </button>
          ))}
        </div>

        {/* Clear + count */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">
            {totalShown} of {total}
          </span>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
              aria-label="Clear all filters"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Clear
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
