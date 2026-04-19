import React from 'react';
import { useError } from '../context/ErrorContext';

export const ErrorPopup: React.FC = () => {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-64 md:w-80 px-2 pointer-events-none">
      {errors.map((error) => (
        <div
          key={error.id}
          className="bg-black text-white px-3 py-2 rounded shadow-lg flex justify-between items-center gap-2 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
        >
          <span className="flex-1 text-xs">{error.message}</span>
          <button
            onClick={() => removeError(error.id)}
            className="text-gray-300 hover:text-white transition-colors shrink-0 p-1"
            aria-label="Close Error"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};