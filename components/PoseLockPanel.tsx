
import React, { useRef } from 'react';
import type { PoseLockConfig, ImageFile } from '../types';
import { PoseIcon, UploadIcon, ChevronRightIcon, TrashIcon, CropIcon } from './icons';

interface PoseLockPanelProps {
  config: PoseLockConfig;
  onConfigChange: (config: PoseLockConfig) => void;
  poseImage: ImageFile | null;
  onPoseImageChange: (file: ImageFile | null) => void;
  onPoseCropRequest: () => void;
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
            className="w-full accent-brand-red h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const ToggleControl = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-dark-text dark:text-light-text">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-10 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-brand-red shadow-[0_0_10px_rgba(246,239,18,0.3)]' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    </div>
);

export const PoseLockPanel: React.FC<PoseLockPanelProps> = ({ 
    config, onConfigChange, 
    poseImage, onPoseImageChange, onPoseCropRequest,
    isOpen, onToggle 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => onPoseImageChange({ dataUrl: e.target?.result as string, mimeType: file.type });
          reader.readAsDataURL(file);
      }
  };

  const updateConfig = (key: keyof PoseLockConfig, value: any) => {
      onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className={`border border-light-border dark:border-dark-border rounded-xl overflow-hidden mb-6 transition-all duration-300 ${isOpen ? 'bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-brand-red/50' : 'bg-gray-50 dark:bg-dark-subtle-bg/30'}`}>
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-brand-red text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <PoseIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <h3 className={`text-sm font-bold transition-colors ${isOpen ? 'text-dark-text dark:text-light-text' : 'text-medium-text dark:text-medium-text-dark'}`}>Pose Consistency Lock</h3>
                    {isOpen && <p className="text-[10px] text-medium-text dark:text-medium-text-dark">Transfer limb placement and body weight from reference</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isOpen && config.enabled && <span className="text-[10px] font-bold bg-brand-red text-dark-text px-2 py-0.5 rounded-full">POSE LOCKED</span>}
                <ChevronRightIcon className={`w-4 h-4 text-medium-text dark:text-medium-text-dark transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>
        </button>

        {isOpen && (
            <div className="p-4 border-t border-light-border dark:border-dark-border animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-black/20 p-2 rounded-lg">
                    <span className="text-sm font-bold dark:text-light-text flex items-center gap-2">
                        <PoseIcon className="w-4 h-4" />
                        Enable Pose Anatomy Engine
                    </span>
                    <button 
                        onClick={() => updateConfig('enabled', !config.enabled)} 
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${config.enabled ? 'bg-brand-red shadow-[0_0_10px_rgba(246,239,18,0.3)]' : 'bg-gray-400'}`}
                    >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${config.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>

                {config.enabled && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">Pose Reference (Anatomy Guide)</span>
                             {poseImage ? (
                                 <div className="relative group w-full h-40 rounded-lg overflow-hidden border border-light-border dark:border-dark-border bg-black/20">
                                     <img src={poseImage.dataUrl} alt="Pose Ref" className="w-full h-full object-cover" />
                                     <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={onPoseCropRequest}
                                            className="p-1.5 bg-black/60 text-white rounded-md hover:bg-brand-red hover:text-dark-text transition-all"
                                            title="Crop pose"
                                        >
                                            <CropIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onPoseImageChange(null)} className="p-1.5 bg-black/60 text-white rounded-md hover:bg-red-500 transition-all"><TrashIcon className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                             ) : (
                                 <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-red hover:bg-gray-50 dark:hover:bg-white/5 transition-all gap-2">
                                     <UploadIcon className="w-8 h-8 text-gray-400" />
                                     <span className="text-xs text-medium-text dark:text-medium-text-dark uppercase font-black text-[8px] tracking-[0.2em]">Upload Skeletal Reference</span>
                                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                 </div>
                             )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SliderControl label="Pose Rigidity" value={config.poseWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('poseWeight', v)} />
                            <SliderControl label="Anatomy Preservation" value={config.anatomyMatch} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('anatomyMatch', v)} />
                            <div className="flex flex-col gap-3 pt-2 md:col-span-2">
                                <ToggleControl label="Strict Limb Precision" checked={config.limbPrecision} onChange={(v) => updateConfig('limbPrecision', v)} />
                                <ToggleControl label="Native Proportions" checked={config.preserveSubjectAnatomy} onChange={(v) => updateConfig('preserveSubjectAnatomy', v)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
