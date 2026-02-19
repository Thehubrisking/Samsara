
import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import type { ImageFile } from '../types';
import { 
    PaintBrushIcon, EraserIcon, RectangleIcon, LassoIcon,
    ZoomInIcon, ZoomOutIcon, ExpandIcon, XCircleIcon,
    UndoIcon, RedoIcon, CropIcon
} from './icons';
import { AdvancedImageCropper } from './AdvancedImageCropper';


interface ReferenceEditorProps {
  imageFile: ImageFile;
  avatarImage: ImageFile | null;
  onSave: (newImageFile: ImageFile, maskDataUrl: string | null) => void;
  onClose: () => void;
}

type Tool = 'brush' | 'eraser' | 'rectangle' | 'lasso';
type Point = { x: number; y: number };

const MIN_SCALE = 0.2;
const MAX_SCALE = 10;
const ZOOM_SENSITIVITY = 0.1;
const MAX_HISTORY = 30;

export const ReferenceEditor: React.FC<ReferenceEditorProps> = ({ imageFile, avatarImage, onSave, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [editableImage, setEditableImage] = useState<ImageFile>(imageFile);
  const [isCropping, setIsCropping] = useState(false);
  const [avatarAspectRatio, setAvatarAspectRatio] = useState<number>(16/9);

  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  
  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Tool-specific state
  const startPosition = useRef<Point | null>(null);
  const lassoPoints = useRef<Point[]>([]);
  
  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    if (avatarImage) {
        const img = new Image();
        img.onload = () => {
            setAvatarAspectRatio(img.naturalWidth / img.naturalHeight);
        };
        img.src = avatarImage.dataUrl;
    }
  }, [avatarImage]);


  // Reset view and load initial mask on image change
  useEffect(() => {
    const imageEl = imageRef.current;
    if (!imageEl) return;
    
    const initialLoad = () => {
        resetView();
        if (editableImage.maskDataUrl) {
            loadMaskFromDataUrl(editableImage.maskDataUrl);
        } else {
            clearCanvas();
            saveToHistory();
        }
    }
    
    // This needs to re-run when the image data URL changes (e.g., after cropping)
    const newImg = new Image();
    newImg.onload = () => {
      // Set image ref src here to avoid re-triggering this effect
      if (imageRef.current) {
          imageRef.current.src = editableImage.dataUrl;
      }
      initialLoad();
    };
    newImg.src = editableImage.dataUrl;

  }, [editableImage.dataUrl]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // If we undo, then draw, we need to discard the 'future' history
    const newHistory = history.slice(0, historyIndex + 1);
    
    newHistory.push(imageData);
    if (newHistory.length > MAX_HISTORY) {
        newHistory.shift(); // Keep history size limited
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const restoreFromHistory = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !history[index]) return;

    ctx.putImageData(history[index], 0, 0);
    setHistoryIndex(index);
  };
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
        restoreFromHistory(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
        restoreFromHistory(historyIndex + 1);
    }
  }, [historyIndex, history.length]);

  const loadMaskFromDataUrl = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const maskImg = new Image();
    maskImg.onload = () => {
      // Create a temporary canvas to draw the mask and then get its pixels
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw the mask (which is black and white) onto the temp canvas
      tempCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
      const maskImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const maskData = maskImageData.data;

      // Create a new image data for the main canvas, colored pink
      const newImageData = ctx.createImageData(canvas.width, canvas.height);
      const newData = newImageData.data;

      for (let i = 0; i < maskData.length; i += 4) {
          if (maskData[i] > 128) { // If the pixel is white in the mask
              newData[i] = 246;      // R (Brand Yellow)
              newData[i + 1] = 239;    // G
              newData[i + 2] = 18;   // B
              newData[i + 3] = 180;  // A (0.7 * 255)
          }
      }
      ctx.putImageData(newImageData, 0, 0);
      saveToHistory();
    };
    maskImg.src = dataUrl;
  }

  // Set up canvas sizes
  useLayoutEffect(() => {
    const imageEl = imageRef.current;
    const canvasEl = canvasRef.current;
    const overlayEl = overlayCanvasRef.current;
    if (!imageEl || !canvasEl || !overlayEl) return;

    const setup = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = imageEl.getBoundingClientRect();
        canvasEl.width = rect.width * dpr;
        canvasEl.height = rect.height * dpr;
        canvasEl.style.width = `${rect.width}px`;
        canvasEl.style.height = `${rect.height}px`;
        const ctx = canvasEl.getContext('2d');
        ctx?.scale(dpr,dpr);

        overlayEl.width = rect.width * dpr;
        overlayEl.height = rect.height * dpr;
        overlayEl.style.width = `${rect.width}px`;
        overlayEl.style.height = `${rect.height}px`;
        const overlayCtx = overlayEl.getContext('2d');
        overlayCtx?.scale(dpr,dpr);
    };

    if (imageEl.complete) {
      setup();
    } else {
      imageEl.onload = setup;
    }
  }, [editableImage.dataUrl]);

  const getCoordinates = (event: MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    return { x, y };
  };

  const drawLine = (start: Point, end: Point, tool: Tool) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize / scale; // Adjust brush size for zoom
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : 'rgba(246, 239, 18, 0.7)';
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only main click
    if (isPanning) {
        panStart.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
        return;
    }
    
    setIsDrawing(true);
    const pos = getCoordinates(event.nativeEvent);
    if (!pos) return;

    startPosition.current = pos;
    if (currentTool === 'lasso') {
        lassoPoints.current = [pos];
    } else if (currentTool === 'brush' || currentTool === 'eraser') {
        drawLine(pos, pos, currentTool); // Draw a dot
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isPanning && event.buttons === 1) { // Dragging while panning
      const newOffsetX = event.clientX - panStart.current.x;
      const newOffsetY = event.clientY - panStart.current.y;
      setOffset({ x: newOffsetX, y: newOffsetY });
      return;
    }

    if (!isDrawing) return;
    const pos = getCoordinates(event.nativeEvent);
    if (!pos) return;

    const overlayCtx = overlayCanvasRef.current?.getContext('2d');
    if (overlayCtx) {
        overlayCtx.clearRect(0, 0, overlayCtx.canvas.width, overlayCtx.canvas.height);
    }
    
    switch(currentTool) {
        case 'brush':
        case 'eraser':
            drawLine(startPosition.current!, pos, currentTool);
            startPosition.current = pos;
            break;
        case 'rectangle':
            if (overlayCtx && startPosition.current) {
                overlayCtx.fillStyle = 'rgba(246, 239, 18, 0.2)';
                overlayCtx.strokeStyle = 'rgba(246, 239, 18, 0.8)';
                overlayCtx.lineWidth = 2 / scale;
                const width = pos.x - startPosition.current.x;
                const height = pos.y - startPosition.current.y;
                overlayCtx.fillRect(startPosition.current.x, startPosition.current.y, width, height);
                overlayCtx.strokeRect(startPosition.current.x, startPosition.current.y, width, height);
            }
            break;
        case 'lasso':
            lassoPoints.current.push(pos);
            if (overlayCtx) {
                overlayCtx.strokeStyle = '#F6EF12';
                overlayCtx.lineWidth = 2 / scale;
                overlayCtx.setLineDash([6, 3]);
                overlayCtx.beginPath();
                overlayCtx.moveTo(lassoPoints.current[0].x, lassoPoints.current[0].y);
                for(let i=1; i < lassoPoints.current.length; i++) {
                    overlayCtx.lineTo(lassoPoints.current[i].x, lassoPoints.current[i].y);
                }
                overlayCtx.stroke();
            }
            break;
    }
  };
  
  const handleMouseUp = (event: React.MouseEvent) => {
    if (isPanning) return; // Don't finalize drawing if we were panning
    if (!isDrawing) return;
    setIsDrawing(false);

    const pos = getCoordinates(event.nativeEvent);
    const ctx = canvasRef.current?.getContext('2d');
    if (!pos || !ctx) return;

    const overlayCtx = overlayCanvasRef.current?.getContext('2d');
    if (overlayCtx) {
        overlayCtx.clearRect(0, 0, overlayCtx.canvas.width, overlayCtx.canvas.height);
    }
    
    ctx.fillStyle = 'rgba(246, 239, 18, 0.7)';

    switch(currentTool) {
        case 'rectangle':
            if (startPosition.current) {
                const width = pos.x - startPosition.current.x;
                const height = pos.y - startPosition.current.y;
                ctx.fillRect(startPosition.current.x, startPosition.current.y, width, height);
            }
            break;
        case 'lasso':
            if(lassoPoints.current.length > 2) {
                ctx.beginPath();
                ctx.moveTo(lassoPoints.current[0].x, lassoPoints.current[0].y);
                for(let i=1; i < lassoPoints.current.length; i++) {
                    ctx.lineTo(lassoPoints.current[i].x, lassoPoints.current[i].y);
                }
                ctx.closePath();
                ctx.fill();
            }
            break;
    }
    startPosition.current = null;
    lassoPoints.current = [];
    saveToHistory();
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const zoom = 1 - event.deltaY * ZOOM_SENSITIVITY * 0.1;
    const newScale = Math.min(Math.max(scale * zoom, MIN_SCALE), MAX_SCALE);
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;
    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        if (e.code === 'Space') return; // Do not interfere with text input
      }

      if (e.code === 'Space' && !isPanning) {
        e.preventDefault();
        setIsPanning(true);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (isPanning) {
          e.preventDefault();
          setIsPanning(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo, isPanning]);
  
  const resetView = () => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;
    
    const containerAspect = container.clientWidth / container.clientHeight;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    
    let newScale;
    if (imageAspect > containerAspect) {
        newScale = container.clientWidth / image.naturalWidth;
    } else {
        newScale = container.clientHeight / image.naturalHeight;
    }
    
    newScale = Math.min(newScale, 1); // Don't zoom in past 1 on reset

    const newOffsetX = (container.clientWidth - image.naturalWidth * newScale) / 2;
    const newOffsetY = (container.clientHeight - image.naturalHeight * newScale) / 2;
    
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClear = () => {
    clearCanvas();
    saveToHistory();
  };

  const generateMask = () => {
    const canvas = canvasRef.current;
    const imageEl = imageRef.current;
    if (!canvas || !imageEl || historyIndex < 1) { // historyIndex < 1 means empty or initial state
        return null;
    }

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = imageEl.naturalWidth;
    maskCanvas.height = imageEl.naturalHeight;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return null;
    
    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    const dpr = window.devicePixelRatio || 1;
    const ratioX = imageEl.naturalWidth / (canvas.width / dpr);
    const ratioY = imageEl.naturalHeight / (canvas.height / dpr);

    maskCtx.setTransform(ratioX, 0, 0, ratioY, 0, 0);

    maskCtx.drawImage(
        canvas, 
        0, 0, canvas.width, canvas.height,
        0, 0, canvas.width / dpr, canvas.height / dpr,
    );
    
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    maskCtx.globalCompositeOperation = 'source-in';
    maskCtx.fillStyle = '#FFFFFF';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    return maskCanvas.toDataURL('image/png');
  };

  const handleFinalSave = () => {
    const maskDataUrl = generateMask();
    onSave(editableImage, maskDataUrl);
  };

  const handleCropSave = (newImageDataUrl: string) => {
    setEditableImage(prev => ({...prev, dataUrl: newImageDataUrl, maskDataUrl: undefined }));
    setIsCropping(false);
    handleClear(); // This will also clear history
  };
  
  const ToolButton = ({ tool, label, icon: Icon }: {tool: Tool, label: string, icon: React.FC<any>}) => (
    <button onClick={() => setCurrentTool(tool)} title={label} className={`p-2 rounded-md transition-colors ${currentTool === tool ? 'bg-brand-red text-dark-text' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
        <Icon className="w-5 h-5"/>
    </button>
  );

  return (
    <>
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onMouseDown={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col p-4 border border-light-border dark:border-dark-border" onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold dark:text-light-text">Create Selection</h3>
            <div className="flex items-center gap-4">
                <button onClick={() => onSave(editableImage, null)} className="font-semibold text-sm text-medium-text dark:text-medium-text-dark hover:text-dark-text dark:hover:text-light-text">Clear & Close</button>
                <button onClick={handleFinalSave} className="font-bold text-sm bg-brand-red hover:bg-brand-red-dark text-dark-text px-4 py-2 rounded-lg">Save Selection</button>
                <button onClick={onClose} className="p-2 text-medium-text dark:text-medium-text-dark hover:text-dark-text dark:hover:text-light-text"><XCircleIcon className="w-6 h-6"/></button>
            </div>
        </div>
        <div 
          ref={containerRef} 
          className="flex-grow w-full relative bg-gray-100 dark:bg-dark-subtle-bg rounded-lg overflow-hidden touch-none"
          onWheel={handleWheel}
        >
            <div 
                className={`w-full h-full absolute top-0 left-0 ${isPanning ? 'cursor-grab' : ''}`}
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <img ref={imageRef} src={editableImage.dataUrl} className="pointer-events-none absolute top-0 left-0 w-full h-full object-contain" alt="Reference to edit"/>
                <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none"/>
                <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 pointer-events-none"/>
            </div>
        </div>
        <div className="bg-gray-100 dark:bg-dark-subtle-bg p-3 rounded-lg flex items-center gap-4 justify-between mt-4 flex-shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsCropping(true)} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-dark-text dark:text-light-text font-semibold py-2 px-3 rounded-lg"><CropIcon className="w-5 h-5"/> Crop Image</button>
                <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex gap-1">
                    <ToolButton tool="brush" label="Brush" icon={PaintBrushIcon} />
                    <ToolButton tool="eraser" label="Eraser" icon={EraserIcon} />
                    <ToolButton tool="rectangle" label="Rectangle" icon={RectangleIcon} />
                    <ToolButton tool="lasso" label="Lassoo" icon={LassoIcon} />
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex gap-1">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><UndoIcon className="w-5 h-5"/></button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><RedoIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex items-center gap-2 text-dark-text dark:text-light-text w-40">
                    <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-brand-red"/>
                </div>
                <button onClick={handleClear} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-dark-text dark:text-light-text font-semibold py-2 px-3 rounded-lg"><XCircleIcon className="w-5 h-5"/> Clear</button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-medium-text dark:text-medium-text-dark hidden lg:inline">Hold [Space] to Pan</span>
                <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex gap-1">
                    <button onClick={() => setScale(s => Math.max(MIN_SCALE, s / 1.5))} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"><ZoomOutIcon className="w-5 h-5"/></button>
                    <button onClick={() => setScale(s => Math.min(MAX_SCALE, s * 1.5))} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"><ZoomInIcon className="w-5 h-5"/></button>
                    <button onClick={resetView} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"><ExpandIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
      </div>
    </div>
    {isCropping && (
      <AdvancedImageCropper
        imageUrl={editableImage.dataUrl}
        mimeType={editableImage.mimeType}
        onSave={handleCropSave}
        onClose={() => setIsCropping(false)}
        defaultAspectRatio={avatarAspectRatio}
      />
    )}
    </>
  );
};
