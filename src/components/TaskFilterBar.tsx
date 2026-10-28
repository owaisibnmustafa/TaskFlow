/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Category, FilterType, Priority, SortType, CATEGORY_DEFINITIONS } from '../types/task';

interface TaskFilterBarProps {
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  selectedPriority: Priority | 'all';
  onSelectPriority: (priority: Priority | 'all') => void;
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  counts: {
    all: number;
    pending: number;
    today: number;
    upcoming: number;
    completed: number;
    overdue: number;
  };
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  sortType,
  onSortChange,
  counts,
  onResetFilters,
  hasActiveFilters,
}) => {
  const filterTabs: Array<{ id: FilterType; label: string; count: number }> = [
    { id: 'all', label: 'All Tasks', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
  ];

  return (
    <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main View Filter Tabs (Horizontal scroll on small screens) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectFilter(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 active:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Category, Priority, Sort & Clear Filter */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 flex-1 xs:flex-none min-w-[125px]">
            <label htmlFor="category-filter" className="text-slate-500 font-medium sr-only sm:not-sr-only">
              Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value as Category | 'all')}
              className="w-full xs:w-auto min-h-[38px] py-2 pl-2.5 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_DEFINITIONS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 flex-1 xs:flex-none min-w-[115px]">
            <label htmlFor="priority-filter" className="text-slate-500 font-medium sr-only sm:not-sr-only">
              Priority:
            </label>
            <select
              id="priority-filter"
              value={selectedPriority}
              onChange={(e) => onSelectPriority(e.target.value as Priority | 'all')}
              className="w-full xs:w-auto min-h-[38px] py-2 pl-2.5 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t border-slate-50 sm:border-t-0">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              id="sort-select"
              value={sortType}
              onChange={(e) => onSortChange(e.target.value as SortType)}
              className="w-full sm:w-auto min-h-[38px] py-2 pl-2.5 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              aria-label="Sort tasks by"
            >
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="created-desc">Created Date (Newest)</option>
              <option value="title-asc">Alphabetical (A - Z)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="min-h-[38px] py-2 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1 flex-shrink-0"
              title="Reset all search & filters"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
