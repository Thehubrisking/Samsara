
import React from 'react';
import { PaintBrushIcon, ShirtIcon, PuzzleIcon } from './icons';

export type Mode = 'edit' | 'style';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modes: { id: Mode; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'edit', label: 'Canvas Retouch', icon: PaintBrushIcon },
  { id: 'style', label: 'Persona Curation', icon: ShirtIcon },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex w-full bg-black/20 backdrop-blur-md p-1 rounded-2xl border-[0.5px] border-white/5">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex-1 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium py-3 rounded-xl transition-all duration-700 ${
            currentMode === mode.id
              ? 'bg-white/5 text-brand-red shadow-inner'
              : 'bg-transparent text-white/20 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <mode.icon className={`w-4 h-4 transition-colors ${currentMode === mode.id ? 'text-brand-red' : 'text-white/10'}`} />
          {mode.label}
        </button>
      ))}
    </div>
  );
};
