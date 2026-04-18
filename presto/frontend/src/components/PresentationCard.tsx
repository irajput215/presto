import React from 'react';
import { SlideThumbnail } from './SlideThumbnail';
import type { Presentation } from '../types';

interface PresentationCardProps {
  presentation: Presentation;
  onClick: () => void;
}

export const PresentationCard: React.FC<PresentationCardProps> = ({ presentation, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex md:flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all text-left overflow-hidden group min-w-[100px]"
    >
      <div className="w-1/3 md:w-full aspect-[2/1] relative bg-gray-100 dark:bg-gray-900 border-r md:border-r-0 md:border-b border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-center">
        {presentation.thumbnail ? (
          <img 
            src={presentation.thumbnail} 
            alt={`${presentation.name} thumbnail`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full">
            <SlideThumbnail
              slide={presentation.slides[0]}
              slideNumber={1}
              defaultBackground={presentation.defaultBackground}
              showLabel={false}
            />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 w-full relative">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{presentation.name}</h3>
        {presentation.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {presentation.description}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded transition-colors">
            {presentation.slides.length} SLIDE{presentation.slides.length !== 1 && 'S'}
          </span>
        </div>
      </div>
    </button>
  );
};
