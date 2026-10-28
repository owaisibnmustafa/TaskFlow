/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Task } from '../types/task';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  sampleCount: number;
  onRemoveSampleData: () => void;
  onRestoreSampleData: () => void;
  onClearAllTasks: () => void;
  onImportTasks: (importedTasks: Task[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  sampleCount,
  onRemoveSampleData,
  onRestoreSampleData,
  onClearAllTasks,
  onImportTasks,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportTasks(parsed);
          onClose();
        } else {
          setImportError('Invalid JSON: Root element must be an array of tasks.');
        }
      } catch {
        setImportError('Failed to parse file: Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="settings-title" className="text-base sm:text-lg font-bold text-slate-900">
              Data & Portfolio Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Demo Dataset Controls */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Sample Demo Dataset
            </h3>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                    Sample tasks status
                  </p>
                  <p className="text-xs text-slate-500">
                    {sampleCount > 0
                      ? `${sampleCount} sample tasks currently active in storage.`
                      : 'No sample tasks present. Only your custom tasks are active.'}
                  </p>
                </div>
                {sampleCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700">
                    Active
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {sampleCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveSampleData();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove All Sample Tasks</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreSampleData();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Demo Sample Tasks</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Data Backup & Migration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-colors text-left"
              >
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Export to JSON</p>
                  <p className="text-[11px] text-slate-500">Download {tasks.length} tasks</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5 transition-colors text-left"
              >
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Import from JSON</p>
                  <p className="text-[11px] text-slate-500">Restore from backup</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {importError && (
              <p className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                {importError}
              </p>
            )}
          </div>

          {/* Danger Zone: Wipe All Tasks */}
          <div>
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2.5">
              Danger Zone
            </h3>
            <div className="p-3.5 border border-rose-200 bg-rose-50/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="font-semibold text-rose-900 text-xs sm:text-sm">Clear all application data</p>
                <p className="text-[11px] text-rose-700/80">
                  Permanently deletes all {tasks.length} tasks from your browser's localStorage.
                </p>
              </div>
              {confirmClear ? (
                <div className="flex items-center gap-1.5 self-start sm:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllTasks();
                      onClose();
                    }}
                    className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-center flex-shrink-0"
                >
                  Clear Everything
                </button>
              )}
            </div>
          </div>

          {/* Architecture info */}
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mobile Developer Intern Portfolio Project</span>
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Built with React 19, TypeScript, and strict local calendar date boundaries. Zero external backends or tracking. Data is persisted securely inside your client device's localStorage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
