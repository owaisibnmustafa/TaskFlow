/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

interface SampleDataBannerProps {
  sampleCount: number;
  onRemoveSampleData: () => void;
  onKeepSampleData: () => void;
}

export const SampleDataBanner: React.FC<SampleDataBannerProps> = ({
  sampleCount,
  onRemoveSampleData,
  onKeepSampleData,
}) => {
  if (sampleCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 border border-indigo-200/80 rounded-2xl p-3.5 sm:p-4 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="p-1.5 bg-indigo-600 text-white rounded-xl flex-shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-slate-900">
            Demo dataset active ({sampleCount} sample {sampleCount === 1 ? 'task' : 'tasks'})
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Loaded for your initial evaluation. You can clear them anytime or keep editing them.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto flex flex-col xs:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onKeepSampleData}
          className="min-h-[40px] px-3 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Keep Sample Tasks</span>
        </button>
        <button
          type="button"
          onClick={onRemoveSampleData}
          className="min-h-[40px] px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-xs shadow-rose-200 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Remove Sample Tasks</span>
        </button>
      </div>
    </div>
  );
};
