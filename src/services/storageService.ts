/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Category, Priority } from '../types/task';
import { getTodayLocalString, getRelativeDateString } from '../utils/dateUtils';

const STORAGE_KEY_TASKS = 'taskflow_tasks_v2';
const STORAGE_KEY_INITIALIZED = 'taskflow_has_initialized_v2';

// In-memory fallback if localStorage is disabled or throws
let memoryTasksCache: Task[] | null = null;
let memoryInitializedFlag = false;

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__taskflow_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates realistic sample data for mobile developer intern portfolio evaluation.
 */
export function createInitialSampleTasks(): Task[] {
  const today = getTodayLocalString();
  const tomorrow = getRelativeDateString(1);
  const nextWeek = getRelativeDateString(4);
  const twoDaysAgo = getRelativeDateString(-2);
  const nowIso = new Date().toISOString();

  return [
    {
      id: 'sample-task-1',
      title: 'Review React component hierarchy & props flow',
      description: 'Audit TaskFlow component tree to ensure modularity, prop cleanliness, and predictable state updates.',
      priority: 'high',
      category: 'work',
      dueDate: today,
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      isSample: true,
    },
    {
      id: 'sample-task-2',
      title: 'Prepare Mobile App Developer portfolio deck',
      description: 'Highlight mobile-first responsive design, touch targets, state persistence, and clean TypeScript architecture.',
      priority: 'high',
      category: 'study',
      dueDate: tomorrow,
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      isSample: true,
    },
    {
      id: 'sample-task-3',
      title: 'Audit touch accessibility and tap targets (44px min)',
      description: 'Verify all interactive controls, buttons, and switches meet mobile UX and WCAG standards on small viewports.',
      priority: 'medium',
      category: 'work',
      dueDate: nextWeek,
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      isSample: true,
    },
    {
      id: 'sample-task-4',
      title: 'Research offline-first patterns in mobile PWAs',
      description: 'Evaluate cache strategies, background sync, and indexedDB vs localStorage performance tradeoffs.',
      priority: 'medium',
      category: 'study',
      dueDate: twoDaysAgo, // Overdue demo
      completed: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      isSample: true,
    },
    {
      id: 'sample-task-5',
      title: 'Set up clean Git commit conventions',
      description: 'Follow Conventional Commits format (feat, fix, docs, refactor) for seamless project history.',
      priority: 'low',
      category: 'personal',
      dueDate: twoDaysAgo,
      completed: true,
      completedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      isSample: true,
    },
  ];
}

/**
 * Validates and sanitizes a raw task object to guarantee runtime safety.
 */
export function sanitizeTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;

  if (typeof item.id !== 'string' || !item.id) return null;
  if (typeof item.title !== 'string' || !item.title.trim()) return null;

  const validPriorities: Priority[] = ['high', 'medium', 'low'];
  const priority: Priority = validPriorities.includes(item.priority as Priority)
    ? (item.priority as Priority)
    : 'medium';

  const validCategories: Category[] = ['work', 'personal', 'study', 'health', 'finance', 'other'];
  const category: Category = validCategories.includes(item.category as Category)
    ? (item.category as Category)
    : 'other';

  return {
    id: String(item.id),
    title: String(item.title).trim(),
    description: typeof item.description === 'string' ? item.description.trim() : '',
    priority,
    category,
    dueDate: typeof item.dueDate === 'string' ? item.dueDate : '',
    completed: Boolean(item.completed),
    completedAt: typeof item.completedAt === 'string' ? item.completedAt : undefined,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    isSample: Boolean(item.isSample),
  };
}

/**
 * Loads tasks from localStorage with complete error-resilience and first-time seed logic.
 * NEVER re-inserts deleted sample tasks on reload once initialized.
 */
export function loadTasksFromStorage(): { tasks: Task[]; isFirstLaunch: boolean } {
  if (!isLocalStorageAvailable()) {
    if (!memoryInitializedFlag) {
      memoryInitializedFlag = true;
      memoryTasksCache = createInitialSampleTasks();
      return { tasks: memoryTasksCache, isFirstLaunch: true };
    }
    return { tasks: memoryTasksCache || [], isFirstLaunch: false };
  }

  try {
    const initialized = window.localStorage.getItem(STORAGE_KEY_INITIALIZED);
    const rawData = window.localStorage.getItem(STORAGE_KEY_TASKS);

    // If app has never initialized before, seed with initial demo tasks
    if (!initialized) {
      const sampleTasks = createInitialSampleTasks();
      saveTasksToStorage(sampleTasks);
      window.localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
      return { tasks: sampleTasks, isFirstLaunch: true };
    }

    // App has initialized previously. If rawData is null or empty, respect user's state!
    if (!rawData) {
      return { tasks: [], isFirstLaunch: false };
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return { tasks: [], isFirstLaunch: false };
    }

    const sanitizedTasks: Task[] = [];
    for (const item of parsed) {
      const task = sanitizeTask(item);
      if (task) {
        sanitizedTasks.push(task);
      }
    }

    return { tasks: sanitizedTasks, isFirstLaunch: false };
  } catch (error) {
    console.error('TaskFlow: Failed to read from localStorage:', error);
    return { tasks: memoryTasksCache || [], isFirstLaunch: false };
  }
}

/**
 * Saves tasks to localStorage safely.
 */
export function saveTasksToStorage(tasks: Task[]): boolean {
  memoryTasksCache = [...tasks];
  if (!isLocalStorageAvailable()) {
    return true;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('TaskFlow: Failed to save tasks to localStorage:', error);
    return false;
  }
}

/**
 * Removes all sample demo tasks while preserving user-created tasks.
 */
export function removeSampleTasksFromStorage(currentTasks: Task[]): Task[] {
  const filtered = currentTasks.filter(t => !t.isSample);
  saveTasksToStorage(filtered);
  return filtered;
}

/**
 * Re-inserts or appends sample tasks if requested by user for testing.
 */
export function restoreSampleTasksToStorage(currentTasks: Task[]): Task[] {
  const sampleTasks = createInitialSampleTasks();
  // Filter out any existing sample tasks to avoid duplicate IDs
  const nonSample = currentTasks.filter(t => !t.isSample);
  const merged = [...sampleTasks, ...nonSample];
  saveTasksToStorage(merged);
  return merged;
}

/**
 * Clears all tasks (resetting to empty state).
 */
export function clearAllTasksFromStorage(): void {
  saveTasksToStorage([]);
}
