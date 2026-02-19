
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageFile } from '../types';
import { TrashIcon, PaintBrushIcon, XCircleIcon, EraserIcon, ZoomInIcon, ZoomOutIcon, ExpandIcon, RefreshIcon, CheckCircleIcon, UndoIcon, RedoIcon, XIcon, WandIcon } from './icons';

interface EditingWorkspaceProps {
  image: ImageFile;
  onMaskUpdate: (mask: ImageFile | null, composited?: ImageFile | null) => void;
  onReset: () => void;
  onCropRequest: () => void;
  resultImage?: string | null;
  onApprove?: () => void;
  onCancelResult?: () => void;
  onAppendPrompt?: (text: string) => void;
  editSubMode?: 'global' | 'mask';
  onEditSubModeChange?: (mode: 'global' | 'mask') => void;
}

const MIN_SCALE = 0.05;
const MAX_SCALE = 10;
const ZOOM_SENSITIVITY = 0.001;
const MAX_HISTORY = 30;

const SEMANTIC_ZONES = [
    { 
        name: 'Red Zone', 
        color: '#FF3B30', 
        action: 'Removal', 
        prompts: ['Absolute removal', 'Clean up area', 'Remove and fill background', 'Clear object'] 
    },
    { 
        name: 'Yellow Zone', 
        color: '#F6EF12', 
        action: 'Transform', 
        prompts: ['Change texture to silk', 'Recolor to matte black', 'Stylize as stone', 'Add metallic sheen'] 
    },
    { 
        name: 'Green Zone', 
        color: '#34C759', 
        action: 'Addition', 
        prompts: ['Add detailing', 'Insert lush plants', 'Add diamond jewelry', 'Grow cybernetic parts'] 
    },
    { 
        name: 'Blue Zone', 
        color: '#007AFF', 
        action: 'Relighting', 
        prompts: ['Apply rim lighting', 'Make it glow neon', 'Cast blue shadow', 'Adjust color balance'] 
    },
    { 
        name: 'Purple Zone', 
        color: '#AF52DE', 
        action: 'Morph', 
        prompts: ['Neural morph', 'Dreamlike distortion', 'Ethereal blending', 'Abstract fusion'] 
    }
];

