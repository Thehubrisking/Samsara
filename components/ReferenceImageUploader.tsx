
import React, { useCallback, useRef, useState } from 'react';
import type { ImageFile, AdvancedReferencesState } from '../types';
import { UploadIcon, TrashIcon, SelectionIcon, CropIcon, SlidersIcon } from './icons';

interface ReferenceImageUploaderProps {
  referenceImages: ImageFile[];
  onReferenceImagesChange: (images: ImageFile[]) => void;
  onEditRequest: (index: number) => void;
  onCropRequest: (index: number) => void;
  advancedRefs: AdvancedReferencesState;
  onAdvancedRefsChange: (state: AdvancedReferencesState) => void;
  isAdvanced: boolean;
  onToggleAdvanced: (val: boolean) => void;
}

const BucketUploader = ({ 
    label, 
    bucket, 
    onUpdate, 
    onCropBucket, 
    onEditBucket 
}: { 
    label: string, 
    bucket: { enabled: boolean, images: ImageFile[] }, 
    onUpdate: (enabled: boolean, images: ImageFile[]) => void,
    onCropBucket: (idx: number) => void,
    onEditBucket: (idx: number) => void
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newImages: ImageFile[] = [];
        // Explicitly cast f as File to avoid unknown type errors
        Array.from(files).forEach((f) => {
            const file = f as File;
            const reader = new FileReader();
            reader.onload = (ev) => {
                newImages.push({ dataUrl: ev.target?.result as string, mimeType: file.type });
                if (newImages.length === files.length) {
                    onUpdate(bucket.enabled, [...bucket.images, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className={`p-3 rounded-xl border transition-all ${bucket.enabled ? 'bg-gray-50 dark:bg-black/20 border-brand-red/30' : 'bg-gray-100 dark:bg-black/10 border-transparent opacity-60'}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark-text dark:text-light-text">{label}</span>
                <button 
                    onClick={() => onUpdate(!bucket.enabled, bucket.images)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${bucket.enabled ? 'bg-brand-red' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${bucket.enabled ? 'translate-x-4' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {bucket.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden group">
                        <img src={img.dataUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button onClick={() => {
                                const next = [...bucket.images];
                                next.splice(idx, 1);
                                onUpdate(bucket.enabled, next);
                            }} className="p-1 bg-red-500 text-white rounded-full"><TrashIcon className="w-3 h-3"/></button>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={() => inputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center hover:border-brand-red transition-colors"
                >
                    <UploadIcon className="w-4 h-4 text-gray-400" />
                    <input type="file" ref={inputRef} multiple onChange={handleFile} className="hidden" accept="image/*" />
                </button>
            </div>
        </div>
    );
};

export const ReferenceImageUploader: React.FC<ReferenceImageUploaderProps> = ({ 
    referenceImages, 
    onReferenceImagesChange, 
    onEditRequest, 
    onCropRequest,
    advancedRefs,
    onAdvancedRefsChange,
    isAdvanced,
    onToggleAdvanced
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList) => {
    const newImages: ImageFile[] = [];
    let filesProcessed = 0;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({ dataUrl: e.target?.result as string, mimeType: file.type });
          filesProcessed++;
          if (filesProcessed === files.length) {
            onReferenceImagesChange([...referenceImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const updateBucket = (key: keyof AdvancedReferencesState, enabled: boolean, images: ImageFile[]) => {
      onAdvancedRefsChange({ ...advancedRefs, [key]: { enabled, images } });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-500 ${isAdvanced ? 'bg-brand-red/10 border-brand-red shadow-[0_0_15px_rgba(246,239,18,0.1)]' : 'bg-gray-100 dark:bg-black/20 border-light-border dark:border-dark-border'}`}>
          <div className="flex items-center gap-2 pl-1">
            <SlidersIcon className={`w-4 h-4 transition-colors ${isAdvanced ? 'text-brand-red animate-pulse' : 'text-gray-400'}`} />
            <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${isAdvanced ? 'text-brand-red' : 'text-gray-500 dark:text-light-text'}`}>
                Advanced Uploads
            </span>
          </div>
          <button 
            onClick={() => onToggleAdvanced(!isAdvanced)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${isAdvanced ? 'bg-brand-red shadow-[0_0_10px_#F6EF12]' : 'bg-gray-400 dark:bg-gray-600'}`}
          >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isAdvanced ? 'translate-x-6' : ''}`} />
          </button>
      </div>

      {!isAdvanced ? (
        <>
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-6 text-center cursor-pointer hover:border-brand-red transition-colors group bg-gray-50 dark:bg-black/10"
            >
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && processFiles(e.target.files)} className="hidden" accept="image/*" multiple />
                <UploadIcon className="w-10 h-10 mx-auto text-gray-300 group-hover:text-brand-red transition-colors mb-3" />
                <p className="text-xs font-bold text-dark-text dark:text-light-text uppercase tracking-widest">Standard Reference Pool</p>
                <p className="text-[10px] text-gray-400 mt-1">General style, lighting, and composition</p>
            </div>
            
            {referenceImages.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {referenceImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm">
                    <img src={image.dataUrl} className="w-full h-full object-cover bg-gray-100 dark:bg-dark-subtle-bg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <button onClick={() => onCropRequest(index)} className="p-1.5 bg-black/40 text-white rounded-full hover:bg-brand-red"><CropIcon className="w-4 h-4"/></button>
                        <button onClick={() => onEditRequest(index)} className="p-1.5 bg-black/40 text-white rounded-full hover:bg-brand-red"><SelectionIcon className="w-4 h-4"/></button>
                        <button onClick={() => onReferenceImagesChange(referenceImages.filter((_, i) => i !== index))} className="p-1.5 bg-red-500 text-white rounded-full"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-300">
            <BucketUploader label="Hair Reference" bucket={advancedRefs.hair} onUpdate={(e, i) => updateBucket('hair', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Nails Reference" bucket={advancedRefs.nails} onUpdate={(e, i) => updateBucket('nails', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Makeup Reference" bucket={advancedRefs.makeup} onUpdate={(e, i) => updateBucket('makeup', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Jewelry Reference" bucket={advancedRefs.jewelry} onUpdate={(e, i) => updateBucket('jewelry', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Garment Details" bucket={advancedRefs.details} onUpdate={(e, i) => updateBucket('details', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Shoes Reference" bucket={advancedRefs.shoes} onUpdate={(e, i) => updateBucket('shoes', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Multi-Angle Ref" bucket={advancedRefs.multiAngle} onUpdate={(e, i) => updateBucket('multiAngle', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
            <BucketUploader label="Other Accessories" bucket={advancedRefs.other} onUpdate={(e, i) => updateBucket('other', e, i)} onCropBucket={() => {}} onEditBucket={() => {}} />
        </div>
      )}
    </div>
  );
};
