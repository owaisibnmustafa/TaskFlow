/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Inbox,
  SearchX,
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  X,
} from 'lucide-react';
import { FilterType, Task } from '../types/task';
import { isTaskOverdue, isDateToday } from '../utils/dateUtils';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  activeFilter: FilterType;
  searchQuery: string;
  hasActiveFilters: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onOpenCreateModal: () => void;
  onResetFilters: () => void;
  onRestoreSampleData: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTasksCount,
  activeFilter,
  searchQuery,
  hasActiveFilters,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onOpenCreateModal,
  onResetFilters,
  onRestoreSampleData,
}) => {
  const [isAlertBannerDismissed, setIsAlertBannerDismissed] = useState(false);
  // Empty State 1: App has completely 0 tasks
  if (totalTasksCount === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <Inbox className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Your task list is empty</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          Start by creating your first task or reload the sample developer dataset to explore all features.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </button>
          <button
            type="button"
            onClick={onRestoreSampleData}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus:outline-none"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Load Demo Tasks</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty State 2: Search active and yielded 0 results
  if (searchQuery.trim() && tasks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          No matching tasks
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          No tasks match your search query: <span className="font-semibold text-slate-700">"{searchQuery}"</span>.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          Clear search & filters
        </button>
      </div>
    );
  }

  // Empty State 3: Filter active and yielded 0 results
  if (tasks.length === 0) {
    const filterLabels: Record<FilterType, string> = {
      all: 'tasks',
      pending: 'pending tasks',
      today: 'tasks due today',
      upcoming: 'upcoming tasks',
      completed: 'completed tasks',
      overdue: 'overdue tasks',
    };

    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-3">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          No {filterLabels[activeFilter] || 'tasks found'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          {activeFilter === 'completed'
            ? 'You have not completed any tasks in this view yet. Keep going!'
            : activeFilter === 'pending'
            ? 'All caught up! You have no pending tasks to complete.'
            : activeFilter === 'overdue'
            ? 'Awesome! You have no overdue tasks on your schedule.'
            : activeFilter === 'today'
            ? 'No tasks scheduled for today. Take a breather or plan ahead.'
            : 'No tasks match the active filters.'}
        </p>

        <div className="flex items-center justify-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Show all tasks
            </button>
          )}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    );
  }

  const pendingOverdueCount = tasks.filter((t) => !t.completed && isTaskOverdue(t.dueDate, false)).length;
  const pendingTodayCount = tasks.filter((t) => !t.completed && isDateToday(t.dueDate)).length;
  const hasUrgentAlerts = pendingOverdueCount > 0 || pendingTodayCount > 0;

  return (
    <div className="space-y-3">
      {/* Visual Alert System: Notice for Today or Recently Overdue Tasks */}
      {hasUrgentAlerts && !isAlertBannerDismissed && activeFilter !== 'completed' && (
        <div className="bg-gradient-to-r from-amber-50/90 via-rose-50/70 to-amber-50/90 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900">Action Required</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  {pendingOverdueCount > 0 && (
                    <span className="font-semibold text-rose-600">
                      {pendingOverdueCount} {pendingOverdueCount === 1 ? 'task' : 'tasks'} overdue
                    </span>
                  )}
                  {pendingOverdueCount > 0 && pendingTodayCount > 0 && <span className="mx-1">and</span>}
                  {pendingTodayCount > 0 && (
                    <span className="font-semibold text-amber-700">
                      {pendingTodayCount} {pendingTodayCount === 1 ? 'task' : 'tasks'} due today
                    </span>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Marked with colored left accent borders and pulsing alert tags below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAlertBannerDismissed(true)}
            className="min-w-[36px] min-h-[36px] p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Dismiss alert notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </div>
  );
};
