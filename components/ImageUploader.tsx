import React, { useRef, useState, useCallback } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: ImageFile) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageUpload({ dataUrl, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [onImageUpload]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileSelect}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-brand-red bg-yellow-100 dark:bg-yellow-900/20' : 'border-light-border dark:border-dark-border hover:border-brand-red'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <UploadIcon className="w-12 h-12 mx-auto text-medium-text dark:text-medium-text-dark mb-4" />
      <p className="font-semibold text-dark-text dark:text-light-text">Click to upload or drag & drop</p>
      <p className="text-sm text-medium-text dark:text-medium-text-dark">PNG, JPG, WEBP, etc.</p>
    </div>
  );
};