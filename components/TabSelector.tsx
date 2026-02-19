import React from 'react';
import { AppMode } from '../types';
import { Sparkles, Palette } from 'lucide-react';

interface TabSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex p-1 space-x-1 bg-slate-800 rounded-xl mb-8 border border-slate-700">
      <button
        onClick={() => onModeChange(AppMode.CREATE)}
        className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          currentMode === AppMode.CREATE
            ? 'bg-banana-400 text-slate-900 shadow-lg shadow-banana-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Create New
      </button>
      <button
        onClick={() => onModeChange(AppMode.STYLE)}
        className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          currentMode === AppMode.STYLE
            ? 'bg-banana-400 text-slate-900 shadow-lg shadow-banana-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <Palette className="w-4 h-4 mr-2" />
        Style Existing
      </button>
    </div>
  );
};