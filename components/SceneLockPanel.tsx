
import React, { useRef } from 'react';
import type { SceneLockConfig, ImageFile } from '../types';
import { RectangleIcon, UploadIcon, ChevronRightIcon, TrashIcon, CropIcon } from './icons';

interface SceneLockPanelProps {
  config: SceneLockConfig;
  onConfigChange: (config: SceneLockConfig) => void;
  sceneLockImage: ImageFile | null;
  onSceneLockImageChange: (file: ImageFile | null) => void;
  onSceneCropRequest: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SliderControl = ({ label, value, onChange, min, max, step }: { label: string, value: number, onChange: (v: number) => void, min: number, max: number, step: number }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-dark-text dark:text-light-text">{label}</label>
            <span className="text-xs font-mono text-medium-text dark:text-medium-text-dark">{value.toFixed(2)}</span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-green-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const ToggleControl = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-dark-text dark:text-light-text">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-10 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    </div>
);

export const SceneLockPanel: React.FC<SceneLockPanelProps> = ({ 
    config, onConfigChange, 
    sceneLockImage, onSceneLockImageChange, onSceneCropRequest,
    isOpen, onToggle 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => onSceneLockImageChange({ dataUrl: e.target?.result as string, mimeType: file.type });
          reader.readAsDataURL(file);
      }
  };

  const updateConfig = (key: keyof SceneLockConfig, value: any) => {
      onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className={`border border-light-border dark:border-dark-border rounded-xl overflow-hidden mb-6 transition-all duration-300 ${isOpen ? 'bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-green-500/50' : 'bg-gray-50 dark:bg-dark-subtle-bg/30'}`}>
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <RectangleIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <h3 className={`text-sm font-bold transition-colors ${isOpen ? 'text-dark-text dark:text-light-text' : 'text-medium-text dark:text-medium-text-dark'}`}>Scene Consistency Lock</h3>
                    {isOpen && <p className="text-[10px] text-medium-text dark:text-medium-text-dark">Freeze architecture and lighting across variations</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isOpen && config.enabled && <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">FIXED</span>}
                <ChevronRightIcon className={`w-4 h-4 text-medium-text dark:text-medium-text-dark transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>
        </button>

        {isOpen && (
            <div className="p-4 border-t border-light-border dark:border-dark-border animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-black/20 p-2 rounded-lg">
                    <span className="text-sm font-bold dark:text-light-text flex items-center gap-2">
                        <RectangleIcon className="w-4 h-4" />
                        Enable Scene Lock
                    </span>
                    <button 
                        onClick={() => updateConfig('enabled', !config.enabled)} 
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${config.enabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-400'}`}
                    >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${config.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>

                {config.enabled && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">Scene Reference (Input D)</span>
                             {sceneLockImage ? (
                                 <div className="relative group w-full h-40 rounded-lg overflow-hidden border border-light-border dark:border-dark-border bg-black/20">
                                     <img src={sceneLockImage.dataUrl} alt="Scene" className="w-full h-full object-cover" />
                                     <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={onSceneCropRequest}
                                            className="p-1.5 bg-black/60 text-white rounded-md hover:bg-brand-red hover:text-dark-text transition-all"
                                            title="Crop image"
                                        >
                                            <CropIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onSceneLockImageChange(null)} className="p-1.5 bg-black/60 text-white rounded-md hover:bg-red-500 transition-all"><TrashIcon className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                             ) : (
                                 <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all gap-2">
                                     <UploadIcon className="w-8 h-8 text-gray-400" />
                                     <span className="text-xs text-medium-text dark:text-medium-text-dark uppercase font-black text-[8px] tracking-[0.2em]">Upload Spatial Environment</span>
                                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                 </div>
                             )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SliderControl label="Layout Stability" value={config.layoutWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('layoutWeight', v)} />
                            <SliderControl label="Lighting Match" value={config.lightingWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('lightingWeight', v)} />
                            <SliderControl label="Atmosphere Depth" value={config.atmosphereWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('atmosphereWeight', v)} />
                            <div className="flex flex-col gap-3 pt-2">
                                <ToggleControl label="Lock Architecture" checked={config.geometryLock} onChange={(v) => updateConfig('geometryLock', v)} />
                                <ToggleControl label="Preserve Shadows" checked={config.preserveShadows} onChange={(v) => updateConfig('preserveShadows', v)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