export const EditingWorkspace: React.FC<EditingWorkspaceProps> = ({ 
    image, 
    onMaskUpdate, 
    onReset, 
    onCropRequest,
    resultImage,
    onApprove,
    onCancelResult,
    onAppendPrompt,
    editSubMode = 'mask',
    onEditSubModeChange
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [brushColor, setBrushColor] = useState(SEMANTIC_ZONES[1].color);
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser' | 'pan'>('brush');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  
  const [isMaskDirty, setIsMaskDirty] = useState(false);
  const [isMaskConfirmed, setIsMaskConfirmed] = useState(false);
  
  const [scale, setScale] = useState(1);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // CRITICAL FIX: Repaint the canvas whenever it might have been cleared by a resize
  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
    }
  }, [history, historyIndex]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(imageData);
        if (next.length > MAX_HISTORY) next.shift();
        return next;
    });
    setHistoryIndex(prev => {
        const next = prev + 1;
        return next >= MAX_HISTORY ? MAX_HISTORY - 1 : next;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && history[prevIndex]) {
        ctx.putImageData(history[prevIndex], 0, 0);
        setHistoryIndex(prevIndex);
        setIsMaskDirty(prevIndex > 0);
        setIsMaskConfirmed(false);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && history[nextIndex]) {
        ctx.putImageData(history[nextIndex], 0, 0);
        setHistoryIndex(nextIndex);
        setIsMaskDirty(true);
        setIsMaskConfirmed(false);
    }
  }, [history, historyIndex]);

  const resetView = useCallback(() => {
    const viewport = viewportRef.current;
    const img = imageRef.current;
    if (!viewport || !img || !img.naturalWidth) return;

    const vWidth = viewport.clientWidth;
    const vHeight = viewport.clientHeight;
    
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const padding = 40;
    const scaleX = (vWidth - padding) / imgWidth;
    const scaleY = (vHeight - padding) / imgHeight;
    const newScale = Math.min(scaleX, scaleY);

    setScale(newScale);

    const canvas = canvasRef.current;
    if (canvas) {
      // Setting width/height clears the canvas. We must repaint immediately.
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      
      if (history.length === 0) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
              const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              setHistory([initialData]);
              setHistoryIndex(0);
          }
      } else {
          repaint();
      }
    }
    
    setTimeout(() => {
        if (viewport) {
            viewport.scrollLeft = (imgWidth * newScale - vWidth) / 2;
            viewport.scrollTop = (imgHeight * newScale - vHeight) / 2;
        }
    }, 0);
  }, [history.length, repaint]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
          const target = e.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault(); setIsSpacePressed(true);
          }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo(); else undo();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo]);

  const handleImageLoad = () => { setIsImgLoaded(true); resetView(); };

  useEffect(() => {
    if (isImgLoaded) {
      const timer = setTimeout(resetView, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, image.dataUrl, isImgLoaded, resetView]);

  const getCoordinates = (event: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
        if (event.touches.length === 0) return null;
        clientX = event.touches[0].clientX; clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX; clientY = event.clientY;
    }

    const x = (clientX - rect.left) / (rect.width / canvas.width);
    const y = (clientY - rect.top) / (rect.height / canvas.height);
    return { x, y };
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey || isSpacePressed) {
        event.preventDefault();
        const zoom = 1 - event.deltaY * ZOOM_SENSITIVITY;
        setScale(s => Math.min(Math.max(s * zoom, MIN_SCALE), MAX_SCALE));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      if (resultImage) return; 
      const isPanning = isSpacePressed || currentTool === 'pan' || e.button === 1;
      if (isPanning) {
          isDragging.current = true;
          dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: viewportRef.current?.scrollLeft || 0, scrollTop: viewportRef.current?.scrollTop || 0 };
          viewportRef.current?.setPointerCapture(e.pointerId);
          e.preventDefault();
      } else if (e.button === 0 && editSubMode === 'mask') {
          const coords = getCoordinates(e);
          if (coords) { 
              setIsDrawing(true); 
              lastPosition.current = coords; 
              draw(e, true);
              setIsMaskDirty(true);
              setIsMaskConfirmed(false);
          }
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (isDragging.current && viewportRef.current) {
          const dx = e.clientX - dragStart.current.x;
          const dy = e.clientY - dragStart.current.y;
          viewportRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
          viewportRef.current.scrollTop = dragStart.current.scrollTop - dy;
      } else { draw(e); }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (isDragging.current) { isDragging.current = false; viewportRef.current?.releasePointerCapture(e.pointerId); } 
      else { stopDrawing(); }
  };

  const draw = (event: React.PointerEvent, isInitial = false) => {
    if (!isDrawing && !isInitial) return;
    const coords = getCoordinates(event);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && coords && lastPosition.current) {
        ctx.lineWidth = brushSize / scale;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (currentTool === 'eraser') { 
            ctx.globalCompositeOperation = 'destination-out'; 
            ctx.strokeStyle = 'rgba(0,0,0,1)'; 
        } 
        else { 
            ctx.globalCompositeOperation = 'source-over'; 
            ctx.strokeStyle = brushColor; 
        }
        ctx.beginPath(); ctx.moveTo(lastPosition.current.x, lastPosition.current.y); ctx.lineTo(coords.x, coords.y); ctx.stroke();
        lastPosition.current = coords;
    }
  };
  
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false); 
    lastPosition.current = null;
    saveToHistory();
  };

  const confirmSelection = () => {
    const canvas = canvasRef.current; const imageEl = imageRef.current;
    if (!canvas || !imageEl) return;
    
    const w = imageEl.naturalWidth;
    const h = imageEl.naturalHeight;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = w; compositeCanvas.height = h;
    const compositeCtx = compositeCanvas.getContext('2d');
    if (!compositeCtx) return;
    compositeCtx.drawImage(imageEl, 0, 0);
    compositeCtx.drawImage(canvas, 0, 0);
    const compositedFile: ImageFile = { dataUrl: compositeCanvas.toDataURL('image/png'), mimeType: 'image/png' };

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w; maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    maskCtx.fillStyle = '#000000'; 
    maskCtx.fillRect(0, 0, w, h);
    maskCtx.drawImage(canvas, 0, 0);
    const maskFile: ImageFile = { dataUrl: maskCanvas.toDataURL('image/png'), mimeType: 'image/png' };
    
    onMaskUpdate(maskFile, compositedFile);
    setIsMaskDirty(false);
    setIsMaskConfirmed(true);
  };
  
  const clearMask = () => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (ctx && canvas) { 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        onMaskUpdate(null, null); 
        setIsMaskDirty(false);
        setIsMaskConfirmed(false);
        saveToHistory();
    }
  };

  const scaledWidth = (imageRef.current?.naturalWidth || 0) * scale;
  const scaledHeight = (imageRef.current?.naturalHeight || 0) * scale;

  return (
    <div className={`flex flex-col border border-light-border dark:border-dark-border rounded-md bg-neutral-100 dark:bg-black transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-[100000] bg-dark-bg min-h-screen w-screen overflow-y-auto custom-scrollbar' : 'w-full h-full min-h-[500px] overflow-hidden relative'}`}>
        
        {resultImage && (
            <div className="sticky top-0 left-0 right-0 z-[100020] bg-brand-red text-black py-2.5 px-6 flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-black/10 rounded-md"><RefreshIcon className="w-4 h-4 animate-spin-slow" /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curation Review Mode</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancelResult} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-md border border-black/20 hover:bg-black/5 transition-colors">Discard</button>
                    <button onClick={onApprove} className="text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-md bg-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all">Lock In Edit</button>
                </div>
            </div>
        )}

        <div className={`flex flex-col flex-shrink-0 z-[100010] bg-white dark:bg-dark-card border-b border-light-border dark:border-dark-border ${isFullScreen ? 'sticky top-0' : ''}`}>
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md shadow-lg transition-colors ${resultImage ? 'bg-brand-red text-black' : (isMaskConfirmed ? 'bg-green-500 text-white' : 'bg-brand-red/10 text-brand-red')}`}>
                        {isMaskConfirmed ? <CheckCircleIcon className="w-5 h-5" /> : <PaintBrushIcon className="w-5 h-5" />}
                    </div>
                    
                    {/* NEW: Methodology Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md border border-white/5">
                        <button 
                            onClick={() => onEditSubModeChange?.('global')}
                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded ${editSubMode === 'global' ? 'bg-brand-red text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Entire Canvas
                        </button>
                        <button 
                            onClick={() => onEditSubModeChange?.('mask')}
                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded ${editSubMode === 'mask' ? 'bg-brand-red text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Painted Area
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className={`hidden sm:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md gap-1 transition-opacity ${editSubMode === 'global' ? 'opacity-30 pointer-events-none' : ''}`}>
                        {SEMANTIC_ZONES.map(z => (
                            <button 
                                key={z.color} 
                                onClick={() => { setBrushColor(z.color); setCurrentTool('brush'); }}
                                className={`w-6 h-6 rounded-md transition-all active:scale-90 border border-white/10 ${brushColor === z.color ? 'ring-2 ring-brand-red scale-110 shadow-lg' : 'opacity-20 hover:opacity-100'}`}
                                style={{ backgroundColor: z.color }}
                                title={`${z.name} - ${z.action}`}
                                disabled={!!resultImage}
                            />
                        ))}
                    </div>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                    <button 
                        onClick={() => setIsFullScreen(!isFullScreen)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all shadow-xl font-black text-[10px] uppercase tracking-widest ${isFullScreen ? 'bg-white text-black' : 'bg-brand-red text-black hover:scale-[1.05]'}`} 
                    >
                        {isFullScreen ? <XCircleIcon className="w-4 h-4"/> : <ExpandIcon className="w-4 h-4"/>}
                        {isFullScreen ? 'Exit Studio' : 'Precision Mode'}
                    </button>
                </div>
            </div>

            {!resultImage && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-neutral-900 border-t border-light-border dark:border-dark-border">
                    <div className="flex gap-1 items-center">
                        <div className={`flex gap-0.5 bg-black/10 p-0.5 rounded-md mr-2 transition-opacity ${editSubMode === 'global' ? 'opacity-30 pointer-events-none' : ''}`}>
                            <button onClick={() => setCurrentTool('brush')} className={`p-2 rounded-md transition-all ${currentTool === 'brush' ? 'bg-brand-red text-black shadow-lg' : 'text-gray-500 hover:bg-white/5'}`} title="Brush"><PaintBrushIcon className="w-4 h-4"/></button>
                            <button onClick={() => setCurrentTool('eraser')} className={`p-2 rounded-md transition-all ${currentTool === 'eraser' ? 'bg-brand-red text-black shadow-lg' : 'text-gray-500 hover:bg-white/5'}`} title="Eraser"><EraserIcon className="w-4 h-4"/></button>
                            <button onClick={() => setCurrentTool('pan')} className={`p-2 rounded-md transition-all ${currentTool === 'pan' || isSpacePressed ? 'bg-brand-red text-black shadow-lg' : 'text-gray-500 hover:bg-white/5'}`} title="Pan"><ExpandIcon className="w-4 h-4 rotate-45"/></button>
                        </div>
                        <div className={`flex gap-0.5 bg-black/10 p-0.5 rounded-md transition-opacity ${editSubMode === 'global' ? 'opacity-30 pointer-events-none' : ''}`}>
                            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 rounded-md text-gray-500 hover:bg-white/5 disabled:opacity-20 transition-all" title="Undo (Ctrl+Z)"><UndoIcon className="w-4 h-4"/></button>
                            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-md text-gray-500 hover:bg-white/5 disabled:opacity-20 transition-all" title="Redo (Ctrl+Shift+Z)"><RedoIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-md border border-white/5 transition-opacity ${editSubMode === 'global' ? 'opacity-30 pointer-events-none' : ''}`}>
                            <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Brush Size</span>
                            <input type="range" min="1" max="250" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-32 accent-brand-red" />
                            <span className="text-[10px] font-mono text-brand-red font-bold w-8">{brushSize}</span>
                        </div>
                        <button onClick={clearMask} className={`p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-md transition-all ${editSubMode === 'global' ? 'opacity-30 pointer-events-none' : ''}`} title="Reset Mask"><RefreshIcon className="w-4 h-4"/></button>
                    </div>
                </div>
            )}
        </div>

        <div ref={viewportRef} className={`flex-grow relative overflow-auto custom-scrollbar bg-neutral-200 dark:bg-neutral-950 flex items-center justify-center ${isFullScreen ? 'min-h-[80vh] p-16' : 'p-6'}`} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onContextMenu={e => e.preventDefault()}>
            {!isImgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-md animate-pulse">
                <div className="w-16 h-16 border-4 border-brand-red border-t-transparent animate-spin rounded-full shadow-[0_0_30px_rgba(246,239,18,0.5)]"></div>
              </div>
            )}
            
            <div className="relative shadow-[0_0_150px_rgba(0,0,0,0.6)] bg-white dark:bg-black flex-shrink-0 transition-transform duration-75" style={{ width: scaledWidth, height: scaledHeight }}>
                <div className="relative w-full h-full">
                    <img ref={imageRef} src={image.dataUrl} alt="Base Canvas" className="absolute inset-0 w-full h-full select-none pointer-events-none object-contain" crossOrigin="anonymous" onLoad={handleImageLoad} />
                    
                    <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full touch-none z-10 ${resultImage || isMaskConfirmed || editSubMode === 'global' ? 'opacity-0 pointer-events-none' : (isSpacePressed || currentTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair')}`}></canvas>
                    
                    {resultImage && (
                        <div className="absolute inset-0 z-20 animate-in fade-in duration-1000">
                             <img src={resultImage} className="w-full h-full object-contain pointer-events-none" alt="Curation Result" />
                             <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                                <div className="bg-brand-red text-black px-10 py-5 rounded-full font-black uppercase tracking-[0.4em] shadow-[0_0_100px_rgba(246,239,18,0.7)] text-xs animate-pulse border-2 border-black">
                                    New Patch Ready
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {isMaskDirty && !resultImage && editSubMode === 'mask' && (
                <div className="absolute bottom-8 right-8 z-[100030] animate-in slide-in-from-right duration-500">
                    <button 
                        onClick={confirmSelection}
                        className="bg-brand-red text-black px-8 py-5 rounded-md shadow-[0_15px_40px_rgba(246,239,18,0.4)] border-2 border-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/50 leading-none mb-1">Step 1: Lockdown</span>
                            <span className="text-sm font-black uppercase tracking-widest">Confirm Markings</span>
                        </div>
                        <div className="p-2 bg-black rounded-md group-hover:bg-black/80 transition-colors">
                            <CheckCircleIcon className="w-6 h-6 text-brand-red" />
                        </div>
                    </button>
                </div>
            )}
        </div>

        <div className={`p-3 border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-between z-[100010] flex-shrink-0 ${isFullScreen ? 'sticky bottom-0' : ''}`}>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md border border-white/5">
                <button onClick={() => setScale(s => Math.max(MIN_SCALE, s / 1.5))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md text-gray-500"><ZoomOutIcon className="w-4 h-4"/></button>
                <button onClick={() => setScale(s => Math.min(MAX_SCALE, s * 1.5))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md text-gray-500"><ZoomInIcon className="w-4 h-4"/></button>
                <button onClick={resetView} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md text-gray-500"><RefreshIcon className="w-4 h-4"/></button>
            </div>
            <div className="flex items-center gap-3">
                {editSubMode === 'global' ? (
                    <div className="flex items-center gap-2 mr-4 bg-brand-red/10 px-3 py-1 rounded-full border border-brand-red/20">
                        <WandIcon className="w-3 h-3 text-brand-red" />
                        <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">Global Instruction Mode</span>
                    </div>
                ) : isMaskConfirmed && !resultImage && (
                    <div className="flex items-center gap-2 mr-4 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Markings Locked & Detected</span>
                    </div>
                )}
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Orbit: [Space] + Drag • Zoom: Scroll</span>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-[10px] font-mono text-brand-red font-bold bg-brand-red/10 px-2 py-0.5 rounded-md">{Math.round(scale * 100)}%</span>
            </div>
        </div>
    </div>
  );
};
