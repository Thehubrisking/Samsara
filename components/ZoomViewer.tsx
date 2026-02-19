
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon, ZoomInIcon, ZoomOutIcon, ExpandIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import type { HistoryEntry } from '../types';

interface ZoomViewerProps {
  info: { history: HistoryEntry[], startIndex: number } | { url: string };
  onClose: () => void;
}

const MIN_SCALE_FACTOR = 0.8;
const MAX_SCALE = 10;
const ZOOM_SENSITIVITY = 0.005;

export const ZoomViewer: React.FC<ZoomViewerProps> = ({ info, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const initialFit = useRef({ scale: 1, offset: { x: 0, y: 0 } });
  
  const isCarousel = 'history' in info;
  const history = isCarousel ? info.history : [];

  const [currentIndex, setCurrentIndex] = useState(isCarousel ? info.startIndex : -1);
  const [currentImage, setCurrentImage] = useState<{ url: string; entry?: HistoryEntry } | null>(null);

  useEffect(() => {
    if (isCarousel) {
      if (currentIndex >= 0 && history[currentIndex]) {
        const entry = history[currentIndex];
        setCurrentImage({ url: entry.editedImage, entry });
      }
    } else {
      setCurrentImage({ url: info.url });
    }
  }, [info, isCarousel, history, currentIndex]);


  // Effect to calculate initial fit and set state
  useEffect(() => {
    if (!currentImage?.url) return;
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const calculateFit = () => {
      // Reset transform before measuring
      setScale(1);
      setOffset({ x: 0, y: 0 });
      
      const { naturalWidth, naturalHeight } = img;
      const { clientWidth, clientHeight } = container;

      if (naturalWidth === 0 || naturalHeight === 0) return;

      const scaleX = clientWidth / naturalWidth;
      const scaleY = clientHeight / naturalHeight;
      const newScale = Math.min(scaleX, scaleY);
      
      const newOffsetX = (clientWidth - naturalWidth * newScale) / 2;
      const newOffsetY = (clientHeight - naturalHeight * newScale) / 2;

      initialFit.current = { scale: newScale, offset: { x: newOffsetX, y: newOffsetY } };
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    };
    
    // Using imageRef directly caused issues with onload not firing for same-src re-renders
    const imageLoader = new Image();
    imageLoader.onload = () => {
        if (imageRef.current) {
            imageRef.current.src = currentImage.url;
        }
        calculateFit();
    };
    imageLoader.src = currentImage.url;

    const resizeObserver = new ResizeObserver(calculateFit);
    if(container) resizeObserver.observe(container);

    return () => {
        imageLoader.onload = null;
        if(container) resizeObserver.unobserve(container);
    };
  }, [currentImage?.url]);


  const handleNext = useCallback(() => {
    if (isCarousel && currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [isCarousel, currentIndex, history.length]);

  const handlePrev = useCallback(() => {
    if (isCarousel && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [isCarousel, currentIndex]);

  // Keyboard key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (isCarousel) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isCarousel, handleNext, handlePrev]);

  const handleDownload = () => {
    if (!currentImage?.url) return;
    
    const link = document.createElement('a');
    link.href = currentImage.url;
    
    if (currentImage.entry) {
        const entry = currentImage.entry;
        const sanitizeFilename = (prompt: string | null) => {
            if (!prompt) return 'untitled';
            return prompt.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').substring(0, 50);
        };
        link.download = `samsara-${entry.type}-${entry.id}-${sanitizeFilename(entry.prompt)}.png`;
    } else {
        link.download = 'samsara-image.png';
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const delta = e.deltaY * -ZOOM_SENSITIVITY;
    const newScale = Math.min(Math.max(scale + delta, initialFit.current.scale * MIN_SCALE_FACTOR), MAX_SCALE);
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;

    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    panStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const newOffsetX = e.clientX - panStart.current.x;
    const newOffsetY = e.clientY - panStart.current.y;
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(false);
  };
  
  const pinchStart = useRef({ dist: 0, scale: 1, offset: {x: 0, y: 0}, midPoint: {x: 0, y: 0} });
  
  const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
          setIsPanning(true);
          panStart.current = {
              x: e.touches[0].clientX - offset.x,
              y: e.touches[0].clientY - offset.y,
          };
      } else if (e.touches.length === 2) {
          setIsPanning(false);
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          const midPoint = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
          pinchStart.current = { dist, scale, offset, midPoint };
      }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isPanning) {
          const newOffsetX = e.touches[0].clientX - panStart.current.x;
          const newOffsetY = e.touches[0].clientY - panStart.current.y;
          setOffset({ x: newOffsetX, y: newOffsetY });
      } else if (e.touches.length === 2) {
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          const zoom = newDist / pinchStart.current.dist;
          const newScale = Math.min(Math.max(pinchStart.current.scale * zoom, initialFit.current.scale * MIN_SCALE_FACTOR), MAX_SCALE);
          
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = pinchStart.current.midPoint.x - rect.left;
          const mouseY = pinchStart.current.midPoint.y - rect.top;

          const worldX = (mouseX - pinchStart.current.offset.x) / pinchStart.current.scale;
          const worldY = (mouseY - pinchStart.current.offset.y) / pinchStart.current.scale;

          const newOffsetX = mouseX - worldX * newScale;
          const newOffsetY = mouseY - worldY * newScale;
          
          setScale(newScale);
          setOffset({ x: newOffsetX, y: newOffsetY });
      }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
      e.preventDefault();
      setIsPanning(false);
  };
  
  const zoomWithButton = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.5 : 1 / 1.5;
    const newScale = Math.min(Math.max(scale * zoomFactor, initialFit.current.scale * MIN_SCALE_FACTOR), MAX_SCALE);
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const worldX = (centerX - offset.x) / scale;
        const worldY = (centerY - offset.y) / scale;
        const newOffsetX = centerX - worldX * newScale;
        const newOffsetY = centerY - worldY * newScale;
        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const resetView = () => {
      setScale(initialFit.current.scale);
      setOffset(initialFit.current.offset);
  }
  
  return (
    <div 
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center touch-none"
        onClick={onClose}
    >
        {isCarousel && (
            <>
                <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentIndex <= 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-2 bg-black/40 text-white rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous image"
                >
                    <ChevronLeftIcon className="w-8 h-8"/>
                </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={currentIndex >= history.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-2 bg-black/40 text-white rounded-full hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Next image"
                >
                    <ChevronRightIcon className="w-8 h-8"/>
                </button>
            </>
        )}

        <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-lg p-2 flex items-center gap-2 z-[60]"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={() => zoomWithButton('out')} className="text-white p-2 hover:bg-white/20 rounded-md"><ZoomOutIcon className="w-6 h-6"/></button>
            <button onClick={() => zoomWithButton('in')} className="text-white p-2 hover:bg-white/20 rounded-md"><ZoomInIcon className="w-6 h-6"/></button>
            <button onClick={resetView} className="text-white p-2 hover:bg-white/20 rounded-md"><ExpandIcon className="w-6 h-6"/></button>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
             <button 
                onClick={handleDownload}
                className="text-white p-2 hover:bg-white/20 rounded-md"
                aria-label="Download image"
                title="Download image"
            >
                <DownloadIcon className="w-6 h-6" />
            </button>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <button 
                className="text-white p-2 hover:bg-white/20 rounded-md"
                onClick={onClose}
                aria-label="Close image viewer"
            >
                <XIcon className="w-6 h-6" />
            </button>
        </div>

        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
        >
            <img
                ref={imageRef}
                src={currentImage?.url}
                alt="Zoomed-in view"
                className={`absolute max-w-none transition-opacity duration-200 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    transition: 'transform 0.075s linear',
                }}
                draggable={false}
            />
        </div>
    </div>
  );
};
