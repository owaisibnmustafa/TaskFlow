/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  Task,
  CATEGORY_DEFINITIONS,
  PRIORITY_DEFINITIONS,
} from '../types/task';
import {
  formatDueDateBadge,
  formatDateTime,
  isTaskOverdue,
  isDateToday,
} from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onRequestDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryMeta = CATEGORY_DEFINITIONS[task.category] || CATEGORY_DEFINITIONS.other;
  const priorityMeta = PRIORITY_DEFINITIONS[task.priority] || PRIORITY_DEFINITIONS.medium;
  const dueBadge = formatDueDateBadge(task.dueDate, task.completed);

  const isOverdue = !task.completed && isTaskOverdue(task.dueDate, false);
  const isDueToday = !task.completed && isDateToday(task.dueDate);

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-sm ${
        task.completed
          ? 'border-slate-200/60 bg-slate-50/60 opacity-80'
          : isOverdue
          ? 'border-rose-300 bg-gradient-to-r from-rose-50/30 via-white to-white border-l-4 border-l-rose-500 shadow-rose-100/40'
          : isDueToday
          ? 'border-amber-300 bg-gradient-to-r from-amber-50/25 via-white to-white border-l-4 border-l-amber-500 shadow-amber-100/40'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Custom Checkbox (Comfortable 44px+ touch target hit area) */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            onClick={() => onToggleComplete(task.id)}
            className="min-w-[44px] min-h-[44px] -m-2 p-2 flex items-center justify-center flex-shrink-0 focus:outline-none group/chk"
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                task.completed
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-200'
                  : 'border-2 border-slate-300 group-hover/chk:border-indigo-600 group-active/chk:scale-95 bg-white'
              }`}
            >
              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* Main Task Body */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {/* Urgent Visual Alert Pill (Overdue or Due Today) */}
              {isOverdue && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span>Overdue</span>
                </span>
              )}

              {isDueToday && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span>Due Today</span>
                </span>
              )}

              {/* Priority Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityMeta.badgeBg} ${priorityMeta.badgeText} ${priorityMeta.badgeBorder}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotColor}`} />
                {priorityMeta.label}
              </span>

              {/* Category Pill */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${categoryMeta.bgLight} ${categoryMeta.textColor} ${categoryMeta.borderColor}`}
              >
                {categoryMeta.label}
              </span>

              {/* Sample indicator */}
              {task.isSample && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  Demo
                </span>
              )}
            </div>

            {/* Title */}
            <h2
              onClick={() => onToggleComplete(task.id)}
              className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer transition-colors ${
                task.completed
                  ? 'line-through text-slate-400 font-normal'
                  : 'text-slate-900 hover:text-indigo-600'
              }`}
            >
              {task.title}
            </h2>

            {/* Description (collapsible / toggleable) */}
            {task.description && (
              <div className="mt-1">
                <p
                  className={`text-xs text-slate-600 leading-relaxed ${
                    !isExpanded ? 'line-clamp-2' : ''
                  }`}
                >
                  {task.description}
                </p>
                {task.description.length > 90 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 focus:outline-none"
                  >
                    <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Due Date & Action Meta Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
              {/* Due Date Indicator */}
              <div className="flex items-center gap-1.5">
                {task.dueDate ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${
                      dueBadge.isOverdue
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : dueBadge.isToday
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : task.completed
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}
                  >
                    {dueBadge.isOverdue ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span>{dueBadge.label}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">No deadline</span>
                )}

                {task.completed && task.completedAt && (
                  <span className="hidden sm:inline text-[11px] text-emerald-600 font-medium">
                    Done {formatDateTime(task.completedAt)}
                  </span>
                )}
              </div>

              {/* Action Buttons (comfortable touch targets) */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="min-w-[38px] min-h-[38px] p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 flex items-center justify-center"
                  aria-label={`Edit task "${task.title}"`}
                  title="Edit task"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDelete(task)}
                  className="min-w-[38px] min-h-[38px] p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/30 flex items-center justify-center"
                  aria-label={`Delete task "${task.title}"`}
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
