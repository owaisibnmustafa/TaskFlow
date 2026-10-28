/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import {
  Task,
  Category,
  Priority,
  CATEGORY_DEFINITIONS,
  PRIORITY_DEFINITIONS,
} from '../types/task';
import {
  getTodayLocalString,
  getRelativeDateString,
  formatDueDateBadge,
} from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setPriority(initialTask.priority);
        setCategory(initialTask.category);
        setDueDate(initialTask.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('work');
        setDueDate(getTodayLocalString());
      }
      setTitleError(null);
      setIsSubmitting(false);

      // Focus title after mount
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialTask]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length < 2) {
      setTitleError('Title must be at least 2 characters long.');
      titleInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || '',
      completed: initialTask ? initialTask.completed : false,
      completedAt: initialTask ? initialTask.completedAt : undefined,
      isSample: false, // Edited or newly created tasks become standard user tasks
    });

    onClose();
  };

  const handleQuickDate = (dateVal: string) => {
    setDueDate(dateVal);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card / Bottom Sheet on mobile */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 id="task-modal-title" className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update your task details and deadline'
                : 'Plan your next milestone with clear priorities'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/100</span>
            </div>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g., Implement authentication state unit tests"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none ${
                titleError
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
            {titleError && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{titleError}</span>
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-desc" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">{description.length}/400</span>
            </div>
            <textarea
              id="task-desc"
              rows={3}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, acceptance criteria, or relevant links..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const meta = PRIORITY_DEFINITIONS[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`min-h-[42px] py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all focus:outline-none ${
                      isSelected
                        ? `${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder} ring-2 ring-indigo-500/30 font-bold shadow-xs`
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 active:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(Object.keys(CATEGORY_DEFINITIONS) as Category[]).map((cat) => {
                const meta = CATEGORY_DEFINITIONS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[40px] py-2 px-2 rounded-xl border text-xs font-medium text-center flex items-center justify-center transition-all focus:outline-none ${
                      isSelected
                        ? `${meta.bgLight} ${meta.textColor} ${meta.borderColor} font-bold ring-2 ring-indigo-500/30`
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date with Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-due-date" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Due Date
              </label>
              {dueDate && (
                <span className="text-[11px] font-semibold text-indigo-600 truncate max-w-[160px]">
                  {formatDueDateBadge(dueDate, false).label}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base sm:text-sm text-slate-900 transition-all outline-none"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </div>

            {/* Quick date chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-0.5">Quick:</span>
              <button
                type="button"
                onClick={() => handleQuickDate(getTodayLocalString())}
                className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dueDate === getTodayLocalString()
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(getRelativeDateString(1))}
                className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dueDate === getRelativeDateString(1)
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(getRelativeDateString(7))}
                className={`min-h-[34px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dueDate === getRelativeDateString(7)
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                +1 Week
              </button>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="min-h-[34px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
                >
                  Clear date
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
