
import React, { useState } from 'react';
import type { HistoryEntry } from '../types';
import { HistoryIcon, TrashIcon, DownloadIcon, CheckCircleIcon, StarIcon, ZoomInIcon, CopyIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryEntry[];
  totalHistoryCount: number;
  favoritesCount: number;
  activeHistoryId: number | null;
  selectedHistoryIds: Set<number>;
  showFavorites: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onClear: () => void;
  onBulkDownload: () => void;
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onToggleFavorite: (id: number) => void;
  onToggleShowFavorites: () => void;
  onZoomRequest: (id: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
    history, 
    totalHistoryCount,
    favoritesCount,
    activeHistoryId, 
    selectedHistoryIds, 
    showFavorites,
    onSelect, 
    onDelete, 
    onClear, 
    onBulkDownload, 
    onToggleSelection,
    onToggleFavorite,
    onToggleShowFavorites,
    onZoomRequest,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const sanitizeFilename = (prompt: string | null) => {
    if (!prompt) return 'untitled';
    return prompt.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').substring(0, 50); 
  };

  const handleCopySeed = (e: React.MouseEvent, seed: number, entryId: number) => {
    e.stopPropagation();
    const seedStr = seed.toString();
    const tryCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(seedStr);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = seedStr;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            setCopiedId(entryId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy seed: ', err);
        }
    };
    tryCopy();
  };

  const getModelBadge = (entry: HistoryEntry) => {
      if (entry.model === 'gemini-3-pro-image-preview') {
        return (
            <span className="bg-brand-red text-black text-[8px] font-black px-2 py-0.5 rounded-full border border-yellow-500 shadow-sm tracking-wider uppercase">
                Pro
            </span>
          );
      }
      return (
        <span className="bg-white/10 backdrop-blur-md text-white/60 text-[8px] font-black px-2 py-0.5 rounded-full border border-white/5 shadow-sm tracking-wider uppercase">
            Flash
        </span>
      );
  }

  if (totalHistoryCount === 0) {
    return (
        <div className="text-center py-20 bg-black/10 rounded-lg border border-dashed border-white/5">
            <HistoryIcon className="w-12 h-12 mx-auto text-white/5 mb-4" />
            <h3 className="text-xl font-light text-white/40 tracking-[0.2em] uppercase">Archive Empty</h3>
            <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] mt-2">Begin a curation to populate your lookbook</p>
        </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 px-2">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-red text-black rounded-lg shadow-xl shadow-brand-red/10">
                <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-light text-white uppercase tracking-widest flex items-center gap-3">
                    Studio Archive
                </h3>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                    {history.length} Curated Look(s)
                </p>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={onToggleShowFavorites}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-md border-[0.5px] flex items-center gap-2 ${showFavorites ? 'bg-brand-red border-brand-red text-black' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}
            >
                <StarIcon className="w-3 h-3" fill={showFavorites ? 'currentColor' : 'none'} />
                {showFavorites ? 'Favorites' : `Show Starred (${favoritesCount})`}
            </button>

            <button 
                onClick={onBulkDownload} 
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 border-[0.5px] border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-all rounded-md flex items-center gap-2 disabled:opacity-20"
                disabled={history.length === 0}
            >
                <DownloadIcon className="w-3 h-3" />
                Export
            </button>

            <button 
                onClick={onClear} 
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 border-[0.5px] border-white/10 text-white/30 hover:text-red-500 hover:border-red-500/30 transition-all rounded-md flex items-center gap-2"
            >
                <TrashIcon className="w-3 h-3" />
                Purge
            </button>
        </div>
      </div>

      {/* PINTEREST-STYLE MASONRY GRID */}
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
          {history.map((entry, index) => {
              const isSelected = selectedHistoryIds.has(entry.id);
              const downloadUrl = entry.editedImage;
              const downloadFilename = `samsara-${entry.type}-${entry.id}-${sanitizeFilename(entry.prompt)}.png`;
              const isActive = activeHistoryId === entry.id;

              return (
                  <div
                      key={entry.id}
                      onClick={() => onSelect(entry.id)}
                      className="inline-block w-full break-inside-avoid group cursor-pointer"
                  >
                      <div className={`relative w-full rounded-lg overflow-hidden border-[0.5px] transition-all duration-500 bg-black/20 ${
                          isActive 
                          ? 'border-brand-red shadow-2xl shadow-brand-red/20 scale-[0.98]' 
                          : 'border-white/5 hover:border-white/30 hover:shadow-2xl hover:shadow-black/50'
                      }`}>
                          {/* Main Content Image */}
                          <img 
                              src={entry.editedImage} 
                              alt="Curated Look" 
                              className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-[1.03]" 
                          />
                          
                          {/* Floating Status Badges (Visible Always) */}
                          <div className="absolute top-3 left-3 z-20 flex gap-1.5 items-center">
                              {getModelBadge(entry)}
                              {entry.favorite && (
                                  <div className="bg-brand-red text-black p-1 rounded-full shadow-lg">
                                      <StarIcon className="w-2.5 h-2.5" fill="currentColor" />
                                  </div>
                              )}
                          </div>

                          {/* Quick Select & Favorite (Top Float, Hover Only) */}
                          <div className="absolute top-3 right-3 z-30 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleSelection(entry.id); }}
                                    className={`p-2 rounded-md transition-all backdrop-blur-md ${isSelected ? 'bg-brand-red text-black' : 'bg-black/40 text-white/50 hover:text-white hover:bg-black/60'}`}
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry.id); }}
                                    className={`p-2 rounded-md transition-all backdrop-blur-md ${entry.favorite ? 'bg-white text-brand-red' : 'bg-black/40 text-white/50 hover:text-brand-red hover:bg-black/60'}`}
                                >
                                    <StarIcon className="w-4 h-4" fill={entry.favorite ? 'currentColor' : 'none'} />
                                </button>
                          </div>
                          
                          {/* Metadata Overlay & Footer Actions (Bottom, Hover Only) */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end">
                              <div className="p-4 space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                  {/* Info Text */}
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                          <div className="w-1 h-2 bg-brand-red rounded-full" />
                                          <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">{entry.type === 'edit' ? 'Neural Retouch' : 'Style Curation'}</p>
                                      </div>
                                      <p className="text-[10px] text-white/90 font-mono line-clamp-2 leading-relaxed px-1">
                                          {entry.prompt}
                                      </p>
                                      {entry.seed && (
                                          <div className="flex items-center gap-2 pl-1">
                                            <p className="text-[8px] text-white/30 font-bold tracking-widest uppercase">SEED: {entry.seed}</p>
                                            <button 
                                                onClick={(e) => handleCopySeed(e, entry.seed, entry.id)}
                                                className={`p-1 rounded-md transition-all ${copiedId === entry.id ? 'bg-green-500 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                                title="Copy Seed ID"
                                            >
                                                {copiedId === entry.id ? <CheckCircleIcon className="w-2.5 h-2.5" /> : <CopyIcon className="w-2.5 h-2.5" />}
                                            </button>
                                          </div>
                                      )}
                                  </div>
                                  
                                  {/* Action Buttons Row */}
                                  <div className="flex gap-1.5 pt-2 border-t border-white/10">
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); onZoomRequest(entry.id); }} 
                                          className="flex-1 bg-white/10 hover:bg-brand-red hover:text-black text-white p-2 rounded-md transition-all flex justify-center items-center" 
                                          title="Magnify"
                                      >
                                          <ZoomInIcon className="w-4 h-4" />
                                      </button>
                                      <a 
                                          href={downloadUrl} 
                                          download={downloadFilename} 
                                          onClick={(e) => e.stopPropagation()} 
                                          className="flex-1 bg-white/10 hover:bg-brand-red hover:text-black text-white p-2 rounded-md transition-all flex justify-center items-center" 
                                          title="Archive Local"
                                      >
                                          <DownloadIcon className="w-4 h-4" />
                                      </a>
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                                          className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-md transition-all flex justify-center items-center" 
                                          title="Discard"
                                      >
                                          <TrashIcon className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )
          })}
      </div>
    </div>
  );
};
