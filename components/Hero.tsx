'use client';

import { motion } from 'framer-motion';
import { BarChart2, Layers, Activity, Sparkles } from 'lucide-react';
import { dashboardData, categories } from '@/lib/dashboardData';

export default function Hero() {
  const liveCount = dashboardData.filter((d) => d.status === 'Live').length;
  const uatCount = dashboardData.filter((d) => d.status === 'UAT').length;

  const stats = [
    {
      icon: BarChart2,
      label: 'Total Dashboards',
      value: dashboardData.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Layers,
      label: 'Departments',
      value: categories.length,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      icon: Activity,
      label: 'Live Reports',
      value: liveCount,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: Sparkles,
      label: 'In UAT',
      value: uatCount,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <section
      aria-label="Portal overview"
      className="pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-3">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Enterprise Analytics Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight mb-2">
          Welcome back 👋
        </h1>
        <p className="text-[var(--muted)] text-base max-w-xl">
          Access all your Power BI reports, AI analytics, and business intelligence dashboards from one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] shadow-card"
            >
              <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-[var(--text)]">{stat.value}</div>
              <div className="text-xs text-[var(--muted)] mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
