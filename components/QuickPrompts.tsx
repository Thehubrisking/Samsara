import React from 'react';
import { ShirtIcon, PoseIcon, LightingIcon } from './icons';

export const prompts = [
  {
    key: 'garment',
    label: 'Transfer Garment',
    icon: ShirtIcon,
    prompt: 'Analyze the garment worn by the person in the reference photo and apply it to the person in the avatar photo. Maintain the avatar\'s pose and identity, but replace their clothing with the style, color, and texture from the reference image.',
  },
  {
    key: 'pose',
    label: 'Transfer Pose',
    icon: PoseIcon,
    prompt: 'Analyze the pose of the person in the reference photo and apply it to the person in the avatar photo. Maintain the avatar\'s identity and clothing, but change their body position to match the reference.',
  },
  {
    key: 'lighting',
    label: 'Transfer Lighting',
    icon: LightingIcon,
    prompt: 'Analyze the lighting conditions (e.g., time of day, shadows, color temperature) from the reference photo and apply them to the avatar photo. Maintain the avatar\'s identity, clothing, and pose.',
  },
];

interface QuickPromptsProps {
  activePrompts: Set<string>;
  onToggle: (key: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ activePrompts, onToggle }) => {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-medium-text dark:text-medium-text-dark">Quick Actions (Additive):</h4>
      <div className="flex flex-wrap gap-2">
        {prompts.map(({ key, label, icon: Icon }) => {
            const isActive = activePrompts.has(key);
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className={`flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-full transition-colors duration-200 ${
                    isActive 
                    ? 'bg-dark-text text-white dark:bg-light-text dark:text-dark-text' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-dark-text dark:text-light-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
        })}
      </div>
    </div>
  );
};