/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Category,
  FilterType,
  Priority,
  Task,
  TaskStats,
  CATEGORY_DEFINITIONS,
  PRIORITY_DEFINITIONS,
} from '../types/task';

interface DashboardStatsProps {
  stats: TaskStats;
  tasks: Task[];
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  onSelectCategory?: (category: Category) => void;
  onSelectPriority?: (priority: Priority) => void;
}

type ChartDimension = 'category' | 'priority';
type ChartMode = 'bar' | 'donut';

const CATEGORY_CHART_COLORS: Record<Category, string> = {
  work: '#6366f1',     // Indigo
  study: '#8b5cf6',    // Violet
  personal: '#14b8a6', // Teal
  health: '#10b981',   // Emerald
  finance: '#f59e0b',  // Amber
  other: '#64748b',    // Slate
};

const PRIORITY_CHART_COLORS: Record<Priority, string> = {
  high: '#f43f5e',   // Rose
  medium: '#f59e0b', // Amber
  low: '#64748b',    // Slate
};

export interface ChartDataItem {
  key: string;
  name: string;
  count: number;
  completed: number;
  pending: number;
  color: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: ChartDataItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-800 text-xs">
        <p className="font-bold flex items-center gap-1.5 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.name}</span>
        </p>
        <p className="text-slate-300 font-medium">
          Total: <span className="font-bold text-white">{data.count}</span> {data.count === 1 ? 'task' : 'tasks'}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
          <span className="text-emerald-400">{data.completed} completed</span>
          <span>•</span>
          <span className="text-amber-400">{data.pending} pending</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  tasks,
  activeFilter,
  onSelectFilter,
  onSelectCategory,
  onSelectPriority,
}) => {
  const [dimension, setDimension] = useState<ChartDimension>('category');
  const [chartMode, setChartMode] = useState<ChartMode>('bar');
  const [isChartExpanded, setIsChartExpanded] = useState(true);

  // 1. Compute Category Distribution Data
  const categoryData: ChartDataItem[] = useMemo(() => {
    const map = new Map<Category, { total: number; completed: number; pending: number }>();
    
    // Initialize all categories so charts look balanced
    (Object.keys(CATEGORY_DEFINITIONS) as Category[]).forEach((cat) => {
      map.set(cat, { total: 0, completed: 0, pending: 0 });
    });

    tasks.forEach((t) => {
      const entry = map.get(t.category) || { total: 0, completed: 0, pending: 0 };
      entry.total += 1;
      if (t.completed) {
        entry.completed += 1;
      } else {
        entry.pending += 1;
      }
      map.set(t.category, entry);
    });

    return Array.from(map.entries())
      .filter(([_, val]) => val.total > 0 || tasks.length === 0)
      .map(([cat, val]): ChartDataItem => ({
        key: cat,
        name: CATEGORY_DEFINITIONS[cat]?.label || cat,
        count: val.total,
        completed: val.completed,
        pending: val.pending,
        color: CATEGORY_CHART_COLORS[cat] || '#64748b',
      }));
  }, [tasks]);

  // 2. Compute Priority Distribution Data
  const priorityData: ChartDataItem[] = useMemo(() => {
    const map = new Map<Priority, { total: number; completed: number; pending: number }>();
    
    (['high', 'medium', 'low'] as Priority[]).forEach((p) => {
      map.set(p, { total: 0, completed: 0, pending: 0 });
    });

    tasks.forEach((t) => {
      const entry = map.get(t.priority) || { total: 0, completed: 0, pending: 0 };
      entry.total += 1;
      if (t.completed) {
        entry.completed += 1;
      } else {
        entry.pending += 1;
      }
      map.set(t.priority, entry);
    });

    return (['high', 'medium', 'low'] as Priority[]).map((p): ChartDataItem => {
      const val = map.get(p) || { total: 0, completed: 0, pending: 0 };
      return {
        key: p,
        name: PRIORITY_DEFINITIONS[p]?.label || p,
        count: val.total,
        completed: val.completed,
        pending: val.pending,
        color: PRIORITY_CHART_COLORS[p] || '#64748b',
      };
    });
  }, [tasks]);

  const activeChartData: ChartDataItem[] = dimension === 'category' ? categoryData : priorityData;
  const hasTasks = tasks.length > 0;

  const cards = [
    {
      id: 'all' as FilterType,
      label: 'Total Tasks',
      value: stats.total,
      icon: <Layers className="w-4 h-4 text-slate-500" />,
      subtext: `${stats.todayCount} due today`,
      activeColor: 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/40',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'completed' as FilterType,
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      subtext: `${stats.completionRate}% completion`,
      activeColor: 'ring-2 ring-emerald-500 border-emerald-200 bg-emerald-50/40',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'pending' as FilterType,
      label: 'Pending',
      value: stats.pending,
      icon: <Clock className="w-4 h-4 text-indigo-600" />,
      subtext: 'Active workload',
      activeColor: 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/40',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'overdue' as FilterType,
      label: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
      subtext: stats.overdue > 0 ? 'Requires attention' : 'All caught up!',
      activeColor: 'ring-2 ring-rose-500 border-rose-200 bg-rose-50/40',
      badgeBg: stats.overdue > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {cards.map((card) => {
          const isSelected = activeFilter === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectFilter(card.id)}
              className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isSelected
                  ? card.activeColor
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs active:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <span className="p-1 rounded-lg bg-slate-50 border border-slate-100">
                  {card.icon}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1 truncate">
                {card.subtext}
              </p>
            </button>
          );
        })}
      </div>

      {/* Visual Completion Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Completion Overview
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                stats.total === 0
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : stats.completionRate === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : stats.completionRate >= 50
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {stats.completionRate}% Done
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">{stats.completed}</span>
            <span>of</span>
            <span className="font-semibold text-slate-800">{stats.total}</span>
            <span>{stats.total === 1 ? 'task' : 'tasks'} completed</span>
            {stats.total > 0 && stats.pending > 0 && (
              <span className="text-slate-400">({stats.pending} remaining)</span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar Track */}
        <div
          role="progressbar"
          aria-valuenow={stats.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Task completion progress: ${stats.completionRate}% completed`}
          className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-xs ${
              stats.completionRate === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : stats.completionRate >= 50
                ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600'
                : 'bg-gradient-to-r from-indigo-400 to-violet-500'
            }`}
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>

        {/* Motivational Milestone Context */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>
            {stats.total === 0
              ? 'Add tasks to begin tracking your progress'
              : stats.completionRate === 100
              ? '🎉 Outstanding! All tasks completed.'
              : stats.completionRate >= 75
              ? '⚡ Almost there! Crushing your goals today.'
              : stats.completionRate >= 50
              ? '🚀 Over halfway through your workload.'
              : stats.completionRate > 0
              ? '📋 Good start! Keep the momentum going.'
              : '⏳ Let’s tackle the first task on your list.'}
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
            {stats.completionRate}% / 100%
          </span>
        </div>
      </div>

      {/* Visual Chart Analytics Section (Recharts) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Analytics Header with Toggles */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Workload Distribution
              </h2>
              <p className="text-[11px] text-slate-500">
                Visual breakdown by {dimension}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dimension Switcher (Category vs Priority) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDimension('category')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  dimension === 'category'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => setDimension('priority')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  dimension === 'priority'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Priority
              </button>
            </div>

            {/* Chart Mode Switcher (Bar vs Donut) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setChartMode('bar')}
                title="Bar Chart view"
                className={`p-1 rounded-lg transition-all ${
                  chartMode === 'bar'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartMode('donut')}
                title="Donut Chart view"
                className={`p-1 rounded-lg transition-all ${
                  chartMode === 'donut'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapse/Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsChartExpanded(!isChartExpanded)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label={isChartExpanded ? 'Collapse chart' : 'Expand chart'}
            >
              {isChartExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Chart Body */}
        {isChartExpanded && (
          <div className="p-3.5 sm:p-5">
            {!hasTasks ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-600">No chart data available</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Create tasks to see real-time distribution and completion breakdown.
                </p>
              </div>
            ) : chartMode === 'bar' ? (
              /* Bar Chart View */
              <div>
                <div className="w-full h-52 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activeChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        interval={0}
                        tickFormatter={(val: string) => (val.length > 6 ? `${val.slice(0, 4)}.` : val)}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        onClick={(entry) => {
                          if (dimension === 'category' && onSelectCategory) {
                            onSelectCategory(entry.key as Category);
                          } else if (dimension === 'priority' && onSelectPriority) {
                            onSelectPriority(entry.key as Priority);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {activeChartData.map((item, index) => (
                          <Cell key={`bar-cell-${index}`} fill={item.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              /* Donut / Pie Chart View */
              <div className="w-full h-52 sm:h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Pie
                      data={activeChartData.filter((d) => d.count > 0)}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={3}
                      onClick={(entry) => {
                        if (dimension === 'category' && onSelectCategory) {
                          onSelectCategory(entry.key as Category);
                        } else if (dimension === 'priority' && onSelectPriority) {
                          onSelectPriority(entry.key as Priority);
                        }
                      }}
                      className="cursor-pointer outline-none"
                    >
                      {activeChartData.map((item, index) => (
                        <Cell key={`pie-cell-${index}`} fill={item.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Interactive Legend Tags */}
            {hasTasks && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
                {activeChartData
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        if (dimension === 'category' && onSelectCategory) {
                          onSelectCategory(item.key as Category);
                        } else if (dimension === 'priority' && onSelectPriority) {
                          onSelectPriority(item.key as Priority);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium transition-colors"
                      title={`Filter by ${item.name}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}:</span>
                      <span className="font-bold text-slate-900">{item.count}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
