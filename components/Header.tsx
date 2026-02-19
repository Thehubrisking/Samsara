
import React from 'react';
import { SamsaraLogoLight, SamsaraLogoDark, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="fixed w-full top-0 z-20 bg-light-card/60 dark:bg-dark-card/60 backdrop-blur-2xl border-b-[0.5px] border-dark-text/5 dark:border-white/5">
      <div className="container mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
            {theme === 'light' 
              ? <SamsaraLogoLight className="h-10 w-auto opacity-80" /> 
              : <SamsaraLogoDark className="h-10 w-auto opacity-80" />
            }
            <div className="h-4 w-[0.5px] bg-dark-text/10 dark:bg-white/10 hidden sm:block" />
            <span className="text-[10px] font-light text-dark-text/40 dark:text-white/30 uppercase tracking-[0.4em] hidden sm:block">Atelier Pro Edition</span>
        </div>
        <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-dark-text/40 dark:text-white/40 hover:text-dark-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
