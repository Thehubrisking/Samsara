
import React from 'react';
import { DownloadIcon, WandIcon, RefreshIcon } from './icons';
import type { Mode } from './ModeSelector';

interface ActionButtonsProps {
  onEdit: () => void;
  editedImageUrl: string | null;
  isEditing: boolean;
  canEdit: boolean;
  mode?: Mode;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, editedImageUrl, isEditing, canEdit, mode = 'edit' }) => {
  const hasResult = !!editedImageUrl;
  
  let buttonText = 'Style Curation';
  let ButtonIcon = WandIcon;

  if (isEditing) {
    buttonText = 'Curating Look...';
  } else if (hasResult) {
    buttonText = 'Recurate Look';
    ButtonIcon = RefreshIcon;
  }


  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
      <button
        onClick={onEdit}
        disabled={isEditing || !canEdit}
        className="flex-grow flex items-center justify-center gap-3 w-full bg-brand-red hover:bg-brand-red-dark disabled:bg-white/5 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-black text-[11px] font-medium uppercase tracking-[0.3em] py-4 rounded-xl transition-all duration-700 shadow-xl shadow-brand-red/5 active:scale-[0.99]"
      >
        <ButtonIcon className="w-4 h-4" />
        {buttonText}
      </button>
      {editedImageUrl && (
        <a
          href={editedImageUrl}
          download="atelier-curation.png"
          className="flex-grow flex items-center justify-center gap-3 w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] font-medium uppercase tracking-[0.3em] py-4 rounded-xl transition-all duration-700 border-[0.5px] border-white/5"
        >
          <DownloadIcon className="w-4 h-4" />
          Archive
        </a>
      )}
    </div>
  );
};
