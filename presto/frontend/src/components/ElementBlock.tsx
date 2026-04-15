import React, { useState, useRef, useEffect, type MouseEvent } from 'react';
import type { SlideElement } from '../types';
import { highlightCode } from '../lib/syntaxHighlight';

interface ElementBlockProps {
  element: SlideElement;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onDelete: () => void;
}

export const ElementBlock: React.FC<ElementBlockProps> = ({
  element,
  isSelected,
  onSelect,
  onDoubleClick,
  onUpdate,
  onDelete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localStyle, setLocalStyle] = useState({
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  useEffect(() => {
    if (!isDragging && !isResizing) {
      setLocalStyle({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      });
    }
  }, [element, isDragging, isResizing]);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onDelete();
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!isSelected) {
      onSelect();
    }
    e.stopPropagation();
    
    setIsDragging(true);

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startObjX = localStyle.x;
    const startObjY = localStyle.y;
    const parentW = parent.clientWidth;
    const parentH = parent.clientHeight;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const dx = ((moveEvent.clientX - startX) / parentW) * 100;
      const dy = ((moveEvent.clientY - startY) / parentH) * 100;

      let newX = startObjX + dx;
      let newY = startObjY + dy;

      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + localStyle.width > 100) newX = 100 - localStyle.width;
      if (newY + localStyle.height > 100) newY = 100 - localStyle.height;

      setLocalStyle(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setLocalStyle(final => {
        onUpdate({ x: final.x, y: final.y });
        return final;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeDown = (e: MouseEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(corner);

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startObjX = localStyle.x;
    const startObjY = localStyle.y;
    const startObjW = localStyle.width;
    const startObjH = localStyle.height;
    const parentW = parent.clientWidth;
    const parentH = parent.clientHeight;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      let dx = ((moveEvent.clientX - startX) / parentW) * 100;
      let dy = ((moveEvent.clientY - startY) / parentH) * 100;

      let newX = startObjX;
      let newY = startObjY;
      let newW = startObjW;
      let newH = startObjH;

      if (corner.includes('e')) newW += dx;
      if (corner.includes('s')) newH += dy;
      if (corner.includes('w')) {
        newX += dx;
        newW -= dx;
      }
      if (corner.includes('n')) {
        newY += dy;
        newH -= dy;
      }

      if (newW < 1) { newW = 1; if (corner.includes('w')) newX = startObjX + startObjW - 1; }
      if (newH < 1) { newH = 1; if (corner.includes('n')) newY = startObjY + startObjH - 1; }
      if (newX < 0) { newW += newX; newX = 0; }
      if (newY < 0) { newH += newY; newY = 0; }
      if (newX + newW > 100) newW = 100 - newX;
      if (newY + newH > 100) newH = 100 - newY;

      setLocalStyle({ x: newX, y: newY, width: newW, height: newH });
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setLocalStyle(final => {
        onUpdate({ x: final.x, y: final.y, width: final.width, height: final.height });
        return final;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            style={{ fontSize: `${element.fontSize}em`, color: element.color }}
            className="w-full h-full overflow-y-auto whitespace-pre-wrap break-words"
          >
            {element.text}
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-full overflow-hidden">
            <img 
              src={element.src} 
              alt={element.alt} 
              className="w-full h-full object-contain select-none pointer-events-none" 
            />
          </div>
        );
      case 'video':
        const appendQuery = element.src.includes('?') ? '&autoplay=1&mute=1' : '?autoplay=1&mute=1';
        return (
          <div className="w-full h-full pointer-events-none overflow-hidden">
             <iframe
               src={`${element.src}${element.autoplay ? appendQuery : ''}`}
               title="video"
               allowFullScreen
               className="w-full h-full border-0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             />
          </div>
        );
      case 'code':
        return (
          <div 
            style={{ fontSize: `${element.fontSize}em` }}
            className="w-full h-full overflow-auto bg-[#1e1e1e] p-2 pointer-events-none select-none"
          >
            <pre className="m-0 font-mono text-sm whitespace-pre-wrap break-words text-white">
              {highlightCode(element.code, element.language).map((line, i) => (
                <div key={i}>
                  {line.map((segment, j) => {
                    let color = '#d4d4d4'; // plain
                    if (segment.kind === 'keyword') color = '#569cd6';
                    if (segment.kind === 'string') color = '#ce9178';
                    if (segment.kind === 'comment') color = '#6a9955';
                    return <span key={j} style={{ color }}>{segment.value}</span>;
                  })}
                </div>
              ))}
            </pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onContextMenu={handleContextMenu}
      className={`absolute flex border border-gray-300 bg-white shadow-sm cursor-move group
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}
      `}
      style={{
        left: `${localStyle.x}%`,
        top: `${localStyle.y}%`,
        width: `${localStyle.width}%`,
        height: `${localStyle.height}%`,
        zIndex: element.layer
      }}
    >
      {renderContent()}

      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 cursor-nwse-resize -translate-x-1/2 -translate-y-1/2" onMouseDown={(e) => handleResizeDown(e, 'nw')} />
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 cursor-nesw-resize translate-x-1/2 -translate-y-1/2" onMouseDown={(e) => handleResizeDown(e, 'ne')} />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 cursor-nesw-resize -translate-x-1/2 translate-y-1/2" onMouseDown={(e) => handleResizeDown(e, 'sw')} />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-nwse-resize translate-x-1/2 translate-y-1/2" onMouseDown={(e) => handleResizeDown(e, 'se')} />
        </>
      )}
    </div>
  );
};
