/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  Category,
  FilterType,
  Priority,
  SortType,
  TaskStats,
  PRIORITY_DEFINITIONS,
} from './types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  removeSampleTasksFromStorage,
  restoreSampleTasksToStorage,
  clearAllTasksFromStorage,
  sanitizeTask,
} from './services/storageService';
import {
  getTodayLocalString,
  isDateToday,
  isTaskOverdue,
  isTaskUpcoming,
} from './utils/dateUtils';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { SampleDataBanner } from './components/SampleDataBanner';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Primary Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [sortType, setSortType] = useState<SortType>('dueDate-asc');

  // Modals & Banners State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSampleBannerDismissed, setIsSampleBannerDismissed] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const { tasks: storedTasks, isFirstLaunch } = loadTasksFromStorage();
    setTasks(storedTasks);
    setIsLoaded(true);

    if (isFirstLaunch) {
      setToast({
        id: 'initial-welcome',
        type: 'info',
        message: 'Welcome to TaskFlow! Demo tasks loaded for evaluation.',
      });
    }

    // Cross-tab synchronization via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taskflow_tasks_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map(sanitizeTask).filter((t): t is Task => t !== null);
            setTasks(sanitized);
          }
        } catch {
          // Ignore malformed cross-tab updates safely
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 2. Persist Tasks on update
  const updateTasksAndPersist = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasksToStorage(newTasks);
  }, []);

  // 3. Create or Edit Task Handler
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();

    if (editingTask) {
      // Edit existing task
      const updatedList = tasks.map((t) => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            ...taskData,
            updatedAt: nowIso,
          };
        }
        return t;
      });

      updateTasksAndPersist(updatedList);
      setToast({
        id: `update-${Date.now()}`,
        type: 'success',
        message: `Task "${taskData.title}" updated successfully`,
      });
      setEditingTask(null);
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: nowIso,
        updatedAt: nowIso,
        isSample: false,
      };

      const updatedList = [newTask, ...tasks];
      updateTasksAndPersist(updatedList);
      setToast({
        id: `create-${Date.now()}`,
        type: 'success',
        message: `Task "${newTask.title}" added to your list`,
      });
    }
  };

  // 4. Toggle Task Completion
  const handleToggleComplete = (id: string) => {
    let toggledTitle = '';
    let isNowCompleted = false;

    const updatedList = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        toggledTitle = t.title;
        isNowCompleted = nextState;
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    updateTasksAndPersist(updatedList);

    setToast({
      id: `toggle-${Date.now()}`,
      type: 'success',
      message: isNowCompleted
        ? `Completed: "${toggledTitle}" 🎉`
        : `Marked "${toggledTitle}" as pending`,
    });
  };

  // 5. Delete Task with Confirmation and Instant Undo
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;

    const taskToDelete = deleteCandidate;
    const taskIndex = tasks.findIndex((t) => t.id === taskToDelete.id);
    const updatedList = tasks.filter((t) => t.id !== taskToDelete.id);

    updateTasksAndPersist(updatedList);
    setDeleteCandidate(null);

    // Provide immediate undo action in toast using current state
    setToast({
      id: `delete-${Date.now()}`,
      type: 'warning',
      message: `Deleted "${taskToDelete.title}"`,
      actionLabel: 'Undo',
      duration: 6000,
      onAction: () => {
        setTasks((currentTasks) => {
          if (currentTasks.some((t) => t.id === taskToDelete.id)) return currentTasks;
          const restored = [...currentTasks];
          if (taskIndex >= 0 && taskIndex <= restored.length) {
            restored.splice(taskIndex, 0, taskToDelete);
          } else {
            restored.unshift(taskToDelete);
          }
          saveTasksToStorage(restored);
          return restored;
        });
        setToast({
          id: `undo-${Date.now()}`,
          type: 'success',
          message: `Restored "${taskToDelete.title}"`,
        });
      },
    });
  };

  // 6. Sample Data Management (Never reinserts on reload!)
  const sampleCount = useMemo(() => {
    return tasks.filter((t) => t.isSample).length;
  }, [tasks]);

  const handleRemoveSampleData = () => {
    const cleaned = removeSampleTasksFromStorage(tasks);
    setTasks(cleaned);
    setIsSampleBannerDismissed(true);
    setToast({
      id: `remove-samples-${Date.now()}`,
      type: 'info',
      message: 'All sample demo tasks removed.',
    });
  };

  const handleRestoreSampleData = () => {
    const restored = restoreSampleTasksToStorage(tasks);
    setTasks(restored);
    setIsSampleBannerDismissed(false);
    setToast({
      id: `restore-samples-${Date.now()}`,
      type: 'success',
      message: 'Demo sample tasks loaded.',
    });
  };

  const handleClearAllTasks = () => {
    clearAllTasksFromStorage();
    setTasks([]);
    setToast({
      id: `clear-all-${Date.now()}`,
      type: 'warning',
      message: 'All tasks have been cleared.',
    });
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    const sanitizedList: Task[] = [];
    const existingIds = new Set(tasks.map((t) => t.id));

    for (const raw of importedTasks) {
      const sanitized = sanitizeTask(raw);
      if (sanitized) {
        if (existingIds.has(sanitized.id)) {
          sanitized.id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        }
        existingIds.add(sanitized.id);
        sanitizedList.push(sanitized);
      }
    }

    if (sanitizedList.length === 0) {
      setToast({
        id: `import-failed-${Date.now()}`,
        type: 'warning',
        message: 'No valid task records found in the imported file.',
      });
      return;
    }

    const updated = [...sanitizedList, ...tasks];
    updateTasksAndPersist(updated);
    setToast({
      id: `import-${Date.now()}`,
      type: 'success',
      message: `Imported ${sanitizedList.length} valid ${sanitizedList.length === 1 ? 'task' : 'tasks'} successfully!`,
    });
  };

  // 7. Calculate Derived Dashboard Statistics & Tab Counts in a single pass
  const { stats, tabCounts } = useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let overdue = 0;
    let todayCount = 0;
    let upcoming = 0;

    for (const t of tasks) {
      if (t.completed) {
        completed++;
      } else if (isTaskOverdue(t.dueDate, false)) {
        overdue++;
      }

      if (isDateToday(t.dueDate)) {
        todayCount++;
      }

      if (isTaskUpcoming(t.dueDate)) {
        upcoming++;
      }
    }

    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      stats: {
        total,
        completed,
        pending,
        overdue,
        todayCount,
        completionRate,
      },
      tabCounts: {
        all: total,
        pending,
        today: todayCount,
        upcoming,
        completed,
        overdue,
      },
    };
  }, [tasks]);

  // 8. Filter & Search & Sort Pipeline
  const filteredAndSortedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Step A: Primary Tab Filter
    let result = tasks.filter((task) => {
      if (activeFilter === 'completed') {
        if (!task.completed) return false;
      } else if (activeFilter === 'pending') {
        if (task.completed) return false;
      } else if (activeFilter === 'today') {
        if (!isDateToday(task.dueDate)) return false;
      } else if (activeFilter === 'upcoming') {
        if (!isTaskUpcoming(task.dueDate)) return false;
      } else if (activeFilter === 'overdue') {
        if (!isTaskOverdue(task.dueDate, task.completed)) return false;
      }
      return true;
    });

    // Step B: Secondary Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((task) => task.category === selectedCategory);
    }

    // Step C: Secondary Priority Filter
    if (selectedPriority !== 'all') {
      result = result.filter((task) => task.priority === selectedPriority);
    }

    // Step D: Search Query by Title or Description
    if (query) {
      result = result.filter((task) => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        return titleMatch || descMatch;
      });
    }

    // Step E: Sorting
    return [...result].sort((a, b) => {
      // Completed tasks can be kept naturally or sorted by chosen criteria
      switch (sortType) {
        case 'dueDate-asc': {
          // Tasks without due date go to the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'dueDate-desc': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        case 'priority-desc': {
          const weightA = PRIORITY_DEFINITIONS[a.priority]?.weight || 1;
          const weightB = PRIORITY_DEFINITIONS[b.priority]?.weight || 1;
          return weightB - weightA;
        }
        case 'priority-asc': {
          const weightA = PRIORITY_DEFINITIONS[a.priority]?.weight || 1;
          const weightB = PRIORITY_DEFINITIONS[b.priority]?.weight || 1;
          return weightA - weightB;
        }
        case 'created-desc': {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case 'created-asc': {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        case 'title-asc': {
          return a.title.localeCompare(b.title);
        }
        default:
          return 0;
      }
    });
  }, [tasks, activeFilter, selectedCategory, selectedPriority, searchQuery, sortType]);

  const hasActiveFilters = Boolean(
    activeFilter !== 'all' ||
      selectedCategory !== 'all' ||
      selectedPriority !== 'all' ||
      searchQuery.trim()
  );

  const handleResetFilters = () => {
    setActiveFilter('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSearchQuery('');
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        onOpenCreateModal={handleOpenCreate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        sampleCount={sampleCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
        {/* Sample Data Banner */}
        {!isSampleBannerDismissed && sampleCount > 0 && (
          <SampleDataBanner
            sampleCount={sampleCount}
            onRemoveSampleData={handleRemoveSampleData}
            onKeepSampleData={() => setIsSampleBannerDismissed(true)}
          />
        )}

        {/* Dashboard Statistics & Visual Chart Analytics */}
        <DashboardStats
          stats={stats}
          tasks={tasks}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onSelectPriority={(p) => setSelectedPriority(p)}
        />

        {/* Filter and Search Controls */}
        <TaskFilterBar
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          sortType={sortType}
          onSortChange={setSortType}
          counts={tabCounts}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Task List and Empty States */}
        <TaskList
          tasks={filteredAndSortedTasks}
          totalTasksCount={tasks.length}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenEdit}
          onRequestDelete={(task) => setDeleteCandidate(task)}
          onOpenCreateModal={handleOpenCreate}
          onResetFilters={handleResetFilters}
          onRestoreSampleData={handleRestoreSampleData}
        />
      </main>

      {/* Floating Action Button (FAB) on mobile for easy reach */}
      <div className="sm:hidden fixed bottom-6 right-5 z-40">
        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="Create new task"
        >
          <span className="text-2xl font-light leading-none">+</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-500 bg-white/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            TaskFlow &bull; Mobile App Developer Intern Portfolio Project
          </p>
          <p className="text-[11px] text-slate-400">
            Offline & localStorage persistent &bull; Built with React & TypeScript
          </p>
        </div>
      </footer>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={deleteCandidate}
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Settings & Sample Data Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tasks={tasks}
        sampleCount={sampleCount}
        onRemoveSampleData={handleRemoveSampleData}
        onRestoreSampleData={handleRestoreSampleData}
        onClearAllTasks={handleClearAllTasks}
        onImportTasks={handleImportTasks}
      />

      {/* Feedback Toast with Undo action */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
