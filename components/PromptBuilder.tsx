
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PromptConfig, WeightedField, Camera3DParams } from '../types';
import { ChevronRightIcon, XCircleIcon, SlidersIcon, VideoIcon, LightingIcon, ExpandIcon, XIcon, ZoomInIcon, ZoomOutIcon } from './icons';

// --- Data Constants ---
const CAMERA_BODIES = [
    "Leica M6", "Hasselblad 500C/M", "Canon EOS R5", "Sony A7R IV", "Fujifilm GFX 100S", 
    "Fujifilm X-T4", "Arri Alexa Mini", "Polaroid SX-70", "Nikon Z9", "Phase One XF IQ4", "GoPro Hero 11",
    "Pentax 67", "Contax T2", "Mamiya RZ67", "Canon AE-1 Program", "Kodak Disposable"
];

const LENS_OPTIONS = [
    "35mm Summilux f/1.4", "50mm Noctilux f/0.95", "80mm Planar f/2.8", "24-70mm f/2.8 L",
    "16-35mm f/2.8 GM", "110mm f/2 R LM", "35mm Anamorphic", "116mm f/8 (Fixed)",
    "85mm f/1.4 Portrait", "105mm f/2.8 Macro", "XF 35mm f/1.4 R"
];

const FILM_SIMULATIONS = [
    "Fujifilm Provia (Standard)", "Fujifilm Velvia (Vivid)", "Fujifilm Astia (Soft)", 
    "Fujifilm Classic Chrome", "Fujifilm Pro Neg. Hi", "Fujifilm Pro Neg. Std", 
    "Fujifilm Classic Neg.", "Fujifilm Eterna (Cinema)", "Fujifilm Eterna Bleach Bypass", 
    "Fujifilm Acros", "Fujifilm Monochrome", "Fujifilm Sepia",
    "Kodak Portra 400", "Ilford HP5 Plus (B&W)", "Kodak Gold 200", 
    "Cinestill 800T", "Agfa Vista 200", "Kodak Ektar 100", 
    "Kodak Tri-X 400", "Polaroid 600", "Kodachrome 64", "Fujifilm Superia 400"
];

const IMAGE_EFFECTS = [
    "Clarity Boost", "HDR Mode", "Heavy Grain", "Color Chrome Effect", "Color Chrome Blue",
    "Dynamic Range 400%", "White Priority WB", "Ambience Priority WB",
    "Toy Camera", "Miniature Effect", "Pop Color", "High-Key", "Low-Key", 
    "Dynamic Tone", "Soft Focus", "Partial Color", "Smooth Skin Effect",
    "Candid", "Gritty", "Vintage", "Clean", "Matte"
];

const MOODS = [
    "Melancholic", "Euphoric", "Cyberpunk", "Noir", "Ethereal", "Gritty", 
    "Whimsical", "Minimalist", "Romantic", "Apocalyptic", "Dreamy", "Nostalgic", "Cinematic", "Surreal"
];

const SHOT_TYPES = [
    "Extreme Close-Up", "Close-Up", "Medium Shot", "Cowboy Shot", "Full Body", 
    "Wide Angle", "Ultra Wide", "Macro", "Telephoto Compression", "Birds-Eye View", 
    "Worm's-Eye View", "Over-the-Shoulder", "Point of View (POV)"
];

const ANGLES = [
    "Eye-Level", "Low Angle", "High Angle", "Dutch Angle", "Overhead", "Ground Level", "Aerial"
];

const LIGHTING = [
    "Golden Hour", "Blue Hour", "Rembrandt", "Butterfly", "Split", "Rim Light", 
    "Neon", "Diffused/Softbox", "Harsh Sunlight", "Bioluminescent", "Chiaroscuro", "Studio Strobe"
];

