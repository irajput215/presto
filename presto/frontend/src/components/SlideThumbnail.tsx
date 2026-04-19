import React from 'react';
import { SlideCanvas } from './SlideCanvas';
import type { BackgroundStyle, Slide } from '../types';

type SlideThumbnailProps = {
  slide: Slide;
  slideNumber: number;
  defaultBackground: BackgroundStyle;
  showLabel?: boolean;
};

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  slideNumber,
  defaultBackground,
  showLabel = true,
}) => (
  <div className="relative aspect-[16/9] w-full overflow-hidden rounded border border-gray-200 bg-white shadow-inner">
    <div className="absolute inset-0 pointer-events-none text-[2px]">
      <SlideCanvas
        slide={slide}
        selectedElementId={null}
        isEditable={false}
        isPreview={true}
        defaultBackground={defaultBackground}
        onSelectElement={() => { }}
        onDoubleClickElement={() => { }}
        onUpdateElement={() => { }}
        onDeleteElement={() => { }}
      />
    </div>
    {showLabel && (
      <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        Slide {slideNumber}
      </div>
    )}
  </div>
);