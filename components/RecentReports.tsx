'use client';

import { motion } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import { dashboardData } from '@/lib/dashboardData';
import { statusColors } from '@/lib/dashboardData';

interface RecentReportsProps {
  recentIds: string[];
  onLaunch: (id: string) => void;
}

export default function RecentReports({ recentIds, onLaunch }: RecentReportsProps) {
  if (recentIds.length === 0) return null;

  const recent = recentIds
    .map((id) => dashboardData.find((d) => d.id === id))
    .filter(Boolean) as typeof dashboardData;

  return (
    <section
      aria-label="Recently visited dashboards"
      className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-[var(--text)]">Recently Visited</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {recent.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              onLaunch(d.id);
              window.open(d.url, '_blank', 'noopener,noreferrer');
            }}
            aria-label={`Revisit ${d.reportName}`}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all whitespace-nowrap shrink-0"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                d.status === 'Live'
                  ? 'bg-emerald-500'
                  : d.status === 'UAT'
                  ? 'bg-amber-500'
                  : 'bg-orange-500'
              }`}
              aria-hidden="true"
            />
            {d.reportName.length > 28 ? d.reportName.slice(0, 28) + '…' : d.reportName}
            <ExternalLink className="w-3 h-3 opacity-50" aria-hidden="true" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
