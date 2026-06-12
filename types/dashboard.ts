export interface Dashboard {
  id: string;
  reportName: string;
  url: string;
  category: string;
  department: string;
  status: 'Live' | 'UAT' | 'WIP' | string;
  owner?: string;
  type?: string;
  description?: string;
}

export type FilterStatus = 'All' | 'Live' | 'UAT' | 'WIP';

export interface DashboardFilters {
  search: string;
  category: string;
  status: FilterStatus;
}
