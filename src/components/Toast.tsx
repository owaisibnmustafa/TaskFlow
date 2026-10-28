/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />,
  };

  const type = toast.type || 'info';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-800 p-3.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {iconMap[type]}
          <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">{toast.message}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onClose();
              }}
              className="min-h-[36px] px-3 py-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center justify-center"
            >
              {toast.actionLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="min-h-[36px] min-w-[36px] p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
