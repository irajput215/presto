import React from 'react';
import { ElementBlock } from './ElementBlock';
import type { BackgroundStyle, Slide, SlideElement } from '../types';

/** Component props for the slide rendering canvas */
interface SlideCanvasProps {
  slide: Slide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onDoubleClickElement: (element: SlideElement) => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onDeleteElement: (id: string) => void;
  isEditable?: boolean;
  isPreview?: boolean;
  slideNumber?: number;
  defaultBackground?: BackgroundStyle;
}

/**
 * SlideCanvas represents the 16:9 visual area where slide elements are displayed.
 * Handles background rendering (colors, gradients, images) and element layout.
 */
export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  selectedElementId,
  onSelectElement,
  onDoubleClickElement,
  onUpdateElement,
  onDeleteElement,
  isEditable = true,
  isPreview = false,
  slideNumber,
  defaultBackground
}) => {
  // Resolve active background (Slide override > Presentation default > White)
  const bg = slide.background || defaultBackground || null;
  let bgStyle: React.CSSProperties = { backgroundColor: '#ffffff' };

  if (bg) {
    if (bg.kind === 'solid') bgStyle = { backgroundColor: bg.value };
    if (bg.kind === 'gradient') bgStyle = { background: bg.value };
    if (bg.kind === 'image') bgStyle = {
      backgroundImage: `url(${bg.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  /** Clicking the background deselects any currently active element */
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };

  return (
    <div
      className="relative w-full h-full shadow-2xl rounded-sm ring-1 ring-black/5 isolate overflow-hidden"
      style={bgStyle}
      onClick={handleCanvasClick}
    >
      {/* Empty state hint visible in editor mode */}
      {slide.elements.length === 0 && !isPreview && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium pointer-events-none">
          (Empty Slide)
        </div>
      )}

      {/* Render children elements in order (controlled by layer/z-index in ElementBlock) */}
      {slide.elements.map(element => (
        <ElementBlock
          key={element.id}
          element={element}
          isSelected={isEditable && selectedElementId === element.id}
          isPreview={isPreview}
          onSelect={() => onSelectElement(element.id)}
          onDoubleClick={() => onDoubleClickElement(element)}
          onUpdate={(updates) => onUpdateElement(element.id, updates)}
          onDelete={() => onDeleteElement(element.id)}
        />
      ))}

      {/* Slide pagination floating indicator */}
      {slideNumber !== undefined && (
        <div className="absolute bottom-4 left-4 text-[1em] font-medium text-gray-500 z-10 pointer-events-none">
          {slideNumber}
        </div>
      )}
    </div>
  );
};