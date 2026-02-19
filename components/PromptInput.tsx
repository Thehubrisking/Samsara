
import React, { useState } from 'react';
import { ExpandIcon, XIcon, ChevronRightIcon, SlidersIcon } from './icons';
import type { ZonePrompts } from '../types';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  zonePrompts: ZonePrompts;
  onZonePromptChange: (zone: keyof ZonePrompts, val: string) => void;
}

const examplePrompts = [
    "Add a cute, fluffy cat wearing a wizard hat",
    "Change the background to a futuristic cityscape at night",
    "Make it look like an oil painting",
    "Add a dramatic sunset in the sky",
];

const ZONES: Array<{ key: keyof ZonePrompts; label: string; color: string; desc: string }> = [
  { key: 'red', label: 'Red (Removal)', color: '#FF3B30', desc: 'Object Erasure' },
  { key: 'yellow', label: 'Yellow (Transform)', color: '#F6EF12', desc: 'Texture/Form Morph' },
  { key: 'green', label: 'Green (Addition)', color: '#34C759', desc: 'New Elements' },
  { key: 'blue', label: 'Blue (Lighting)', color: '#007AFF', desc: 'Shadows/FX' },
  { key: 'purple', label: 'Purple (Morph)', color: '#AF52DE', desc: 'Neural Distortion' },
];

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, zonePrompts, onZonePromptChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const randomPlaceholder = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];

  // Cast Object.values to string[] to ensure 'v' is string for .trim()
  const activeZonesCount = (Object.values(zonePrompts) as string[]).filter(v => v.trim() !== '').length;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative group">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Global instructions, e.g., "${randomPlaceholder}"`}
            rows={4}
            className="w-full bg-gray-100 dark:bg-dark-subtle-bg border border-light-border dark:border-dark-border rounded-md p-3 pr-10 text-dark-text dark:text-light-text focus:ring-2 focus:ring-brand-red focus:outline-none transition-shadow resize-y min-h-[100px]"
          />
          <button 
              onClick={() => setIsExpanded(true)}
              className="absolute top-2 right-2 p-1.5 text-medium-text dark:text-medium-text-dark hover:text-brand-red dark:hover:text-brand-red transition-colors opacity-50 group-hover:opacity-100"
              title="Expand to full screen editor"
          >
              <ExpandIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {ZONES.map((zone) => (
            <div key={zone.key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">{zone.label}</span>
              </div>
              <input 
                type="text"
                value={zonePrompts[zone.key]}
                onChange={(e) => onZonePromptChange(zone.key, e.target.value)}
                placeholder="Intent..."
                className="w-full bg-white/5 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white/80 outline-none focus:border-brand-red/50 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200">
            <div className="bg-light-card dark:bg-dark-card w-full max-w-[1400px] h-full rounded-2xl shadow-2xl flex flex-col border border-light-border dark:border-dark-border overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-subtle-bg/30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-brand-red text-black rounded-lg">
                            <SlidersIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-dark-text dark:text-light-text flex items-center gap-3">
                                Atelier Prompt Sequencer
                                <span className="text-xs font-black text-brand-red bg-brand-red/10 px-3 py-1 rounded-full uppercase tracking-tighter">Pro Context Editor</span>
                            </h3>
                            <p className="text-xs text-medium-text dark:text-medium-text-dark font-medium">Coordinate global logic with spatial semantic zones</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="p-2 text-medium-text dark:text-medium-text-dark hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all"
                    >
                        <XIcon className="w-7 h-7" />
                    </button>
                </div>
                
                {/* Modal Content - Split Pane */}
                <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Pane: Primary Logic */}
                    <div className="lg:w-2/3 flex flex-col border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-card">
                        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-black/10">
                            <span className="text-[10px] font-black uppercase text-brand-red tracking-[0.2em]">Global Output Logic</span>
                            <span className="text-[10px] text-white/20 font-mono italic">Primary Context Layer</span>
                        </div>
                        <div className="flex-grow p-6">
                            <textarea
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={`Describe your image in detail...`}
                                className="w-full h-full bg-transparent text-xl md:text-2xl text-dark-text dark:text-light-text focus:outline-none resize-none font-mono leading-relaxed placeholder:opacity-20"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Right Pane: Spatial Overrides */}
                    <div className="lg:w-1/3 flex flex-col bg-gray-50 dark:bg-black/20">
                        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-100 dark:bg-white/5">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Spatial Semantic Overrides</span>
                            {activeZonesCount > 0 && (
                                <span className="bg-brand-red text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{activeZonesCount} Active</span>
                            )}
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {ZONES.map((zone) => (
                                <div key={zone.key} className={`group flex flex-col gap-3 p-4 rounded-xl border transition-all ${zonePrompts[zone.key] ? 'bg-brand-red/5 border-brand-red/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(246,239,18,0.3)]" style={{ backgroundColor: zone.color }} />
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-white/80 tracking-widest">{zone.label}</h4>
                                                <p className="text-[8px] font-bold text-white/20 uppercase leading-none">{zone.desc}</p>
                                            </div>
                                        </div>
                                        {zonePrompts[zone.key] && (
                                            <button 
                                                onClick={() => onZonePromptChange(zone.key, '')}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-500 transition-all"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <textarea 
                                        value={zonePrompts[zone.key]}
                                        onChange={(e) => onZonePromptChange(zone.key, e.target.value)}
                                        placeholder={`Specific intent for ${zone.key} zone...`}
                                        rows={3}
                                        className="w-full bg-black/20 rounded-lg p-3 text-xs text-white/70 outline-none resize-none border border-white/5 focus:border-brand-red/50 transition-colors leading-relaxed placeholder:text-white/10"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-light-border dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-card flex-shrink-0">
                    <p className="text-[10px] text-medium-text dark:text-medium-text-dark font-medium uppercase tracking-widest italic opacity-50">
                        * Spatial Overrides take priority over Global Logic in their respective mapped regions.
                    </p>
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="bg-brand-red hover:bg-brand-red-dark text-black font-black py-4 px-12 rounded-xl transition-all uppercase text-sm tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-3"
                    >
                        Save Studio Config
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
