import React from 'react';

interface SpinnerProps {
    message?: string | null;
}

export const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-light-card/75 dark:bg-dark-card/75 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-red"></div>
      {message && <p className="mt-4 text-center text-dark-text dark:text-light-text font-semibold">{message}</p>}
    </div>
  );
};