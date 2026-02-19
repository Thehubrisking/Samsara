
import React from 'react';
import { ZoomInIcon, CropIcon, PencilIcon, UpscaleIcon } from './icons';

interface ImageDisplayProps {
  originalImageUrl?: string | null;
  editedImageUrl?: string | null;
  avatarUrl?: string | null;
  sceneImageUrl?: string | null;
  insertImageUrl?: string | null;
  referenceUrls?: string[];
  onImageClick?: (url: string) => void;
  onImageCrop?: () => void;
  onImageEdit?: (url: string) => void;
  onImageUpscale?: () => void;
}

interface ImageCardProps {
    src: string;
    label: string;
    className?: string;
    actions?: Array<{
        icon: React.ReactElement;
        label: string;
        onClick: (e: React.MouseEvent) => void;
    }>;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, label, className = '', actions }) => {
    const zoomAction = actions?.find(action => action.label === "Zoom In");

    return (
        <div className={`flex flex-col items-center justify-center relative w-full h-full overflow-hidden ${className}`}>
            <div 
                className={`relative w-full h-full group ${zoomAction ? 'cursor-zoom-in' : ''}`}
                onClick={zoomAction?.onClick}
                onContextMenu={(e) => e.preventDefault()} 
            >
                <img 
                    src={src} 
                    alt={label} 
                    draggable="false"
                    className="w-full h-full object-contain select-none" 
                    onContextMenu={(e) => e.preventDefault()}
                />
                {actions && actions.length > 0 && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        {actions.map(action => (
                            <button 
                                key={action.label} 
                                onClick={action.onClick} 
                                title={action.label} 
                                className="text-white p-2.5 bg-black/40 backdrop-blur-md rounded-xl hover:bg-brand-red hover:text-black transition-all border border-white/10"
                            >
                                {action.icon}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
    originalImageUrl, 
    editedImageUrl, 
    avatarUrl,
    sceneImageUrl,
    insertImageUrl,
    referenceUrls, 
    onImageClick,
    onImageCrop,
    onImageEdit,
    onImageUpscale,
}) => {
  const stylizedImageActions = editedImageUrl && [
    { 
        icon: <ZoomInIcon className="w-5 h-5" />, 
        label: "Zoom In", 
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); onImageClick?.(editedImageUrl); } 
    },
    { 
        icon: <CropIcon className="w-5 h-5" />, 
        label: "Crop Image", 
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); onImageCrop?.(); }
    },
    { 
        icon: <PencilIcon className="w-5 h-5" />, 
        label: "Use as Input", 
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); onImageEdit?.(editedImageUrl); }
    },
    { 
        icon: <UpscaleIcon className="w-5 h-5" />, 
        label: "Upscale Image", 
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); onImageUpscale?.(); }
    }
  ].filter(Boolean);

  if (editedImageUrl) {
      return (
          <ImageCard 
            src={editedImageUrl} 
            label="Neural Output"
            actions={stylizedImageActions}
          />
      );
  }

  // Fallback views for inputs before generation
  if (sceneImageUrl) {
      return <ImageCard src={sceneImageUrl} label="Global Scene" />;
  }

  if (avatarUrl) {
      return <ImageCard src={avatarUrl} label="Target Identity" />;
  }

  if (originalImageUrl) {
      return <ImageCard src={originalImageUrl} label="Original Canvas" />;
  }

  return null;
};
