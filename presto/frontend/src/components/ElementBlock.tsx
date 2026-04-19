// React hooks
import React, { useState, useRef, useEffect, type MouseEvent } from 'react';
import type { SlideElement } from '../types';

// Helper for code highlighting
import { highlightCode } from '../lib/syntaxHighlight';

/** Props for a single interactive element block on a slide */
interface ElementBlockProps {
  element: SlideElement;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onDelete: () => void;
  isPreview?: boolean;
}

/**
 * ElementBlock handles the local interactive state for a slide element.
 * It manages dragging (movement), resizing (via corners), and specific rendering 
 * logic for different media types (Text, Image, Video, Code).
 */
export const ElementBlock: React.FC<ElementBlockProps> = ({
  element,
  isSelected,
  onSelect,
  onDoubleClick,
  onUpdate,
  onDelete,
  isPreview = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Local style state ensures smooth 60fps movement/resizing without waiting for context roundtrips
  const [localStyle, setLocalStyle] = useState({
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  /** Sync local style with remote element props when not actively manipulating */
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

  /** Right-click to delete shortcut on individual blocks */
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onDelete();
  };

  /* ── DRAG LOGIC ────────────────────────────────────── */

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

      // Coordinate clamping to keep element inside 0-100% bounds
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

  /* ── RESIZE LOGIC ─────────────────────────────────── */

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
      const dx = ((moveEvent.clientX - startX) / parentW) * 100;
      const dy = ((moveEvent.clientY - startY) / parentH) * 100;

      let newX = startObjX, newY = startObjY, newW = startObjW, newH = startObjH;

      if (corner.includes('e')) newW += dx;
      if (corner.includes('s')) newH += dy;
      if (corner.includes('w')) { newX += dx; newW -= dx; }
      if (corner.includes('n')) { newY += dy; newH -= dy; }

      // Boundaries & minimum size checks
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

  /* ── MEDIA RENDERERS ─────────────────────────────── */

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{ 
              fontSize: `${element.fontSize}em`, 
              color: element.color,
              backgroundColor: element.backgroundColor || 'transparent',
              textAlign: element.textAlign || 'left',
              fontFamily: element.fontFamily || 'Inter',
              width: '100%',
              height: '100%'
            }}
            className="overflow-y-auto whitespace-pre-wrap break-words p-2"
          >
            {element.text}
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-full overflow-hidden relative">
            <img
              src={element.src}
              alt={element.alt}
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{ transform: `rotate(${element.rotation || 0}deg)` }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const span = e.currentTarget.nextElementSibling as HTMLElement;
                if (span) span.style.display = 'block';
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center px-2 hidden">
              {element.alt || 'Broken Image'}
            </span>
          </div>
        );
      case 'video': {
        const appendQuery = element.src.includes('?') ? '&autoplay=1' : '?autoplay=1';
        return (
          <div className="w-full h-full overflow-hidden bg-gray-100 p-3 border border-gray-200">
            <iframe
              src={`${element.src}${element.autoplay ? appendQuery : ''}`}
              title="video"
              allowFullScreen
              className="w-full h-full border-0 pointer-events-auto bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }
      case 'code': {
        const themes: Record<string, { bg: string; plain: string; keyword: string; string: string; comment: string; number: string }> = {
          'vs-dark':     { bg: '#1e1e1e', plain: '#d4d4d4', keyword: '#569cd6', string: '#ce9178', comment: '#6a9955', number: '#b5cea8' },
          'monokai':     { bg: '#272822', plain: '#f8f8f2', keyword: '#f92672', string: '#e6db74', comment: '#75715e', number: '#ae81ff' },
          'ally-dark':   { bg: '#1a1a2e', plain: '#e0e0e0', keyword: '#00d2ff', string: '#ffcb6b', comment: '#546e7a', number: '#f78c6c' },
          'ally-light':  { bg: '#fafafa', plain: '#383a42', keyword: '#a626a4', string: '#50a14f', comment: '#a0a1a7', number: '#986801' },
          'solarized':   { bg: '#002b36', plain: '#839496', keyword: '#268bd2', string: '#2aa198', comment: '#586e75', number: '#d33682' },
        };
        const t = themes[element.theme || 'vs-dark'] || themes['vs-dark'];
        const langLabel: Record<string, string> = { javascript: 'JavaScript', python: 'Python', c: 'C', latex: 'LaTeX' };
        return (
          <div className="w-full h-full flex flex-col overflow-hidden pointer-events-none select-none font-mono" style={{ backgroundColor: t.bg }}>
            {/* Standard window frame with status lights and language tag */}
            {element.showFrame !== false && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 shrink-0" style={{ backgroundColor: t.bg, borderBottom: `1px solid ${t.comment}33` }}>
                <span className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                <span className="ml-auto text-[9px] font-semibold tracking-wider uppercase" style={{ color: t.comment }}>{langLabel[element.language] || element.language}</span>
              </div>
            )}
            {/* Syntax-highlighted code body */}
            <div
              style={{ fontSize: `${element.fontSize}em` }}
              className="flex-1 overflow-auto p-2"
            >
              <pre className="m-0 whitespace-pre leading-normal" style={{ color: t.plain }}>
                {highlightCode(element.code, element.language).map((line, i) => (
                  <div key={i} className="flex">
                    {element.showLineNumbers && (
                      <span className="inline-block w-8 text-right pr-3 select-none shrink-0" style={{ color: t.comment, opacity: 0.6 }}>{i + 1}</span>
                    )}
                    <span>
                      {line.map((segment, j) => {
                        let color = t.plain;
                        if (segment.kind === 'keyword') color = t.keyword;
                        if (segment.kind === 'string') color = t.string;
                        if (segment.kind === 'comment') color = t.comment;
                        if (segment.kind === 'number') color = t.number;
                        return <span key={j} style={{ color }}>{segment.value}</span>;
                      })}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={isPreview ? undefined : handleMouseDown}
      onDoubleClick={isPreview ? undefined : (e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      onContextMenu={isPreview ? undefined : handleContextMenu}
      className={`absolute flex ${isPreview ? '' : 'border border-gray-300 bg-white shadow-sm cursor-move group'}
        ${!isPreview && isSelected ? 'ring-2 ring-blue-500' : ''}
        ${!isPreview && !isSelected ? 'hover:ring-1 hover:ring-gray-300' : ''}
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

      {/* Resizer handles only visible when element is selected in editor mode */}
      {!isPreview && isSelected && (
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