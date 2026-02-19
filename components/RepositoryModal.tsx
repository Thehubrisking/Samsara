
import React, { useState, useEffect } from 'react';
import { XCircleIcon, CheckCircleIcon } from './icons';
import { repositoryData, Avatar, RepoImage } from '../data/repositoryData';

interface RepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageSrc: string) => void;
}

export const RepositoryModal: React.FC<RepositoryModalProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedSubBoardIndex, setSelectedSubBoardIndex] = useState<number>(0);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  // Set default avatar on open
  useEffect(() => {
    if (isOpen && !selectedAvatar && repositoryData.length > 0) {
        setSelectedAvatar(repositoryData[0]);
        setSelectedSubBoardIndex(0);
    }
  }, [isOpen, selectedAvatar]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedImageSrc) {
        onSelectImage(selectedImageSrc);
        onClose();
    }
  };
  
  const currentSubBoard = selectedAvatar ? selectedAvatar.subBoards[selectedSubBoardIndex] : null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-light-card dark:bg-dark-card w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
            {/* Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-card">
                <h2 className="text-xl font-bold text-dark-text dark:text-light-text">Avatar Library</h2>
                <button onClick={onClose} className="text-medium-text dark:text-medium-text-dark hover:text-dark-text dark:hover:text-light-text">
                    <XCircleIcon className="w-8 h-8" />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Avatars */}
                <div className="w-64 bg-gray-50 dark:bg-dark-subtle-bg border-r border-light-border dark:border-dark-border overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-xs font-bold uppercase text-medium-text dark:text-medium-text-dark mb-4 tracking-wider">Avatars</h3>
                        <div className="space-y-2">
                            {repositoryData.map((avatar) => (
                                <button
                                    key={avatar.name}
                                    onClick={() => {
                                        setSelectedAvatar(avatar);
                                        setSelectedSubBoardIndex(0);
                                        setSelectedImageId(null);
                                        setSelectedImageSrc(null);
                                    }}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                        selectedAvatar?.name === avatar.name 
                                        ? 'bg-brand-red text-dark-text shadow-sm' 
                                        : 'text-dark-text dark:text-light-text hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <img 
                                        src={avatar.thumbnail} 
                                        alt={avatar.name} 
                                        draggable="false"
                                        className="w-10 h-10 rounded-full object-cover border border-black/10 select-none" 
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                    <span className="font-semibold">{avatar.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-light-card dark:bg-dark-card">
                    {selectedAvatar && (
                        <>
                            {/* Tabs: Profiles */}
                            <div className="px-6 pt-6 pb-2">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                    {selectedAvatar.subBoards.map((board, index) => (
                                        <button
                                            key={board.name}
                                            onClick={() => setSelectedSubBoardIndex(index)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all ${
                                                selectedSubBoardIndex === index
                                                ? 'bg-dark-text text-white dark:bg-light-text dark:text-dark-text'
                                                : 'bg-gray-100 dark:bg-gray-700 text-medium-text dark:text-medium-text-dark hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {board.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Grid: Images */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {currentSubBoard ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {currentSubBoard.images.map((img) => (
                                            <div 
                                                key={img.id} 
                                                className={`group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                                    selectedImageId === img.id 
                                                    ? 'border-brand-red ring-2 ring-brand-red/30' 
                                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                                onClick={() => {
                                                    setSelectedImageId(img.id);
                                                    setSelectedImageSrc(img.src);
                                                }}
                                                onContextMenu={(e) => e.preventDefault()}
                                            >
                                                <img 
                                                    src={img.src} 
                                                    alt={`Avatar ${img.id}`} 
                                                    draggable="false"
                                                    className="w-full h-full object-cover bg-gray-200 dark:bg-gray-800 select-none" 
                                                    onContextMenu={(e) => e.preventDefault()}
                                                />
                                                
                                                {selectedImageId === img.id && (
                                                    <div className="absolute top-2 right-2 bg-brand-red text-dark-text rounded-full p-1">
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-medium-text dark:text-medium-text-dark">
                                        No images found in this category.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-light-border dark:border-dark-border bg-gray-50 dark:bg-dark-subtle-bg flex justify-between items-center">
                <div className="text-sm text-medium-text dark:text-medium-text-dark">
                    {selectedImageSrc ? 'Image selected' : 'Select an image to continue'}
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-dark-text dark:text-light-text hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedImageSrc}
                        className="px-6 py-2 text-sm font-bold bg-brand-red text-dark-text rounded-lg hover:bg-brand-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        Use Image
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
