
import React, { useState, useRef } from 'react';
import { PromptConfig, ImageFile } from '../types';
import { XCircleIcon, WandIcon, CheckCircleIcon, UploadIcon, TrashIcon } from './icons';
import { PromptBuilder } from './PromptBuilder';

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (intent: string, visualIntent?: ImageFile | null, visualInstruction?: string) => Promise<void>;
  isGenerating: boolean;
  generatedData: { prompt: string; config: PromptConfig } | null;
  onAccept: (prompt: string, config: PromptConfig) => void;
}

const CompactImageUpload = ({ image, onChange }: { image: ImageFile | null, onChange: (img: ImageFile | null) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                onChange({ dataUrl, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div 
            className={`relative rounded-xl border-2 border-dashed transition-all h-24 w-24 flex-shrink-0 flex items-center justify-center cursor-pointer overflow-hidden group ${image ? 'border-brand-red' : 'border-gray-300 dark:border-gray-600 hover:border-brand-red'}`}
            onClick={() => !image && fileInputRef.current?.click()}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            {image ? (
                <>
                    <img src={image.dataUrl} alt="Visual Intent" className="w-full h-full object-cover" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChange(null); }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                    >
                        <TrashIcon className="w-6 h-6" />
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center gap-1 p-2 text-center">
                    <UploadIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-medium leading-tight">Visual Intent</span>
                </div>
            )}
        </div>
    );
};

export const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({ 
    isOpen, 
    onClose, 
    onGenerate, 
    isGenerating, 
    generatedData,
    onAccept
}) => {
  const [intent, setIntent] = useState('');
  const [visualIntentImage, setVisualIntentImage] = useState<ImageFile | null>(null);
  const [visualInstruction, setVisualInstruction] = useState('');
  
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editedConfig, setEditedConfig] = useState<PromptConfig | null>(null);

  // Update local state when generated data arrives
  React.useEffect(() => {
      if (generatedData) {
          setEditedPrompt(generatedData.prompt);
          setEditedConfig(generatedData.config);
      }
  }, [generatedData]);

  if (!isOpen) return null;

  const handleApply = () => {
      if (editedConfig) {
          onAccept(editedPrompt, editedConfig);
          // Reset internal state
          setIntent('');
          setVisualIntentImage(null);
          setVisualInstruction('');
          setEditedConfig(null);
          setEditedPrompt('');
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-light-card dark:bg-dark-card w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
            {/* Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-subtle-bg/30">
                <h2 className="text-xl font-bold text-dark-text dark:text-light-text flex items-center gap-2">
                    <WandIcon className="w-6 h-6 text-brand-red-dark dark:text-brand-red" />
                    Magic Prompt Generator
                </h2>
                <button onClick={onClose} className="text-medium-text dark:text-medium-text-dark hover:text-dark-text dark:hover:text-light-text">
                    <XCircleIcon className="w-8 h-8" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {!generatedData ? (
                    <div className="flex flex-col h-full max-w-3xl mx-auto gap-6">
                        {/* Text Intent */}
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">
                                1. What is your intent?
                            </label>
                            <textarea
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                placeholder="Describe what you want to achieve. E.g., 'Transform the avatar into a cyberpunk warrior in a neon rainy city, using the style from the reference images.'"
                                className="w-full h-32 bg-gray-100 dark:bg-dark-subtle-bg border border-light-border dark:border-dark-border rounded-xl p-4 text-dark-text dark:text-light-text focus:ring-2 focus:ring-brand-red focus:outline-none resize-none text-lg"
                                autoFocus
                            />
                        </div>

                        {/* Visual Intent */}
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider flex items-center gap-2">
                                2. Visual Intent <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 font-normal normal-case">Optional</span>
                            </label>
                            <div className="flex gap-4 items-start bg-gray-50 dark:bg-black/10 p-4 rounded-xl border border-light-border dark:border-dark-border">
                                <CompactImageUpload image={visualIntentImage} onChange={setVisualIntentImage} />
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-medium-text dark:text-medium-text-dark">What should I extract from this image?</label>
                                    <input 
                                        type="text"
                                        value={visualInstruction}
                                        onChange={(e) => setVisualInstruction(e.target.value)}
                                        disabled={!visualIntentImage}
                                        placeholder={visualIntentImage ? "e.g., 'Copy the cinematic lighting', 'Use this color palette', 'Match the camera angle'" : "Upload an image first..."}
                                        className="w-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3 text-sm text-dark-text dark:text-light-text focus:ring-1 focus:ring-brand-red outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => onGenerate(intent, visualIntentImage, visualInstruction)}
                                disabled={!intent.trim() || isGenerating}
                                className="w-full bg-brand-red hover:bg-brand-red-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 text-dark-text font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-dark-text"></div>
                                        Analyzing Intent & Visuals...
                                    </>
                                ) : (
                                    <>
                                        <WandIcon className="w-5 h-5" />
                                        Generate Prompt Configuration
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-medium-text dark:text-medium-text-dark mt-4">
                                The AI will analyze your Avatar, References, and Visual Intent to create a detailed configuration.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <p className="text-green-800 dark:text-green-200 font-medium">Configuration Generated! Review and edit before applying.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Main Prompt */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">Main Context Prompt</label>
                                <textarea
                                    value={editedPrompt}
                                    onChange={(e) => setEditedPrompt(e.target.value)}
                                    className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-dark-subtle-bg border border-light-border dark:border-dark-border rounded-xl p-4 text-dark-text dark:text-light-text focus:ring-2 focus:ring-brand-red focus:outline-none resize-none font-mono text-sm leading-relaxed"
                                />
                            </div>

                            {/* Right: Prompt Builder Config */}
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-xs font-bold text-medium-text dark:text-medium-text-dark uppercase tracking-wider">Prompt Engineer Config</label>
                                {editedConfig && (
                                    <div className="border border-light-border dark:border-dark-border rounded-xl overflow-hidden h-[600px] flex flex-col">
                                        <div className="overflow-y-auto flex-1">
                                            <PromptBuilder 
                                                config={editedConfig} 
                                                onConfigChange={setEditedConfig} 
                                                isOpen={true} 
                                                onClose={() => {}} // No-op, embedded
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {generatedData && (
                <div className="p-4 border-t border-light-border dark:border-dark-border bg-gray-50 dark:bg-dark-subtle-bg flex justify-between items-center">
                    <button 
                        onClick={() => {
                            setEditedConfig(null); 
                            setEditedPrompt('');
                        }}
                        className="text-medium-text dark:text-medium-text-dark hover:text-dark-text dark:hover:text-light-text font-semibold text-sm underline"
                    >
                        Reset / Try Again
                    </button>
                    
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-dark-text dark:text-light-text hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={handleApply}
                            className="px-6 py-2 text-sm font-bold bg-brand-red text-dark-text rounded-lg hover:bg-brand-red-dark transition-colors shadow-md flex items-center gap-2"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Accept & Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
