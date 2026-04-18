import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import type { TextElement, ImageElement, VideoElement, CodeElement } from '../types';
import { detectLanguage, languageNames } from '../lib/syntaxHighlight';

type DimensionInputsProps = {
  width: number;
  setWidth: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
};

// Helper component for common size/position inputs
const DimensionInputs = ({
  width, setWidth,
  height, setHeight
}: DimensionInputsProps) => (
  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 transition-colors">
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Width (%)</label>
      <input type="number" step="any" min="1" max="100" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors" required />
    </div>
    <div>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Height (%)</label>
      <input type="number" step="any" min="1" max="100" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors" required />
    </div>
  </div>
);

export const TextModal = ({ element, onClose, onSave }: { element?: TextElement, onClose: () => void, onSave: (el: TextElement) => void }) => {
  const [text, setText] = useState(element?.text || '');
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  const [color, setColor] = useState(element?.color || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(element?.backgroundColor || 'transparent');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>(element?.textAlign || 'left');
  const [fontFamily, setFontFamily] = useState(element?.fontFamily || 'Inter');

  const [width, setWidth] = useState(element?.width || 30);
  const [height, setHeight] = useState(element?.height || 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: element?.id || Date.now().toString(),
      type: 'text',
      layer: element?.layer || 0,
      width, height, x: element?.x || 0, y: element?.y || 0,
      text, fontSize, color, backgroundColor, textAlign, fontFamily
    });
  };

  return (
    <Modal title={element ? "Edit Text" : "Add Text"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Content</label>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} required
            className="w-full min-h-[100px] p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y text-sm transition-colors"
            placeholder="Enter your text here..."
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Font Size (em)" type="number" step="0.1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="h-10 px-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-colors" style={{ fontFamily }}>
                <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
                <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
                <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
                <option value="Comic Sans MS" style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans</option>
                <option value="Times New Roman" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alignment</label>
              <div className="flex gap-1 h-10">
                <button type="button" onClick={() => setTextAlign('left')} className={`flex-1 flex items-center justify-center border rounded transition-colors ${textAlign === 'left' ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'}`} title="Align Left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                </button>
                <button type="button" onClick={() => setTextAlign('center')} className={`flex-1 flex items-center justify-center border rounded transition-colors ${textAlign === 'center' ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'}`} title="Align Center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="14" x2="6" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                </button>
                <button type="button" onClick={() => setTextAlign('right')} className={`flex-1 flex items-center justify-center border rounded transition-colors ${textAlign === 'right' ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'}`} title="Align Right">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="7" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1 rounded cursor-pointer border dark:border-gray-600 shadow-sm" />
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 h-10 px-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm transition-colors" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-12 h-10 p-1 rounded cursor-pointer border dark:border-gray-600 shadow-sm" />
                <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} placeholder="transparent" className="flex-1 h-10 px-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export const ImageModal = ({ element, onClose, onSave }: { element?: ImageElement, onClose: () => void, onSave: (el: ImageElement) => void }) => {
  const [src, setSrc] = useState(element?.src || '');
  const [alt, setAlt] = useState(element?.alt || '');

  const [width, setWidth] = useState(element?.width || 30);
  const [height, setHeight] = useState(element?.height || 30);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: element?.id || Date.now().toString(),
      type: 'image',
      layer: element?.layer || 0,
      width, height, x: element?.x || 0, y: element?.y || 0,
      src, alt
    });
  };

  return (
    <Modal title={element ? "Edit Image" : "Add Image"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} />
        <Input label="Image URL or Base64" value={src} onChange={(e) => setSrc(e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Or Upload File</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 transition-colors" />
        </div>
        <Input label="Alt Text" value={alt} onChange={(e) => setAlt(e.target.value)} required />
        <div className="flex gap-3 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export const VideoModal = ({ element, onClose, onSave }: { element?: VideoElement, onClose: () => void, onSave: (el: VideoElement) => void }) => {
  const [src, setSrc] = useState(element?.src || '');
  const [autoplay, setAutoplay] = useState(element?.autoplay || false);

  const [width, setWidth] = useState(element?.width || 40);
  const [height, setHeight] = useState(element?.height || 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate youtube embed url structure roughly
    let finalSrc = src;
    if (finalSrc.includes('youtube.com/watch?v=')) {
      finalSrc = finalSrc.replace('watch?v=', 'embed/');
    }
    onSave({
      id: element?.id || Date.now().toString(),
      type: 'video',
      layer: element?.layer || 0,
      width, height, x: element?.x || 0, y: element?.y || 0,
      src: finalSrc, autoplay
    });
  };

  return (
    <Modal title={element ? "Edit Video" : "Add Video"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} />
        <Input label="YouTube URL" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ" required />
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
          <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
          Auto-play
        </label>
        <div className="flex gap-3 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export const CodeModal = ({ element, onClose, onSave }: { element?: CodeElement, onClose: () => void, onSave: (el: CodeElement) => void }) => {
  const [code, setCode] = useState(element?.code || '');
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);

  const [width, setWidth] = useState(element?.width || 35);
  const [height, setHeight] = useState(element?.height || 25);
  const detectedLanguage = code.trim() ? detectLanguage(code) : element?.language || 'javascript';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: element?.id || Date.now().toString(),
      type: 'code',
      layer: element?.layer || 0,
      width, height, x: element?.x || 0, y: element?.y || 0,
      code, language: detectedLanguage, fontSize
    });
  };

  return (
    <Modal title={element ? "Edit Code Block" : "Add Code Block"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} />
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-full">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Detected Language</span>
            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors">
              {languageNames[detectedLanguage]}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Language is detected automatically from the code. Supported: C, Python, JavaScript.
            </p>
          </div>
          <Input label="Font Size (em)" type="number" step="0.1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
          <textarea
            value={code} onChange={(e) => setCode(e.target.value)} required
            className="w-full min-h-[140px] p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono text-sm shadow-inner bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 whitespace-pre transition-colors"
            spellCheck={false}
            placeholder="def hello_world():&#10;  print('Hello')"
          />
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};