const CAMERA_PRESETS: Record<string, Partial<{ 
    lens: string, aperture: string, shutter: string, iso: string, filmSimulation: string, mood: string, focus: string, shotType: string, lighting: string, angle: string, orientation: string
}>> = {
    "Leica M6": { lens: "35mm Summilux f/1.4", aperture: "f/2.0", shutter: "1/125s", iso: "400", filmSimulation: "Kodak Tri-X 400", focus: "Manual Rangefinder", lighting: "Natural Window", angle: "Eye-Level" },
    "Hasselblad 500C/M": { lens: "80mm Planar f/2.8", aperture: "f/5.6", shutter: "1/60s", iso: "160", filmSimulation: "Kodak Portra 400", focus: "Waist-level View", lighting: "Studio Softbox", angle: "Waist-Level", orientation: "Square" },
};

// --- 3D Universal Gizmo Viewport Component ---

const Camera3DScene = ({ 
    params, 
    onChange,
    isExpanded = false
}: { 
    params: Camera3DParams, 
    onChange: (p: Camera3DParams) => void,
    isExpanded?: boolean
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<'camera' | 'light' | 'object' | 'zoom' | 'background' | null>(null);
    const [hoverType, setHoverType] = useState<string | null>(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        
        const baseRadius = Math.min(w, h) * 0.38;
        const orbitRadius = baseRadius * (1 / params.distance);

        ctx.clearRect(0, 0, w, h);

        // --- 1. Draw Perspective Grid (Floor) ---
        ctx.save();
        const gridOpacity = Math.max(0, (params.elevation + 90) / 180) * 0.1;
        ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`;
        ctx.lineWidth = 1;
        
        const elFactor = Math.max(0.05, (params.elevation + 90) / 180);
        ctx.translate(cx, cy + (params.elevation * 0.45));
        
        const gridStep = 50;
        const gridCount = 12;
        for (let i = -gridCount; i <= gridCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridStep, -gridCount * gridStep * elFactor);
            ctx.lineTo(i * gridStep, gridCount * gridStep * elFactor);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-gridCount * gridStep, i * gridStep * elFactor);
            ctx.lineTo(gridCount * gridStep, i * gridStep * elFactor);
            ctx.stroke();
        }
        ctx.restore();

        // --- 2. Draw Shadows (Responsive to Light Source) ---
        ctx.save();
        ctx.translate(cx, cy);
        
        const ltRad = (params.lightAzimuth - 90) * (Math.PI / 180);
        const shRad = ltRad + Math.PI; // Shadow stretches opposite to light
        const shLen = 40; // Base shadow length
        
        ctx.save();
        ctx.translate(Math.cos(shRad) * shLen * 0.5, Math.sin(shRad) * shLen * 0.5 * 0.6);
        ctx.rotate(shRad);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.filter = 'blur(4px)';
        
        // Subject Shadow
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Marker Shadow Calculation
        const azRad = (params.azimuth - 90) * (Math.PI / 180);
        const elRad = params.elevation * (Math.PI / 180);
        const camX = orbitRadius * Math.cos(azRad) * Math.cos(elRad);
        const camY = (orbitRadius * 0.6 * Math.sin(azRad) * Math.cos(elRad)) - (params.elevation * 0.8);

        // Subtle drop shadow for markers to make them "float"
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(camX + Math.cos(shRad) * 10, camY + Math.sin(shRad) * 10, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // --- 3. Draw Rotation Guides ---
        ctx.save();
        ctx.translate(cx, cy);
        
        // Light Orbit Ring
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = hoverType === 'light' || dragType === 'light' ? 'rgba(255, 165, 0, 0.8)' : 'rgba(255, 165, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius * 1.3, orbitRadius * 1.3 * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Camera Orbit Ring
        ctx.setLineDash([]);
        ctx.strokeStyle = hoverType === 'camera' || dragType === 'camera' ? 'rgba(246, 239, 18, 0.8)' : 'rgba(246, 239, 18, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius, orbitRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();

        // --- 4. Draw Subject ---
        ctx.save();
        const objRad = (params.objectRotation - 90) * (Math.PI / 180);
        ctx.rotate(objRad);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        gradient.addColorStop(0, 'rgba(246, 239, 18, 0.2)');
        gradient.addColorStop(1, 'rgba(246, 239, 18, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-30, -30, 60, 60);

        ctx.fillStyle = '#F6EF12';
        ctx.shadowBlur = dragType === 'object' ? 20 : 10;
        ctx.shadowColor = 'rgba(246, 239, 18, 0.6)';
        
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(12, -4); ctx.lineTo(24, 0); ctx.lineTo(12, 4);
        ctx.fill();
        ctx.restore();

        // --- 5. Draw Markers ---
        const ltX = (orbitRadius * 1.3) * Math.cos(ltRad);
        const ltY = (orbitRadius * 1.3 * 0.6) * Math.sin(ltRad);

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(camX, camY); ctx.stroke();
        ctx.setLineDash([]);

        // Light Handle
        ctx.fillStyle = dragType === 'light' ? '#FFF' : '#FFA500';
        ctx.shadowBlur = hoverType === 'light' ? 25 : 15;
        ctx.shadowColor = 'orange';
        ctx.beginPath(); ctx.arc(ltX, ltY, 14, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('LIGHT', ltX, ltY);

        // Camera Handle
        ctx.fillStyle = dragType === 'camera' ? '#FFF' : '#F6EF12';
        ctx.shadowBlur = hoverType === 'camera' ? 25 : 15;
        ctx.shadowColor = 'rgba(246, 239, 18, 0.6)';
        ctx.beginPath(); ctx.arc(camX, camY, 16, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.fillText('CAM', camX, camY);

        ctx.restore();

    }, [params, dragType, hoverType]);

    useEffect(() => {
        const resize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                draw();
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [draw, isExpanded]);

    useEffect(() => { draw(); }, [params, draw, dragType, hoverType]);

    const getHitType = (x: number, y: number): 'camera' | 'light' | 'object' | 'background' => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const relX = x - cx;
        const relY = y - cy;
        const dist = Math.hypot(relX, relY);

        const baseRadius = Math.min(rect.width, rect.height) * 0.38;
        const orbitRadius = baseRadius * (1 / params.distance);

        const azRad = (params.azimuth - 90) * (Math.PI / 180);
        const elRad = params.elevation * (Math.PI / 180);
        const camX = orbitRadius * Math.cos(azRad) * Math.cos(elRad);
        const camY = (orbitRadius * 0.6 * Math.sin(azRad) * Math.cos(elRad)) - (params.elevation * 0.8);

        const ltRad = (params.lightAzimuth - 90) * (Math.PI / 180);
        const ltX = (orbitRadius * 1.3) * Math.cos(ltRad);
        const ltY = (orbitRadius * 1.3 * 0.6) * Math.sin(ltRad);

        if (Math.hypot(relX - camX, relY - camY) < 25) return 'camera';
        if (Math.hypot(relX - ltX, relY - ltY) < 25) return 'light';
        if (dist < 40) return 'object';
        return 'background';
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!isDragging) {
            setHoverType(getHitType(x, y));
            return;
        }

        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const relX = x - cx;
        const relY = y - cy;

        const currentAz = (Math.atan2(relY, relX) * 180 / Math.PI + 450) % 360;

        if (dragType === 'camera' || dragType === 'background') {
            const el = Math.max(-88, Math.min(88, -relY * 0.6));
            onChange({ ...params, azimuth: Math.round(currentAz), elevation: Math.round(el) });
        } else if (dragType === 'light') {
            onChange({ ...params, lightAzimuth: Math.round(currentAz) });
        } else if (dragType === 'object') {
            onChange({ ...params, objectRotation: Math.round(currentAz) });
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.05 : -0.05;
        const newDist = Math.max(0.3, Math.min(5, params.distance + delta));
        onChange({ ...params, distance: parseFloat(newDist.toFixed(2)) });
    };

    return (
        <div 
            ref={containerRef} 
            className={`w-full relative bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden cursor-move touch-none transition-all ${isExpanded ? 'h-full' : 'h-[380px]'}`}
            onWheel={handleWheel}
        >
            <canvas 
                ref={canvasRef} 
                className="w-full h-full"
                onPointerDown={(e) => {
                    const rect = canvasRef.current!.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const hit = getHitType(x, y);
                    setIsDragging(true);
                    setDragType(hit);
                    canvasRef.current!.setPointerCapture(e.pointerId);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={(e) => {
                    setIsDragging(false);
                    setDragType(null);
                    canvasRef.current?.releasePointerCapture(e.pointerId);
                }}
            />
            
            <div className="absolute top-4 left-4 pointer-events-none space-y-2">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-red shadow-[0_0_8px_#F6EF12]" />
                    <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">POV: {params.azimuth}° AZ / {params.elevation}° EL</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_orange]" />
                    <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">LIGHT: {params.lightAzimuth}°</span>
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
                <p className="text-[9px] font-black text-white tracking-[0.8em] uppercase">Universal Stage Gizmo</p>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                 <div className="bg-black/80 backdrop-blur-xl p-1 rounded-xl border border-white/10 flex flex-col items-center shadow-2xl">
                    <button onClick={() => onChange({...params, distance: Math.max(0.3, params.distance - 0.1)})} className="p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white" title="Zoom In"><ZoomInIcon className="w-5 h-5"/></button>
                    <div className="h-px w-4 bg-white/10 my-1" />
                    <button onClick={() => onChange({...params, distance: Math.min(5.0, params.distance + 0.1)})} className="p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white" title="Zoom Out"><ZoomOutIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {!isDragging && (
                 <div className="absolute bottom-4 left-4 pointer-events-none">
                    <p className="text-[8px] text-white/30 uppercase font-bold tracking-widest">
                        Drag Scene to Orbit • Drag Markers to Adjust • Scroll to Zoom
                    </p>
                </div>
            )}
        </div>
    );
};

// --- Standard Components ---

const InputField = ({ 
    label, field, onChange, placeholder, options, onOptionSelect
}: { 
    label: string, field: WeightedField, onChange: (val: WeightedField) => void, placeholder?: string, options?: string[], onOptionSelect?: (val: string) => void
}) => (
    <div className="flex flex-col gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono ${field.weight !== 1 ? 'text-brand-red font-bold' : 'text-gray-400'}`}>
                    {field.weight.toFixed(1)}x
                </span>
                <input 
                    type="range" min="0.1" max="2.0" step="0.1" value={field.weight}
                    onChange={(e) => onChange({ ...field, weight: parseFloat(e.target.value) })}
                    className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-red"
                />
            </div>
        </div>
        <div className="relative">
            <input 
                value={field.text} 
                onChange={(e) => onChange({ ...field, text: e.target.value })} 
                placeholder={placeholder}
                className={`w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-2.5 text-sm text-dark-text dark:text-light-text focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 ${options ? 'pr-8' : ''}`}
            />
            {options && (
                <>
                    <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none text-gray-400 group-hover:text-brand-red-dark dark:group-hover:text-brand-red transition-colors">
                        <ChevronRightIcon className="w-4 h-4 rotate-90" />
                    </div>
                    <select 
                        onChange={(e) => {
                            const val = e.target.value;
                            if(val) {
                                onChange({ ...field, text: val });
                                if(onOptionSelect) onOptionSelect(val);
                            }
                        }}
                        className="absolute right-0 top-0 bottom-0 w-8 opacity-0 cursor-pointer"
                        value=""
                    >
                        <option value="" disabled>Select option</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </>
            )}
        </div>
    </div>
);

const AccordionItem = ({ title, isOpen, onToggle, children }: { title: string, isOpen: boolean, onToggle: () => void, children?: React.ReactNode }) => (
    <div className={`border border-light-border dark:border-dark-border rounded-xl overflow-hidden mb-3 transition-all duration-200 ${isOpen ? 'shadow-sm ring-1 ring-black/5 dark:ring-white/5' : ''}`}>
        <button 
            onClick={onToggle}
            className={`w-full flex justify-between items-center p-4 transition-colors duration-200 ${
                isOpen ? 'bg-light-bg dark:bg-dark-subtle-bg' : 'bg-light-card dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-[#252525]'
            }`}
        >
            <span className={`font-bold text-sm transition-colors ${isOpen ? 'text-brand-red-dark dark:text-brand-red' : 'text-dark-text dark:text-light-text'}`}>
                {title}
            </span>
            <ChevronRightIcon 
                className={`w-4 h-4 transition-all duration-200 ${isOpen ? 'rotate-90 text-brand-red-dark dark:text-brand-red' : 'text-medium-text dark:text-medium-text-dark'}`} 
            />
        </button>
        {isOpen && (
            <div className="p-5 bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);

// Added missing interface definition to resolve type error
interface PromptBuilderProps {
  config: PromptConfig;
  onConfigChange: (config: PromptConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ config, onConfigChange, isOpen, onClose }) => {
    const [openSection, setOpenSection] = useState<string | null>('Composition');
    const [is3DExpanded, setIs3DExpanded] = useState(false);

    if (!isOpen) return null;

    const updateConfig = (section: keyof PromptConfig, key: string, value: any) => {
        // Fix: Added safety check to ensure section is an object before spreading to avoid errors on non-object properties like aspectRatio
        const sectionValue = config[section];
        if (typeof sectionValue === 'object' && sectionValue !== null) {
            onConfigChange({
                ...config,
                [section]: { ...sectionValue, [key]: value }
            });
        }
    };

    const handleCameraSelect = (cameraName: string) => {
        const preset = CAMERA_PRESETS[cameraName];
        if (!preset) return;
        const newConfig = { ...config };
        if (preset.lens) newConfig.camera.lens = { ...newConfig.camera.lens, text: preset.lens };
        if (preset.aperture) newConfig.camera.aperture = { ...newConfig.camera.aperture, text: preset.aperture };
        if (preset.shutter) newConfig.camera.shutter = { ...newConfig.camera.shutter, text: preset.shutter };
        if (preset.iso) newConfig.camera.iso = { ...newConfig.camera.iso, text: preset.iso };
        if (preset.filmSimulation) newConfig.camera.filmSimulation = { ...newConfig.camera.filmSimulation, text: preset.filmSimulation };
        onConfigChange(newConfig);
    };

    return (
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-2xl mt-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5 dark:ring-white/5 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-subtle-bg/30 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-brand-red/10 rounded-lg"><SlidersIcon className="w-5 h-5 text-brand-red-dark dark:text-brand-red" /></div>
                     <div>
                        <h3 className="text-base font-bold text-dark-text dark:text-light-text">Prompt Engineer</h3>
                        <p className="text-[10px] text-medium-text dark:text-medium-text-dark font-medium uppercase tracking-wide">Fine-tune weights & parameters</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-medium-text hover:text-dark-text dark:text-medium-text-dark dark:hover:text-light-text"><XCircleIcon className="w-6 h-6" /></button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow">
                <AccordionItem title="Composition & 3D Environment" isOpen={openSection === 'Composition'} onToggle={() => setOpenSection(openSection === 'Composition' ? null : 'Composition')}>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-black/20 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-red text-black rounded-xl shadow-lg">
                                    <VideoIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-sm font-black dark:text-light-text tracking-tight uppercase">Master Stage Controls</span>
                                    <p className="text-[10px] text-medium-text dark:text-medium-text-dark font-bold">Universal Spatial Rotation</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {config.composition.camera3D.enabled && (
                                    <button 
                                        onClick={() => setIs3DExpanded(true)}
                                        className="p-2.5 bg-gray-200 dark:bg-white/10 hover:bg-brand-red active:scale-95 hover:text-black rounded-xl transition-all shadow-md"
                                        title="Expand Visual Stage"
                                    >
                                        <ExpandIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => updateConfig('composition', 'camera3D', { ...config.composition.camera3D, enabled: !config.composition.camera3D.enabled })}
                                    className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${config.composition.camera3D.enabled ? 'bg-brand-red' : 'bg-gray-400'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${config.composition.camera3D.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {config.composition.camera3D.enabled ? (
                            <Camera3DScene 
                                params={config.composition.camera3D} 
                                onChange={(p) => updateConfig('composition', 'camera3D', p)} 
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                                <InputField label="Shot Type" placeholder="e.g. Extreme bust shot" field={config.composition.shotType} onChange={(v) => updateConfig('composition', 'shotType', v)} options={SHOT_TYPES} />
                                <InputField label="Camera Angle" placeholder="e.g. Eye-level" field={config.composition.angle} onChange={(v) => updateConfig('composition', 'angle', v)} options={ANGLES} />
                            </div>
                        )}
                    </div>
                </AccordionItem>

                <AccordionItem title="Key Elements" isOpen={openSection === 'Key Elements'} onToggle={() => setOpenSection(openSection === 'Key Elements' ? null : 'Key Elements')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                        <InputField label="Subject Type" placeholder="e.g. Slim thick female model" field={config.keyElements.subjectType} onChange={(v) => updateConfig('keyElements', 'subjectType', v)} />
                        <InputField label="Outfit" placeholder="e.g. Bikini" field={config.keyElements.outfit} onChange={(v) => updateConfig('keyElements', 'outfit', v)} />
                        <InputField label="Main Action" placeholder="e.g. Falling backward" field={config.keyElements.action} onChange={(v) => updateConfig('keyElements', 'action', v)} />
                        <InputField label="Environment" placeholder="e.g. Bottomless dark pool" field={config.keyElements.environment} onChange={(v) => updateConfig('keyElements', 'environment', v)} />
                        <InputField label="Lighting" placeholder="e.g. Harsh direct light" field={config.keyElements.lighting} onChange={(v) => updateConfig('keyElements', 'lighting', v)} options={LIGHTING} />
                        <InputField label="Visual Mood" placeholder="e.g. Serene, dreamlike" field={config.keyElements.mood} onChange={(v) => updateConfig('keyElements', 'mood', v)} options={MOODS} />
                    </div>
                </AccordionItem>

                <AccordionItem title="Camera & Film" isOpen={openSection === 'Camera'} onToggle={() => setOpenSection(openSection === 'Camera' ? null : 'Camera')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                        <InputField label="Camera Body" placeholder="e.g. Fuji XT-4" field={config.camera.body} onChange={(v) => updateConfig('camera', 'body', v)} options={CAMERA_BODIES} onOptionSelect={handleCameraSelect} />
                        <InputField label="Lens" placeholder="e.g. 35mm" field={config.camera.lens} onChange={(v) => updateConfig('camera', 'lens', v)} options={LENS_OPTIONS} />
                        <InputField label="Film Simulation" placeholder="e.g. PROVIA" field={config.camera.filmSimulation} onChange={(v) => updateConfig('camera', 'filmSimulation', v)} options={FILM_SIMULATIONS} />
                        <InputField label="Aesthetic" placeholder="e.g. Candid, gritty" field={config.style.aesthetic} onChange={(v) => updateConfig('style', 'aesthetic', v)} options={IMAGE_EFFECTS} />
                    </div>
                </AccordionItem>
            </div>
            
            {/* Full Screen Master View Overlay */}
            {is3DExpanded && (
                <div className="fixed inset-0 z-[100] bg-black/99 backdrop-blur-3xl flex flex-col p-6 sm:p-12 animate-in zoom-in-95 fade-in duration-500 overflow-hidden">
                    <div className="flex justify-between items-center mb-10 flex-shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-brand-red text-black rounded-3xl shadow-[0_0_50px_rgba(246,239,18,0.2)]"><VideoIcon className="w-12 h-12" /></div>
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tight uppercase">Stage Master Pro</h2>
                                <p className="text-sm text-white/40 font-bold tracking-[0.4em] uppercase">Advanced Spatial Composition Engine</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIs3DExpanded(false)}
                            className="p-6 hover:bg-white/10 active:scale-90 rounded-full transition-all text-white/30 hover:text-brand-red border border-white/5"
                        >
                            <XIcon className="w-14 h-14" />
                        </button>
                    </div>
                    
                    <div className="flex-grow relative rounded-[40px] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden bg-neutral-950">
                        <Camera3DScene 
                            params={config.composition.camera3D} 
                            onChange={(p) => updateConfig('composition', 'camera3D', p)}
                            isExpanded={true}
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute bottom-12 left-12 flex flex-col gap-8 w-[420px] bg-black/85 backdrop-blur-3xl p-10 rounded-[32px] border border-white/10 shadow-2xl">
                            <div className="flex flex-col gap-5">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-brand-red rounded-full" />
                                        <span className="text-xs font-black text-white/40 tracking-widest uppercase">Perspective Zoom</span>
                                    </div>
                                    <span className="text-sm font-mono text-brand-red bg-brand-red/10 px-3 py-1 rounded-lg">{config.composition.camera3D.distance.toFixed(2)}x</span>
                                </div>
                                <input 
                                    type="range" min="0.3" max="5.0" step="0.01" value={config.composition.camera3D.distance}
                                    onChange={(e) => updateConfig('composition', 'camera3D', { ...config.composition.camera3D, distance: parseFloat(e.target.value)})}
                                    className="w-full accent-brand-red h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex flex-col gap-5">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-yellow-400 rounded-full" />
                                        <span className="text-xs font-black text-white/40 tracking-widest uppercase">Subject Pose (Absolute)</span>
                                    </div>
                                    <span className="text-sm font-mono text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg">{config.composition.camera3D.objectRotation}°</span>
                                </div>
                                <input 
                                    type="range" min="0" max="360" step="1" value={config.composition.camera3D.objectRotation}
                                    onChange={(e) => updateConfig('composition', 'camera3D', { ...config.composition.camera3D, objectRotation: parseInt(e.target.value)})}
                                    className="w-full accent-yellow-400 h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="pt-8 border-t border-white/5">
                                <button 
                                    onClick={() => setIs3DExpanded(false)}
                                    className="w-full bg-brand-red text-black font-black py-5 rounded-[20px] hover:bg-brand-red-dark hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand-red/20 text-base uppercase tracking-widest"
                                >
                                    Confirm Stage Layout
                                </button>
                            </div>
                        </div>

                        {/* Interactive Key */}
                        <div className="absolute top-12 right-12 flex flex-col gap-4">
                            <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="w-4 h-4 bg-brand-red rounded-full shadow-[0_0_20px_#F6EF12]" />
                                <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Camera POV</span>
                            </div>
                            <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_20px_orange]" />
                                <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Key Lighting</span>
                            </div>
                            <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="w-4 h-4 bg-white border-2 border-brand-red rounded-lg shadow-[0_0_15px_white]" />
                                <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Subject Pose</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-12 flex flex-col gap-2">
                        <p className="text-white/20 text-xs font-black tracking-[0.8em] uppercase">
                            Spatial Navigation Ready
                        </p>
                        <p className="text-white/10 text-[10px] font-bold uppercase tracking-widest">
                            Drag empty space to orbit camera • Drag indicators to reposition lighting or posing
                        </p>
                    </div>
                </div>
            )}

            <div className="p-3 bg-gray-50/50 dark:bg-dark-subtle-bg/30 border-t border-light-border dark:border-dark-border text-[10px] text-medium-text dark:text-medium-text-dark text-center font-medium flex-shrink-0">
                Configurations are appended to your main prompt automatically.
            </div>
        </div>
    );
};
