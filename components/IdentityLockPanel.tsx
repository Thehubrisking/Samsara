
import React, { useRef } from 'react';
import type { IdentityLockConfig, ImageFile } from '../types';
import { LockIcon, FingerprintIcon, UploadIcon, ChevronRightIcon, TrashIcon, CropIcon } from './icons';

interface IdentityLockPanelProps {
  config: IdentityLockConfig;
  onConfigChange: (config: IdentityLockConfig) => void;
  structureImage: ImageFile | null;
  onStructureImageChange: (file: ImageFile | null) => void;
  onStructureCropRequest: () => void;
  textureImage: ImageFile | null;
  onTextureImageChange: (file: ImageFile | null) => void;
  onTextureCropRequest: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ImageUploaderCompact = ({ label, image, onChange, onCrop }: { label: string, image: ImageFile | null, onChange: (f: ImageFile | null) => void, onCrop?: () => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                onChange({ dataUrl, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">{label}</span>
            {image ? (
                <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-light-border dark:border-dark-border bg-gray-100 dark:bg-black/20">
                    <img src={image.dataUrl} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onCrop && (
                            <button 
                                onClick={onCrop}
                                className="p-1.5 bg-black/60 text-white rounded-md hover:bg-brand-red hover:text-dark-text transition-all"
                                title="Crop image"
                            >
                                <CropIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                            onClick={() => onChange(null)}
                            className="p-1.5 bg-black/60 text-white rounded-md hover:bg-red-500 transition-all"
                            title="Remove image"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-red hover:bg-gray-50 dark:hover:bg-white/5 transition-all gap-2"
                >
                    <UploadIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-medium-text dark:text-medium-text-dark uppercase font-black text-[8px] tracking-widest">Select</span>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
            )}
        </div>
    );
};

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

const SelectControl = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: any) => void }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-dark-text dark:text-light-text">{label}</label>
        <div className="flex bg-gray-100 dark:bg-black/20 rounded-md p-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition-all ${
                        value === opt 
                        ? 'bg-white dark:bg-gray-700 text-dark-text dark:text-light-text shadow-sm' 
                        : 'text-medium-text dark:text-medium-text-dark hover:bg-gray-200 dark:hover:bg-white/5'
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

export const IdentityLockPanel: React.FC<IdentityLockPanelProps> = ({ 
    config, onConfigChange, 
    structureImage, onStructureImageChange, onStructureCropRequest,
    textureImage, onTextureImageChange, onTextureCropRequest,
    isOpen, onToggle 
}) => {
  
  const updateConfig = (key: keyof IdentityLockConfig, value: any) => {
      onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className={`border border-light-border dark:border-dark-border rounded-xl overflow-hidden mb-6 transition-all duration-300 ${isOpen ? 'bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-brand-red/50' : 'bg-gray-50 dark:bg-dark-subtle-bg/30'}`}>
        <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-brand-red text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <FingerprintIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <h3 className={`text-sm font-bold transition-colors ${isOpen ? 'text-dark-text dark:text-light-text' : 'text-medium-text dark:text-medium-text-dark'}`}>Character Consistency Lock</h3>
                    {isOpen && <p className="text-[10px] text-medium-text dark:text-medium-text-dark">Lock facial structure and texture from separate references</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isOpen && config.enabled && <span className="text-[10px] font-bold bg-brand-red text-dark-text px-2 py-0.5 rounded-full">ACTIVE</span>}
                <ChevronRightIcon className={`w-4 h-4 text-medium-text dark:text-medium-text-dark transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>
        </button>

        {isOpen && (
            <div className="p-4 border-t border-light-border dark:border-dark-border animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 bg-gray-100 dark:bg-black/20 p-2 rounded-lg">
                    <span className="text-sm font-bold dark:text-light-text flex items-center gap-2">
                        <LockIcon className="w-4 h-4" />
                        Enable Identity Lock
                    </span>
                    <button 
                        onClick={() => updateConfig('enabled', !config.enabled)}
                        className={`w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner ${config.enabled ? 'bg-brand-red shadow-[0_0_10px_rgba(246,239,18,0.3)]' : 'bg-gray-400'}`}
                    >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {config.enabled && (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <ImageUploaderCompact 
                                label="Structure Ref (Input A)" 
                                image={structureImage} 
                                onChange={onStructureImageChange}
                                onCrop={onStructureCropRequest}
                            />
                            <ImageUploaderCompact 
                                label="Texture Ref (Input B)" 
                                image={textureImage} 
                                onChange={onTextureImageChange} 
                                onCrop={onTextureCropRequest}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="flex flex-col gap-4">
                                <h4 className="text-[10px] font-bold uppercase text-medium-text dark:text-medium-text-dark border-b border-light-border dark:border-dark-border pb-1 tracking-[0.2em]">Weights & Ratios</h4>
                                <SliderControl 
                                    label="Structure Weight" 
                                    value={config.structureWeight} 
                                    min={0} max={1} step={0.05} 
                                    onChange={(v) => updateConfig('structureWeight', v)} 
                                />
                                <SliderControl 
                                    label="Texture Weight" 
                                    value={config.textureWeight} 
                                    min={0} max={1} step={0.05} 
                                    onChange={(v) => updateConfig('textureWeight', v)} 
                                />
                                <SliderControl 
                                    label="Geometry Reinforcement" 
                                    value={config.geometryReinforcement} 
                                    min={0.5} max={2.0} step={0.1} 
                                    onChange={(v) => updateConfig('geometryReinforcement', v)} 
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <h4 className="text-[10px] font-bold uppercase text-medium-text dark:text-medium-text-dark border-b border-light-border dark:border-dark-border pb-1 tracking-[0.2em]">Geometry Locks</h4>
                                <SelectControl 
                                    label="Midface Lock" 
                                    value={config.midfaceLock} 
                                    options={['hard', 'soft', 'off']} 
                                    onChange={(v) => updateConfig('midfaceLock', v)} 
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <SelectControl 
                                        label="Cheekbones" 
                                        value={config.cheekboneLock} 
                                        options={['maximum', 'standard', 'off']} 
                                        onChange={(v) => updateConfig('cheekboneLock', v)} 
                                    />
                                    <SelectControl 
                                        label="Jawline" 
                                        value={config.jawlineLock} 
                                        options={['maximum', 'standard', 'off']} 
                                        onChange={(v) => updateConfig('jawlineLock', v)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                             <ToggleControl label="Micro Asymmetry" checked={config.microAsymmetry} onChange={(v) => updateConfig('microAsymmetry', v)} />
                             <ToggleControl label="No Eye Widening" checked={config.forbidEyeWidening} onChange={(v) => updateConfig('forbidEyeWidening', v)} />
                             <ToggleControl label="Angle Stability" checked={config.angleStability} onChange={(v) => updateConfig('angleStability', v)} />
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
