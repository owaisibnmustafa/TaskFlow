/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, CheckSquare2, Settings2 } from 'lucide-react';
import { formatFullDate, getTodayLocalString } from '../utils/dateUtils';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenSettings: () => void;
  sampleCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenSettings,
  sampleCount,
}) => {
  const todayFormatted = formatFullDate(getTodayLocalString());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand & Date */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 flex-shrink-0">
            <CheckSquare2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                TaskFlow
              </h1>
              <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                v1.0
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            title="App Settings & Sample Data"
            aria-label="Settings and Data Options"
            className="relative min-h-[42px] min-w-[42px] px-2.5 sm:px-3 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <Settings2 className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline text-xs">Manage Data</span>
            {sampleCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="min-h-[42px] flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98]"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
            <span>New<span className="hidden xs:inline"> Task</span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
