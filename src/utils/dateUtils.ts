/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's LOCAL timezone.
 * Avoids UTC offset bugs caused by toISOString().
 */
export function getTodayLocalString(): string {
  const d = new Date();
  return formatDateToLocalString(d);
}

/**
 * Formats a Date object to YYYY-MM-DD using local calendar year, month, and day.
 */
export function formatDateToLocalString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds offset days to today in local calendar and returns YYYY-MM-DD.
 */
export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateToLocalString(d);
}

/**
 * Parses a YYYY-MM-DD string into a local Date object at 00:00:00.
 */
export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const d = new Date(year, month, day, 0, 0, 0, 0);
  // Verify date validity (e.g., handles invalid Feb 31)
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
    return null;
  }
  return d;
}

/**
 * Checks if a given YYYY-MM-DD date is today in local time.
 */
export function isDateToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayLocalString();
}

/**
 * Checks if a task is overdue.
 * A task is overdue only if it has a valid due date, is not completed,
 * and the due date is strictly before today's local date.
 */
export function isTaskOverdue(dueDate?: string, completed?: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = getTodayLocalString();
  return dueDate < today;
}

/**
 * Checks if a task recently became overdue (within the last specified days, default 7).
 */
export function isRecentlyOverdue(dueDate?: string, completed?: boolean, daysWindow = 7): boolean {
  if (!dueDate || completed) return false;
  const diff = getCalendarDayDiff(dueDate);
  return diff !== null && diff < 0 && diff >= -daysWindow;
}

/**
 * Checks if a task due date is upcoming (strictly after today).
 */
export function isTaskUpcoming(dueDate?: string): boolean {
  if (!dueDate) return false;
  const today = getTodayLocalString();
  return dueDate > today;
}

/**
 * Calculates the difference in whole calendar days between a target date and today.
 * Positive = future, Negative = past, 0 = today.
 */
export function getCalendarDayDiff(dateStr: string): number | null {
  const targetDate = parseLocalDate(dateStr);
  const todayDate = parseLocalDate(getTodayLocalString());
  if (!targetDate || !todayDate) return null;

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((targetDate.getTime() - todayDate.getTime()) / msPerDay);
}

/**
 * Formats a due date for quick, human-friendly badge presentation.
 */
export function formatDueDateBadge(dueDate?: string, completed?: boolean): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isUpcoming: boolean;
} {
  if (!dueDate) {
    return {
      label: 'No due date',
      isOverdue: false,
      isToday: false,
      isUpcoming: false,
    };
  }

  const diff = getCalendarDayDiff(dueDate);
  const parsed = parseLocalDate(dueDate);
  const monthDayFormat = parsed
    ? parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : dueDate;

  if (diff === null) {
    return {
      label: dueDate,
      isOverdue: false,
      isToday: false,
      isUpcoming: false,
    };
  }

  if (diff === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isToday: true,
      isUpcoming: false,
    };
  }

  if (diff === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      isToday: false,
      isUpcoming: true,
    };
  }

  if (diff === -1) {
    return {
      label: completed ? 'Due yesterday' : 'Overdue (yesterday)',
      isOverdue: !completed,
      isToday: false,
      isUpcoming: false,
    };
  }

  if (diff < -1) {
    const daysAgo = Math.abs(diff);
    return {
      label: completed ? `Due ${monthDayFormat}` : `Overdue by ${daysAgo}d (${monthDayFormat})`,
      isOverdue: !completed,
      isToday: false,
      isUpcoming: false,
    };
  }

  // Future > 1 day
  if (diff <= 7) {
    return {
      label: `In ${diff} days (${monthDayFormat})`,
      isOverdue: false,
      isToday: false,
      isUpcoming: true,
    };
  }

  return {
    label: monthDayFormat,
    isOverdue: false,
    isToday: false,
    isUpcoming: true,
  };
}

/**
 * Formats a full date for detailed view, e.g. "Wednesday, Oct 28, 2026"
 */
export function formatFullDate(dateStr?: string): string {
  if (!dateStr) return 'Not set';
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return dateStr;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats ISO timestamp to local readable time e.g. "Oct 28, 2:30 PM"
 */
export function formatDateTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
