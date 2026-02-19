
import React, { useRef } from 'react';
import type { GarmentLockConfig, ImageFile } from '../types';
import { ShirtIcon, UploadIcon, ChevronRightIcon, TrashIcon, CropIcon } from './icons';

interface GarmentLockPanelProps {
  config: GarmentLockConfig;
  onConfigChange: (config: GarmentLockConfig) => void;
  garmentImages: ImageFile[];
  onGarmentImagesChange: (files: ImageFile[]) => void;
  onGarmentCropRequest: (index: number) => void;
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
            className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const ToggleControl = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-dark-text dark:text-light-text">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-10 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    </div>
);

export const GarmentLockPanel: React.FC<GarmentLockPanelProps> = ({ 
    config, onConfigChange, 
    garmentImages, onGarmentImagesChange, onGarmentCropRequest,
    isOpen, onToggle 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
      
      const newImages: ImageFile[] = [];
      const fileList = Array.from(files) as File[];
      const imageFiles = fileList.filter(file => file.type.startsWith('image/'));

      let processedCount = 0;
      imageFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
              newImages.push({ dataUrl: e.target?.result as string, mimeType: file.type });
              processedCount++;
              if (processedCount === imageFiles.length) {
                  onGarmentImagesChange([...garmentImages, ...newImages]);
              }
          };
          reader.readAsDataURL(file);
      });
  };

  const removeImage = (index: number) => {
      onGarmentImagesChange(garmentImages.filter((_, i) => i !== index));
  };

  const updateConfig = (key: keyof GarmentLockConfig, value: any) => {
      onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className={`border border-light-border dark:border-dark-border rounded-xl overflow-hidden mb-6 transition-all duration-300 ${isOpen ? 'bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-blue-500/50' : 'bg-gray-50 dark:bg-dark-subtle-bg/30'}`}>
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <ShirtIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <h3 className={`text-sm font-bold transition-colors ${isOpen ? 'text-dark-text dark:text-light-text' : 'text-medium-text dark:text-medium-text-dark'}`}>Garment Consistency Lock</h3>
                    {isOpen && <p className="text-[10px] text-medium-text dark:text-medium-text-dark">Contextual synthesis from multiple clothing references</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isOpen && config.enabled && <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">LOCKED</span>}
                <ChevronRightIcon className={`w-4 h-4 text-medium-text dark:text-medium-text-dark transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>
        </button>

        {isOpen && (
            <div className="p-4 border-t border-light-border dark:border-dark-border animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-black/20 p-2 rounded-lg">
                    <span className="text-sm font-bold dark:text-light-text flex items-center gap-2">
                        <ShirtIcon className="w-4 h-4" />
                        Enable Garment Lock
                    </span>
                    <button 
                        onClick={() => updateConfig('enabled', !config.enabled)} 
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${config.enabled ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-gray-400'}`}
                    >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${config.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>

                {config.enabled && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                             <span className="text-[10px] font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">Garment Reference Pool (Contextual)</span>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                 {garmentImages.map((img, idx) => (
                                     <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-light-border dark:border-dark-border bg-black/20 shadow-sm">
                                         <img src={img.dataUrl} alt={`Garment ${idx}`} className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => onGarmentCropRequest(idx)}
                                                className="p-1.5 bg-black/60 text-white rounded-md hover:bg-brand-red hover:text-dark-text transition-all"
                                                title="Crop"
                                            >
                                                <CropIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => removeImage(idx)} 
                                                className="p-1.5 bg-black/60 text-white rounded-md hover:bg-red-500 transition-all"
                                                title="Remove"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                         </div>
                                     </div>
                                 ))}
                                 <button 
                                     onClick={() => fileInputRef.current?.click()} 
                                     className="aspect-square rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all gap-2 group"
                                 >
                                     <UploadIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                                     <span className="text-xs text-medium-text dark:text-medium-text-dark uppercase font-black text-[8px] tracking-[0.2em] group-hover:text-blue-500">Add Context</span>
                                     <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                                 </button>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SliderControl label="Fabric Texture" value={config.fabricWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('fabricWeight', v)} />
                            <SliderControl label="Silhouette Precision" value={config.silhouetteWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('silhouetteWeight', v)} />
                            <SliderControl label="Detail Reinforcement" value={config.detailWeight} min={0} max={1.5} step={0.05} onChange={(v) => updateConfig('detailWeight', v)} />
                            <div className="flex flex-col gap-3 pt-2">
                                <ToggleControl label="Stitching Match" checked={config.stitchingPrecision} onChange={(v) => updateConfig('stitchingPrecision', v)} />
                                <ToggleControl label="Physics/Drape" checked={config.physicsMatch} onChange={(v) => updateConfig('physicsMatch', v)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
