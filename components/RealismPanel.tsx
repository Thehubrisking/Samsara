
import React from 'react';
import type { RealismConfig } from '../types';
import { ChevronRightIcon, UserIcon, LayersIcon, SparkleIcon, ZapIcon } from 'lucide-react';

interface RealismPanelProps {
  config: RealismConfig;
  onConfigChange: (config: RealismConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SliderControl = ({ label, value, onChange, min, max, step, className = "" }: { label: string, value: number, onChange: (v: number) => void, min: number, max: number, step: number, className?: string }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{label}</label>
            <span className="text-[10px] font-mono text-brand-red font-bold">{value.toFixed(2)}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-brand-red h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
        />
    </div>
);

const ToggleControl = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-brand-red shadow-[0_0_10px_rgba(246,239,18,0.3)]' : 'bg-white/10'}`}
    >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
);

// Define interface for SectionCard props to ensure children are correctly handled
interface SectionCardProps {
    icon: any;
    title: string;
    enabled: boolean;
    onToggle: (v: boolean) => void;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon: Icon, title, enabled, onToggle, children }) => (
    <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-brand-red" />
                <span className="text-[10px] font-black text-white tracking-[0.15em] uppercase">{title}</span>
            </div>
            <ToggleControl checked={enabled} onChange={onToggle} />
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Enabled</span>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

export const RealismPanel: React.FC<RealismPanelProps> = ({ config, onConfigChange, isOpen, onToggle }) => {
  const updateConfig = (key: keyof RealismConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const updateModule = (moduleKey: keyof RealismConfig['modules'], updates: any) => {
    onConfigChange({
        ...config,
        modules: {
            ...config.modules,
            [moduleKey]: { ...config.modules[moduleKey], ...updates }
        }
    });
  };

  return (
    <div className={`border border-white/10 rounded-xl overflow-hidden mb-6 transition-all duration-500 ${isOpen ? 'bg-[#151515] shadow-2xl ring-1 ring-brand-red/10' : 'bg-neutral-950/50 hover:bg-neutral-900/50'}`}>
        <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg transition-all duration-300 ${isOpen ? 'bg-brand-red text-black shadow-lg shadow-brand-red/10' : 'bg-white/5 text-brand-red'}`}>
                    <SparkleIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <h3 className={`text-xs font-black tracking-widest uppercase transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/70'}`}>Skin Realism Engine</h3>
                </div>
            </div>
            <ChevronRightIcon className={`w-4 h-4 text-white/20 transition-transform duration-500 ${isOpen ? 'rotate-90 text-brand-red' : ''}`} />
        </button>

        {isOpen && (
            <div className="p-6 pt-2 border-t border-white/5 bg-[#111111] animate-in fade-in slide-in-from-top-4 duration-500">
                
                {/* Main Override Toggle */}
                <div className="flex items-center justify-between py-6 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-3">
                        <ZapIcon className="w-4 h-4 text-brand-red" />
                        <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Enable Realism Overrides</span>
                    </div>
                    <ToggleControl checked={config.enabled} onChange={(v) => updateConfig('enabled', v)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Age Profile Segmented Control */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Age Profile</label>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                            {['teen', 'adult', 'older'].map((age) => (
                                <button
                                    key={age}
                                    onClick={() => updateConfig('ageProfile', age)}
                                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${config.ageProfile === age ? 'bg-[#3A3F4B] text-brand-red shadow-lg' : 'text-white/30 hover:text-white/60'}`}
                                >
                                    {age}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Retouch Style Dropdown */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Retouch Style</label>
                        <div className="relative group">
                            <select 
                                value={config.preset}
                                onChange={(e) => updateConfig('preset', e.target.value)}
                                className="w-full bg-white/5 border border-white/5 p-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-brand-red"
                            >
                                <option value="NATURAL REALISM" className="bg-[#1a1a1a]">Natural Realism</option>
                                <option value="BEAUTY CLEAN" className="bg-[#1a1a1a]">Beauty Clean</option>
                                <option value="EDITORIAL" className="bg-[#1a1a1a]">Editorial</option>
                                <option value="RAW DETAIL" className="bg-[#1a1a1a]">Raw Detail</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                <ChevronRightIcon className="w-3 h-3 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Intensity Slider */}
                <div className="mb-8 space-y-4">
                    <SliderControl 
                        label="Global Intensity" 
                        value={config.intensity} 
                        min={0} max={1} step={0.01} 
                        onChange={(v) => updateConfig('intensity', v)} 
                    />
                </div>

                {/* Preserve Identity Marks Toggle */}
                <div className="flex items-center justify-between mb-8 py-2">
                    <span className="text-[10px] font-black text-white tracking-[0.1em] uppercase">Preserve Identity Marks</span>
                    <ToggleControl checked={config.preserveIdentityMarks} onChange={(v) => updateConfig('preserveIdentityMarks', v)} />
                </div>

                {/* Modules Grid - 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Micro-Texture & Pores */}
                    <SectionCard icon={ZapIcon} title="Micro-Texture & Pores" enabled={config.modules.poreTexture.enabled} onToggle={(v) => updateModule('poreTexture', { enabled: v })}>
                        <SliderControl label="Pore Strength" value={config.modules.poreTexture.poreStrength} min={0} max={1} step={0.01} onChange={(v) => updateModule('poreTexture', { poreStrength: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <SliderControl label="Nose Pores" value={config.modules.poreTexture.nosePores} min={0} max={1} step={0.01} onChange={(v) => updateModule('poreTexture', { nosePores: v })} />
                            <SliderControl label="Cheek Pores" value={config.modules.poreTexture.cheekPores} min={0} max={1} step={0.01} onChange={(v) => updateModule('poreTexture', { cheekPores: v })} />
                        </div>
                    </SectionCard>

                    {/* Tone Variation */}
                    <SectionCard icon={UserIcon} title="Tone Variation" enabled={config.modules.toneVariation.enabled} onToggle={(v) => updateModule('toneVariation', { enabled: v })}>
                        <SliderControl label="Mottling Scale" value={config.modules.toneVariation.mottlingScale} min={0} max={1} step={0.01} onChange={(v) => updateModule('toneVariation', { mottlingScale: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <SliderControl label="Cheek Warmth" value={config.modules.toneVariation.cheekWarmth} min={0} max={1} step={0.01} onChange={(v) => updateModule('toneVariation', { cheekWarmth: v })} />
                            <SliderControl label="Nose Redness" value={config.modules.toneVariation.noseRedness} min={0} max={1} step={0.01} onChange={(v) => updateModule('toneVariation', { noseRedness: v })} />
                        </div>
                    </SectionCard>

                    {/* Lines & Imperfections */}
                    <SectionCard icon={LayersIcon} title="Lines & Imperfections" enabled={config.modules.fineLines.enabled} onToggle={(v) => updateModule('fineLines', { enabled: v })}>
                        <SliderControl label="Crease Softness" value={config.modules.fineLines.creaseSoftness} min={0} max={1} step={0.01} onChange={(v) => updateModule('fineLines', { creaseSoftness: v })} />
                        <SliderControl label="Blemish Probability" value={config.modules.fineLines.blemishProbability} min={0} max={1} step={0.01} onChange={(v) => updateModule('fineLines', { blemishProbability: v })} />
                    </SectionCard>

                    {/* Natural Sheen */}
                    <SectionCard icon={SparkleIcon} title="Natural Sheen" enabled={config.modules.naturalSheen.enabled} onToggle={(v) => updateModule('naturalSheen', { enabled: v })}>
                        <SliderControl label="Forehead Shine" value={config.modules.naturalSheen.foreheadShine} min={0} max={1} step={0.01} onChange={(v) => updateModule('naturalSheen', { foreheadShine: v })} />
                        <SliderControl label="Nose Shine" value={config.modules.naturalSheen.noseShine} min={0} max={1} step={0.01} onChange={(v) => updateModule('naturalSheen', { noseShine: v })} />
                    </SectionCard>
                </div>
            </div>
        )}
    </div>
  );
};
