/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'high' | 'medium' | 'low';

export type Category = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate?: string; // Stored in YYYY-MM-DD local format
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string;    // ISO string
  updatedAt: string;    // ISO string
  isSample?: boolean;   // Flag to identify initial demo tasks
}

export type FilterType = 'all' | 'pending' | 'today' | 'upcoming' | 'completed' | 'overdue';

export type SortType =
  | 'dueDate-asc'
  | 'dueDate-desc'
  | 'priority-desc'
  | 'priority-asc'
  | 'created-desc'
  | 'created-asc'
  | 'title-asc';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  todayCount: number;
  completionRate: number;
}

export interface CategoryMeta {
  label: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
}

export const CATEGORY_DEFINITIONS: Record<Category, CategoryMeta> = {
  work: {
    label: 'Work',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    bgLight: 'bg-indigo-50',
  },
  study: {
    label: 'Study',
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    bgLight: 'bg-violet-50',
  },
  personal: {
    label: 'Personal',
    color: 'bg-teal-500',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    bgLight: 'bg-teal-50',
  },
  health: {
    label: 'Health',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    bgLight: 'bg-emerald-50',
  },
  finance: {
    label: 'Finance',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    bgLight: 'bg-amber-50',
  },
  other: {
    label: 'Other',
    color: 'bg-slate-500',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    bgLight: 'bg-slate-100',
  },
};

export interface PriorityMeta {
  label: string;
  weight: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

export const PRIORITY_DEFINITIONS: Record<Priority, PriorityMeta> = {
  high: {
    label: 'High',
    weight: 3,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    weight: 2,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    weight: 1,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    dotColor: 'bg-slate-400',
  },
};
