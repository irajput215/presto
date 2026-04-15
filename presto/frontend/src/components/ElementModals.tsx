import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import type { TextElement, ImageElement, VideoElement, CodeElement } from '../types';

// Helper component for common size/position inputs
const DimensionInputs = ({ 
  width, setWidth, 
  height, setHeight, 
  x, setX, 
  y, setY,
  isEdit
}: any) => (
  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">Width (%)</label>
      <input type="number" min="1" max="100" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" required />
    </div>
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">Height (%)</label>
      <input type="number" min="1" max="100" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" required />
    </div>
    {isEdit && (
      <>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">X Position (%)</label>
          <input type="number" min="0" max="100" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Y Position (%)</label>
          <input type="number" min="0" max="100" value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" required />
        </div>
      </>
    )}
  </div>
);

export const TextModal = ({ element, onClose, onSave }: { element?: TextElement, onClose: () => void, onSave: (el: TextElement) => void }) => {
  const [text, setText] = useState(element?.text || '');
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  const [color, setColor] = useState(element?.color || '#000000');
  
  const [width, setWidth] = useState(element?.width || 30);
  const [height, setHeight] = useState(element?.height || 20);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: element?.id || Date.now().toString(),
      type: 'text',
      layer: element?.layer || 0,
      width, height, x, y,
      text, fontSize, color
    });
  };

  return (
    <Modal title={element ? "Edit Text" : "Add Text"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} x={x} setX={setX} y={y} setY={setY} isEdit={!!element} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Text Content</label>
          <textarea 
            value={text} onChange={(e) => setText(e.target.value)} required
            className="w-full min-h-[100px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y text-sm"
            placeholder="Enter your text here..."
          />
        </div>
        <div className="flex gap-4">
          <Input label="Font Size (em)" type="number" step="0.1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} required />
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Color (HEX)</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 p-1 rounded cursor-pointer" />
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
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

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
      width, height, x, y,
      src, alt
    });
  };

  return (
    <Modal title={element ? "Edit Image" : "Add Image"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} x={x} setX={setX} y={y} setY={setY} isEdit={!!element} />
        <Input label="Image URL or Base64" value={src} onChange={(e) => setSrc(e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Or Upload File</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
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
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

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
      width, height, x, y,
      src: finalSrc, autoplay
    });
  };

  return (
    <Modal title={element ? "Edit Video" : "Add Video"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} x={x} setX={setX} y={y} setY={setY} isEdit={!!element} />
        <Input label="YouTube URL" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ" required />
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
  const [language, setLanguage] = useState(element?.language || 'python');
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  
  const [width, setWidth] = useState(element?.width || 35);
  const [height, setHeight] = useState(element?.height || 25);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: element?.id || Date.now().toString(),
      type: 'code',
      layer: element?.layer || 0,
      width, height, x, y,
      code, language: language as any, fontSize
    });
  };

  return (
    <Modal title={element ? "Edit Code" : "Add Code"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <DimensionInputs width={width} setWidth={setWidth} height={height} setHeight={setHeight} x={x} setX={setX} y={y} setY={setY} isEdit={!!element} />
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="c">C</option>
            </select>
          </div>
          <Input label="Font Size (em)" type="number" step="0.1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Code Source</label>
          <textarea 
            value={code} onChange={(e) => setCode(e.target.value)} required
            className="w-full min-h-[120px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono text-sm shadow-inner bg-gray-50"
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
