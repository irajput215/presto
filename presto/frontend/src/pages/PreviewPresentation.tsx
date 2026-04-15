import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { SlideCanvas } from '../components/SlideCanvas';

export const PreviewPresentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { presentations } = useStore();
  const presentation = presentations.find((p) => p.id === id);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSlide = Math.max(0, parseInt(searchParams.get('slide') || '1', 10) - 1);
  const [currentSlide, setCurrentSlide] = useState(initialSlide);

  const slideCount = presentation?.slides.length || 0;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide >= slideCount - 1;

  const navigateSlide = useCallback((dir: 'prev' | 'next') => {
    setCurrentSlide((prev) => {
      if (dir === 'prev' && prev > 0) return prev - 1;
      if (dir === 'next' && prev < slideCount - 1) return prev + 1;
      return prev;
    });
  }, [slideCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateSlide('prev');
      if (e.key === 'ArrowRight') navigateSlide('next');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigateSlide]);

  // Sync slide number to URL
  useEffect(() => {
    setSearchParams({ slide: String(currentSlide + 1) }, { replace: true });
  }, [currentSlide, setSearchParams]);

  if (!presentation) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Presentation not found.</p>
      </div>
    );
  }

  const activeSlide = presentation.slides[currentSlide];

  return (
    <div className="w-screen h-screen bg-black flex flex-col overflow-hidden select-none">
      {/* Full-screen slide */}
      <div className="flex-1 relative">
        <SlideCanvas
          slide={activeSlide}
          slideNumber={currentSlide + 1}
          selectedElementId={null}
          isEditable={false}
          isPreview={true}
          defaultBackground={presentation.defaultBackground}
          onSelectElement={() => { }}
          onDoubleClickElement={() => { }}
          onUpdateElement={() => { }}
          onDeleteElement={() => { }}
        />
      </div>

      {/* Bottom bar with navigation */}
      <div className="h-12 bg-black/90 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
        {/* Slide counter */}
        <span className="text-white/70 text-sm font-medium tabular-nums">
          {currentSlide + 1} / {slideCount}
        </span>

        {/* Arrow controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateSlide('prev')}
            disabled={isFirstSlide}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-white font-bold transition-all ${isFirstSlide ? 'opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/25 cursor-pointer'}`}
            title="Previous Slide (←)"
          >
            ←
          </button>
          <button
            onClick={() => navigateSlide('next')}
            disabled={isLastSlide}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-white font-bold transition-all ${isLastSlide ? 'opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/25 cursor-pointer'}`}
            title="Next Slide (→)"
          >
            →
          </button>
        </div>

        {/* Presentation title */}
        <span className="text-white/50 text-xs truncate max-w-[200px]">
          {presentation.name}
        </span>
      </div>
    </div>
  );
};
