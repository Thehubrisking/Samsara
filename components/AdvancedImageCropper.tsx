
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { XIcon, CropIcon, FlipIcon } from './icons';

interface AdvancedImageCropperProps {
  imageUrl: string;
  mimeType: string;
  onSave: (croppedDataUrl: string) => void;
  onClose: () => void;
  defaultAspectRatio?: number;
}

const MIN_CROP_SIZE = 50;
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

type CropRect = { x: number; y: number; width: number; height: number };
type AspectRatio = { label: string; value: number | null };
type Point = { x: number; y: number };

export const AdvancedImageCropper: React.FC<AdvancedImageCropperProps> = ({ imageUrl, mimeType, onSave, onClose, defaultAspectRatio }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef(new Image());
  
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [fillColor, setFillColor] = useState('#000000');
  
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState<Point>({ x: 0, y: 0 });
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number>(1);

  const aspectRatios: AspectRatio[] = useMemo(() => [
    { label: 'Original', value: naturalAspectRatio },
    { label: 'Free', value: null },
    { label: '1:1', value: 1 },
    { label: '9:16', value: 9/16 },
    { label: '16:9', value: 16/9 },
    { label: '4:5', value: 4/5 },
    { label: '5:4', value: 5/4 },
    { label: '3:4', value: 3/4 },
    { label: '4:3', value: 4/3 },
    { label: '2:3', value: 2/3 },
    { label: '3:2', value: 3/2 },
    { label: '21:9', value: 21/9 },
  ], [naturalAspectRatio]);

  const [activeAspectRatio, setActiveAspectRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, crop: crop, offset: imageOffset });

  const getFinalAspectRatio = useCallback(() => {
    if (!activeAspectRatio.value) return null;
    return isPortrait ? 1 / activeAspectRatio.value : activeAspectRatio.value;
  }, [activeAspectRatio, isPortrait]);

  const applyAspectRatio = useCallback((rect: CropRect, aspect: number | null): CropRect => {
    if (!aspect) return rect;
    const { x, y, width, height } = rect;
    const currentCenter = { x: x + width / 2, y: y + height / 2 };
    
    let newWidth = width;
    let newHeight = height;

    // Try to fit within current dimensions first
    if (width / height > aspect) {
        // Too wide
        newWidth = height * aspect;
    } else {
        // Too tall
        newHeight = width / aspect;
    }
    
    return { 
        width: newWidth, 
        height: newHeight, 
        x: currentCenter.x - newWidth / 2, 
        y: currentCenter.y - newHeight / 2 
    };
  }, []);
  
  // Set initial image and crop state
  useEffect(() => {
    setIsImageLoaded(false);
    const img = imageRef.current;
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    const handleLoad = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.7;
      
      const canvasAspect = maxWidth / maxHeight;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      
      setNaturalAspectRatio(imgAspect);

      // Determine initial aspect ratio selection
      let initialAspectRatio = aspectRatios[0]; // Default to 'Original'
      if (defaultAspectRatio !== undefined) {
          // Try to find a matching standard ratio
          const match = aspectRatios.find(r => r.value && Math.abs(r.value - defaultAspectRatio) < 0.01);
          if (match) {
              initialAspectRatio = match;
          } else if (Math.abs(defaultAspectRatio - imgAspect) < 0.01) {
              initialAspectRatio = aspectRatios[0]; // Original
          } else {
              // Use Free or create a custom one? For now fallback to Free if not matching standard
               initialAspectRatio = aspectRatios[1]; // Free
          }
      } else {
        // If no default passed, use Original
        initialAspectRatio = aspectRatios[0];
      }
      
      // We need to set this immediately for the calculation below
      setActiveAspectRatio(initialAspectRatio);

      let canvasWidth = maxWidth;
      let canvasHeight = maxHeight;

      if(imgAspect > canvasAspect) {
        canvasHeight = maxWidth / imgAspect;
      } else {
        canvasWidth = maxHeight * imgAspect;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fit image to canvas
      const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      setImageScale(scale);
      setImageOffset({
        x: (canvas.width - img.naturalWidth * scale) / 2,
        y: (canvas.height - img.naturalHeight * scale) / 2,
      });

      // Initial crop is 90% of the canvas
      const initialCrop = { 
        x: canvas.width * 0.05, y: canvas.height * 0.05, 
        width: canvas.width * 0.9, height: canvas.height * 0.9 
      };
      
      // Apply ratio constraint immediately
      const ratioValue = initialAspectRatio.value || imgAspect; // Fallback to image aspect for initial shape if Free
      setCrop(applyAspectRatio(initialCrop, ratioValue));
      
      setIsImageLoaded(true);
    };

    img.addEventListener('load', handleLoad);
    return () => img.removeEventListener('load', handleLoad);
  }, [imageUrl]); // Only re-run if URL changes. applyAspectRatio dep removed to avoid loops, logic moved inside

  // Effect to re-apply aspect ratio when user changes selection
  useEffect(() => {
    if (isImageLoaded) {
      const aspect = getFinalAspectRatio();
      setCrop(c => applyAspectRatio(c, aspect));
    }
  }, [activeAspectRatio, isPortrait, isImageLoaded, applyAspectRatio, getFinalAspectRatio]);

  const getHandles = useCallback((c: CropRect) => {
    const s = 12; // slightly larger touch target
    return [
      { id: 'nw', x: c.x - s/2, y: c.y - s/2, cursor: 'nwse-resize' },
      { id: 'ne', x: c.x + c.width - s/2, y: c.y - s/2, cursor: 'nesw-resize' },
      { id: 'sw', x: c.x - s/2, y: c.y + c.height - s/2, cursor: 'nesw-resize' },
      { id: 'se', x: c.x + c.width - s/2, y: c.y + c.height - s/2, cursor: 'nwse-resize' },
      { id: 'n', x: c.x + c.width/2 - s/2, y: c.y - s/2, cursor: 'ns-resize' },
      { id: 's', x: c.x + c.width/2 - s/2, y: c.y + c.height - s/2, cursor: 'ns-resize' },
      { id: 'w', x: c.x - s/2, y: c.y + c.height/2 - s/2, cursor: 'ew-resize' },
      { id: 'e', x: c.x + c.width - s/2, y: c.y + c.height/2 - s/2, cursor: 'ew-resize' },
    ].map(h => ({...h, width: s, height: s}));
  }, []);

  // Drawing effect
  useEffect(() => {
    if (!isImageLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx) return;

    const { width: cw, height: ch } = canvas;
    
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.translate(imageOffset.x, imageOffset.y);
    ctx.scale(imageScale, imageScale);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    ctx.restore();

    // Dimming overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    // Outer rectangle (canvas)
    ctx.rect(0, 0, cw, ch);
    // Inner rectangle (crop) - subtract
    ctx.rect(crop.x, crop.y, crop.width, crop.height);
    // Using even-odd rule for cutout
    ctx.fill('evenodd');
    
    // Crop Border
    ctx.strokeStyle = '#F6EF12';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Rule of thirds grid
    ctx.strokeStyle = 'rgba(246, 239, 18, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Verticals
    ctx.moveTo(crop.x + crop.width / 3, crop.y);
    ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
    ctx.moveTo(crop.x + 2 * crop.width / 3, crop.y);
    ctx.lineTo(crop.x + 2 * crop.width / 3, crop.y + crop.height);
    // Horizontals
    ctx.moveTo(crop.x, crop.y + crop.height / 3);
    ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
    ctx.moveTo(crop.x, crop.y + 2 * crop.height / 3);
    ctx.lineTo(crop.x + crop.width, crop.y + 2 * crop.height / 3);
    ctx.stroke();

    // Handles
    ctx.fillStyle = '#F6EF12';
    getHandles(crop).forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));
  }, [isImageLoaded, crop, getHandles, fillColor, imageScale, imageOffset]);
  
  const getActionFromPoint = (x: number, y: number): string => {
      const handle = getHandles(crop).find(h => 
          x >= h.x && x <= h.x + h.width && y >= h.y && y <= h.y + h.height
      );
      if (handle) return handle.id;
      if (x > crop.x && x < crop.x + crop.width && y > crop.y && y < crop.y + crop.height) {
          return 'move-crop';
      }
      return 'pan-image';
  };
  
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const action = getActionFromPoint(x, y);
    setActiveDrag(action);
    dragStart.current = { x, y, crop, offset: imageOffset };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeDrag) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    
    if (activeDrag === 'pan-image') {
        setImageOffset({ x: dragStart.current.offset.x + dx, y: dragStart.current.offset.y + dy });
        return;
    }

    let { x: cX, y: cY, width: cW, height: cH } = dragStart.current.crop;
    const aspect = getFinalAspectRatio();
    
    if (activeDrag === 'move-crop') {
      cX += dx;
      cY += dy;
    } else {
      if (activeDrag.includes('e')) cW += dx;
      if (activeDrag.includes('s')) cH += dy;
      if (activeDrag.includes('w')) { cW -= dx; cX += dx; }
      if (activeDrag.includes('n')) { cH -= dy; cY += dy; }
      
      if (cW < MIN_CROP_SIZE) {
        if (activeDrag.includes('w')) cX = dragStart.current.crop.x + dragStart.current.crop.width - MIN_CROP_SIZE;
        cW = MIN_CROP_SIZE;
      }
      if (cH < MIN_CROP_SIZE) {
        if (activeDrag.includes('n')) cY = dragStart.current.crop.y + dragStart.current.crop.height - MIN_CROP_SIZE;
        cH = MIN_CROP_SIZE;
      }
      
      if (aspect) {
        if (activeDrag.includes('e') || activeDrag.includes('w')) cH = cW / aspect;
        else if (activeDrag.includes('n') || activeDrag.includes('s')) cW = cH * aspect;
        else {
            if (Math.abs(dx) > Math.abs(dy)) cH = cW / aspect;
            else cW = cH * aspect;
        }
        if(activeDrag.includes('n')) cY = dragStart.current.crop.y + dragStart.current.crop.height - cH;
        if(activeDrag.includes('w')) cX = dragStart.current.crop.x + dragStart.current.crop.width - cW;
      }
    }
    
    setCrop({ x: cX, y: cY, width: cW, height: cH });
  }, [activeDrag, getFinalAspectRatio]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.releasePointerCapture(e.pointerId);
    setActiveDrag(null);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const zoom = 1 - e.deltaY * 0.005;
    const newScale = Math.max(MIN_SCALE, Math.min(imageScale * zoom, MAX_SCALE));

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - imageOffset.x) / imageScale;
    const worldY = (mouseY - imageOffset.y) / imageScale;

    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;

    setImageScale(newScale);
    setImageOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleCrop = () => {
    const img = imageRef.current;
    if (!img || crop.width === 0 || crop.height === 0) return;
    
    const sourceX = (crop.x - imageOffset.x) / imageScale;
    const sourceY = (crop.y - imageOffset.y) / imageScale;
    const sourceWidth = crop.width / imageScale;
    const sourceHeight = crop.height / imageScale;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sourceWidth;
    cropCanvas.height = sourceHeight;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    onSave(cropCanvas.toDataURL(mimeType, 0.9));
  };

  const handleFit = useCallback(() => {
    const img = imageRef.current;
    if (!img.naturalWidth || !isImageLoaded) return;

    const fitScaleX = crop.width / img.naturalWidth;
    const fitScaleY = crop.height / img.naturalHeight;
    const newScale = Math.min(fitScaleX, fitScaleY);

    const newOffsetX = crop.x + (crop.width - img.naturalWidth * newScale) / 2;
    const newOffsetY = crop.y + (crop.height - img.naturalHeight * newScale) / 2;

    setImageScale(newScale);
    setImageOffset({ x: newOffsetX, y: newOffsetY });
  }, [crop, isImageLoaded]);

  const handleFill = useCallback(() => {
    const img = imageRef.current;
    if (!img.naturalWidth || !isImageLoaded) return;

    const fillScaleX = crop.width / img.naturalWidth;
    const fillScaleY = crop.height / img.naturalHeight;
    const newScale = Math.max(fillScaleX, fillScaleY);

    const newOffsetX = crop.x + (crop.width - img.naturalWidth * newScale) / 2;
    const newOffsetY = crop.y + (crop.height - img.naturalHeight * newScale) / 2;

    setImageScale(newScale);
    setImageOffset({ x: newOffsetX, y: newOffsetY });
  }, [crop, isImageLoaded]);
  
  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 touch-none" onPointerUp={handlePointerUp}>
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl flex flex-col border border-light-border dark:border-dark-border w-full max-w-4xl max-h-[90vh]" onPointerDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <h3 className="text-xl font-bold dark:text-light-text">Crop Image</h3>
          <button onClick={onClose} className="p-2 text-medium-text dark:text-medium-text-dark hover:text-dark-text dark:hover:text-light-text"><XIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-4 flex-grow flex justify-center items-center overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative">
          <canvas 
            ref={canvasRef} 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onWheel={handleWheel}
            className="cursor-grab active:cursor-grabbing touch-none"
          />
        </div>
        <div className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0 bg-light-card dark:bg-dark-card rounded-b-xl">
          <div className="flex flex-col gap-4">
              {/* Top Row Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                      <select 
                        value={activeAspectRatio.label} 
                        onChange={e => setActiveAspectRatio(aspectRatios.find(a => a.label === e.target.value)!)} 
                        className="bg-gray-200 dark:bg-gray-700 rounded-md px-3 py-2 font-semibold text-sm text-dark-text dark:text-light-text border-none focus:ring-2 focus:ring-brand-red"
                      >
                        {aspectRatios.map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
                      </select>
                      
                      <button 
                        onClick={() => setIsPortrait(p => !p)} 
                        title="Flip Orientation" 
                        className={`p-2 rounded-md transition-colors ${isPortrait ? 'bg-brand-red text-dark-text' : 'bg-gray-200 dark:bg-gray-700 text-medium-text dark:text-medium-text-dark'}`}
                        disabled={!activeAspectRatio.value}
                      >
                          <FlipIcon className="w-5 h-5"/>
                      </button>
                      
                      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                      
                      <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1">
                        <label htmlFor="fillColor" className="font-semibold text-xs text-medium-text dark:text-medium-text-dark">Fill:</label>
                        <input id="fillColor" type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} className="w-6 h-6 p-0 border-none rounded bg-transparent cursor-pointer" />
                      </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleFit} title="Fit image to crop area" className="text-xs font-bold px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-dark-text dark:text-light-text">Fit</button>
                    <button onClick={handleFill} title="Fill crop area with image" className="text-xs font-bold px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-dark-text dark:text-light-text">Fill</button>
                    <button onClick={handleCrop} className="flex items-center gap-2 font-bold bg-brand-red hover:bg-brand-red-dark text-dark-text px-4 py-2 rounded-lg text-sm shadow-md">
                        <CropIcon className="w-4 h-4"/>
                        Apply
                    </button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
