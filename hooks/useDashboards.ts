'use client';

import { useMemo, useState } from 'react';
import { dashboardData } from '@/lib/dashboardData';
import { Dashboard, FilterStatus } from '@/types/dashboard';

export function useDashboards() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('All');

  const filtered = useMemo(() => {
    let result: Dashboard[] = dashboardData;

    if (selectedCategory !== 'All') {
      result = result.filter((d) => d.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      result = result.filter((d) => d.status === selectedStatus);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.reportName.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          (d.description?.toLowerCase().includes(q) ?? false)
      );
    }

    return result;
  }, [search, selectedCategory, selectedStatus]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All';

  return {
    dashboards: filtered,
    total: dashboardData.length,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    hasActiveFilters,
  };
}
