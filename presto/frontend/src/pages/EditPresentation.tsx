import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useError } from '../context/ErrorContext';
import { SlideCanvas } from '../components/SlideCanvas';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextModal, ImageModal, VideoModal, CodeModal } from '../components/ElementModals';
import type { BackgroundKind, BackgroundStyle, CodeElement, ImageElement, SlideElement, TextElement, VideoElement, CodeLanguage, CodeTheme } from '../types';

type ModalType = 'text' | 'image' | 'video' | 'code' | null;

/* ── SVG Icons ───────────────────────────────────────── */
const IconText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" /></svg>;
const IconImage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>;
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
const IconCode = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const IconPanel = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>;
const IconSliders = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>;

/* ── Inline Editor Forms ─────────────────────────────── */
const SidebarDimensions = ({ el, onChange }: { el: SlideElement; onChange: (u: Partial<SlideElement>) => void }) => {
  const field = (lbl: string, key: 'width' | 'height' | 'x' | 'y', min: number) => (
    <div>
      <label className="block text-[9px] font-bold text-gray-500 uppercase">{lbl}</label>
      <input type="number" step="1" min={min} max="100" value={Math.floor(el[key])} onChange={e => onChange({ [key]: Number(e.target.value) })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" />
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {field('W %', 'width', 1)}{field('H %', 'height', 1)}{field('X %', 'x', 0)}{field('Y %', 'y', 0)}
    </div>
  );
};

const SidebarTextFields = ({ el, onChange }: { el: TextElement; onChange: (u: Partial<TextElement>) => void }) => (
  <div className="flex flex-col gap-3 mt-4">
    <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Text</label><textarea value={el.text} onChange={e => onChange({ text: e.target.value })} className="w-full min-h-[60px] p-1.5 text-xs border rounded outline-none resize-y" /></div>
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Align</label>
        <div className="flex gap-1">
          <button onClick={() => onChange({ textAlign: 'left' })} className={`flex-1 py-1.5 flex items-center justify-center border rounded transition-colors ${el.textAlign === 'left' || !el.textAlign ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`} title="Align Left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="17" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>
          </button>
          <button onClick={() => onChange({ textAlign: 'center' })} className={`flex-1 py-1.5 flex items-center justify-center border rounded transition-colors ${el.textAlign === 'center' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`} title="Align Center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="18" y1="14" x2="6" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>
          </button>
          <button onClick={() => onChange({ textAlign: 'right' })} className={`flex-1 py-1.5 flex items-center justify-center border rounded transition-colors ${el.textAlign === 'right' ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`} title="Align Right">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="7" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>
          </button>
        </div>
      </div>

      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Font</label>
        <select value={el.fontFamily || 'Inter'} onChange={e => onChange({ fontFamily: e.target.value })} className="w-full px-1 py-1 text-[11px] border rounded outline-none bg-white" style={{ fontFamily: el.fontFamily || 'Inter' }}>
          <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
          <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
          <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
          <option value="Comic Sans MS" style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans</option>
          <option value="Times New Roman" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
        </select>
      </div>

      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Size (em)</label><input type="number" step="0.1" value={el.fontSize} onChange={e => onChange({ fontSize: Number(e.target.value) })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" /></div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase">Color</label>
          <input type="color" value={el.color} onChange={e => onChange({ color: e.target.value })} className="w-full h-7 p-0.5 rounded cursor-pointer border shadow-sm" />
          <input type="text" value={el.color} onChange={e => onChange({ color: e.target.value })} className="w-full mt-1 px-1 py-0.5 text-[9px] border rounded font-mono text-center focus:border-blue-400 outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase">Bg Color</label>
          <input type="color" value={el.backgroundColor || '#ffffff'} onChange={e => onChange({ backgroundColor: e.target.value })} className="w-full h-7 p-0.5 rounded cursor-pointer border shadow-sm" />
          <input type="text" value={el.backgroundColor || 'transparent'} onChange={e => onChange({ backgroundColor: e.target.value })} className="w-full mt-1 px-1 py-0.5 text-[9px] border rounded font-mono text-center focus:border-blue-400 outline-none" />
        </div>
      </div>
    </div>
  </div>
);

const SidebarImageFields = ({ el, onChange }: { el: ImageElement; onChange: (u: Partial<ImageElement>) => void }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange({ src: reader.result as string });
      reader.readAsDataURL(file);
    }
  };
  const handleRotate = () => {
    const current = el.rotation || 0;
    onChange({ rotation: (current + 90) % 360 });
  };
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase">Image URL</label>
        <input type="text" value={el.src} onChange={e => onChange({ src: e.target.value })} placeholder="https://example.com/image.png" className="w-full px-1.5 py-1 text-xs border rounded outline-none break-all" />
        <p className="text-[8px] text-gray-400 mt-0.5">Supports PNG, JPG, GIF, SVG, WebP</p>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Upload</label>
        <label className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded cursor-pointer transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Choose File
          <input type="file" accept="image/*,.gif" onChange={handleFile} className="hidden" />
        </label>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase">Alt Text</label>
        <input type="text" value={el.alt} onChange={e => onChange({ alt: e.target.value })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Rotate</label>
        <button onClick={handleRotate} className="w-full py-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded flex items-center justify-center gap-1.5 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          90° ({el.rotation || 0}°)
        </button>
      </div>
    </div>
  );
};

const SidebarVideoFields = ({ el, onChange }: { el: VideoElement; onChange: (u: Partial<VideoElement>) => void }) => (
  <div className="flex flex-col gap-3 mt-4">
    <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">YouTube URL</label><input type="text" value={el.src} onChange={e => onChange({ src: e.target.value })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" /></div>
    <label className="flex items-center gap-1.5 text-[11px]"><input type="checkbox" checked={el.autoplay} onChange={e => onChange({ autoplay: e.target.checked })} /> Auto-play</label>
  </div>
);

const SidebarCodeFields = ({ el, onChange }: { el: CodeElement; onChange: (u: Partial<CodeElement>) => void }) => {
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex flex-col gap-3">
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Language</label>
          <select value={el.language} onChange={e => onChange({ language: e.target.value as CodeLanguage })} className="w-full px-1 py-1 text-[11px] border rounded outline-none bg-white">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="latex">LaTeX</option>
          </select>
        </div>
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Theme</label>
          <select value={el.theme || 'vs-dark'} onChange={e => onChange({ theme: e.target.value as CodeTheme })} className="w-full px-1 py-1 text-[11px] border rounded outline-none bg-white">
            <option value="vs-dark">VS Dark</option>
            <option value="monokai">Monokai</option>
            <option value="ally-dark">Ally Dark</option>
            <option value="ally-light">Ally Light</option>
            <option value="solarized">Solarized</option>
          </select>
        </div>
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Size</label><input type="number" step="0.1" value={el.fontSize} onChange={e => onChange({ fontSize: Number(e.target.value) })} className="w-full px-1.5 py-1 text-[11px] border rounded" /></div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Line Numbers</label>
          <button
            onClick={() => onChange({ showLineNumbers: !el.showLineNumbers })}
            className={`w-full py-1 text-[10px] font-bold border rounded flex items-center justify-center gap-1.5 transition-colors ${el.showLineNumbers ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
            {el.showLineNumbers ? 'ON' : 'OFF'}
          </button>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Frame</label>
          <button
            onClick={() => onChange({ showFrame: !el.showFrame })}
            className={`w-full py-1 text-[10px] font-bold border rounded flex items-center justify-center gap-1.5 transition-colors ${el.showFrame ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            {el.showFrame ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Code</label><textarea value={el.code} onChange={e => onChange({ code: e.target.value })} spellCheck={false} className="w-full min-h-[80px] p-1.5 text-[11px] border rounded outline-none font-mono whitespace-pre resize-y" /></div>
    </div>
  );
};

export const EditPresentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { presentations, updatePresentation, deletePresentation, addElement, updateElement, deleteElement } = useStore();
  const { showError } = useError();

  const presentation = presentations.find((p) => p.id === id);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSlide = Math.max(0, parseInt(searchParams.get('slide') || '1', 10) - 1);
  const [currentSlide, setCurrentSlide] = useState(initialSlide);

  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeModalType, setActiveModalType] = useState<ModalType>(null);
  const [editingElement, setEditingElement] = useState<SlideElement | null>(null);

  const [isToolsOpen, setIsToolsOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(true);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);

  const [editName, setEditName] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Sync slide number to URL
  useEffect(() => {
    setSearchParams({ slide: String(currentSlide + 1) }, { replace: true });
  }, [currentSlide, setSearchParams]);

  const navigateSlide = useCallback((direction: 'next' | 'prev') => {
    if (!presentation) return;
    if (direction === 'next' && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(s => s + 1);
      setSelectedElementId(null);
    }
    if (direction === 'prev' && currentSlide > 0) {
      setCurrentSlide(s => s - 1);
      setSelectedElementId(null);
    }
  }, [presentation, currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') navigateSlide('next');
      if (e.key === 'ArrowLeft') navigateSlide('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateSlide]);

  if (!presentation) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <p className="text-gray-500">Presentation not found.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const slideCount = presentation.slides.length;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slideCount - 1;
  const activeSlideData = presentation.slides[currentSlide];

  const selectedEl = activeSlideData.elements.find(e => e.id === selectedElementId) || null;

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await updatePresentation(presentation.id, {
        name: editName,
        thumbnail: editThumbnail,
        description: editDescription
      });
      setIsEditDetailsOpen(false);
    } catch {
      showError("Failed to update presentation details.");
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deletePresentation(presentation.id);
      setIsDeleteOpen(false);
      navigate('/dashboard');
    } catch {
      showError("Failed to delete presentation.");
    }
  };

  const handleAddSlide = async () => {
    const newSlide = {
      id: Date.now().toString(),
      background: null,
      elements: [
        {
          id: Date.now().toString() + '-title',
          type: 'text' as const,
          x: 20,
          y: 5,
          width: 60,
          height: 15,
          layer: 0,
          text: 'Title Text',
          fontSize: 3,
          color: '#000000'
        }
      ]
    };
    await updatePresentation(presentation.id, {
      slides: [...presentation.slides, newSlide]
    });
    setCurrentSlide(presentation.slides.length);
  };

  const handleDeleteSlide = async () => {
    if (slideCount === 1) {
      showError("Cannot delete the only slide! Please delete the presentation instead.");
      return;
    }
    const updatedSlides = presentation.slides.filter((_, index) => index !== currentSlide);
    await updatePresentation(presentation.id, { slides: updatedSlides });
    if (currentSlide === slideCount - 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleOpenDetailsModal = () => {
    setEditName(presentation.name);
    setEditThumbnail(presentation.thumbnail);
    setEditDescription(presentation.description);
    setIsEditDetailsOpen(true);
  };

  const handleSaveElement = async (el: SlideElement) => {
    try {
      if (editingElement) {
        await updateElement(presentation.id, activeSlideData.id, el.id, el);
      } else {
        const highestLayer = activeSlideData.elements.reduce((max, e) => Math.max(max, e.layer || 0), 0);
        const newLayer = activeSlideData.elements.length > 0 ? highestLayer + 1 : 0;
        await addElement(presentation.id, activeSlideData.id, { ...el, layer: newLayer });
        setSelectedElementId(el.id);
      }
      setActiveModalType(null);
      setEditingElement(null);
    } catch {
      showError("Failed to save element");
    }
  };

  const handleInlineUpdate = async (updates: Partial<SlideElement>) => {
    if (!selectedEl) return;
    try {
      let finalUpdates = { ...updates } as any;
      if (finalUpdates.src && finalUpdates.src.includes('watch?v=')) {
        finalUpdates.src = finalUpdates.src.replace('watch?v=', 'embed/');
      }
      await updateElement(presentation.id, activeSlideData.id, selectedEl.id, { ...selectedEl, ...finalUpdates } as SlideElement);
    } catch {
      showError("Failed to update element");
    }
  };

  const handleDuplicate = async () => {
    if (!selectedEl) return;
    const highestLayer = activeSlideData.elements.reduce((max, el) => Math.max(max, el.layer || 0), 0);
    const clone = { ...selectedEl, id: Date.now().toString(), x: Math.min(selectedEl.x + 5, 95), y: Math.min(selectedEl.y + 5, 95), layer: highestLayer + 1 };
    await addElement(presentation.id, activeSlideData.id, clone);
    setSelectedElementId(clone.id);
  };


  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">

      {/* ── UNTOUCHED TOP BAR ───────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
          <div className="flex gap-2">
            <button onClick={() => setIsToolsOpen(!isToolsOpen)} className={`p-1.5 rounded transition-colors ${isToolsOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Toggle Tool Panel">
              <IconPanel />
            </button>
            <button onClick={() => setIsEditOpen(!isEditOpen)} className={`p-1.5 rounded transition-colors ${isEditOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Toggle Edit Panel">
              <IconSliders />
            </button>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 leading-tight truncate max-w-md">
              {presentation.name}
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenDetailsModal}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded transition-colors"
                title="Edit Title"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              </button>
              <button
                onClick={handleOpenDetailsModal}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded transition-colors"
                title="Edit Thumbnail"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleAddSlide}>
            <span className="mr-1">+</span> Add Slide
          </Button>
          <Button variant="danger" onClick={handleDeleteSlide}>
            Delete Slide
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button variant="secondary" onClick={() => window.open(`/presentation/${presentation.id}/preview`, '_blank')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Preview
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Presentation
          </Button>
        </div>
      </header>

      {/* ── LOWER SECTION ───────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* 1. Thin Left Icon Bar (Add Element Bar only) */}
        {isToolsOpen && (
          <div className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-30 shrink-0 gap-3 transition-all duration-300">
            <button title="Add Text" onClick={() => { setActiveModalType('text'); setEditingElement(null); }} className="w-10 h-10 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50 transition-colors"><IconText /></button>
            <button title="Add Image" onClick={() => { setActiveModalType('image'); setEditingElement(null); }} className="w-10 h-10 flex items-center justify-center rounded text-green-600 hover:bg-green-50 transition-colors"><IconImage /></button>
            <button title="Add Video" onClick={() => { setActiveModalType('video'); setEditingElement(null); }} className="w-10 h-10 flex items-center justify-center rounded text-purple-600 hover:bg-purple-50 transition-colors"><IconVideo /></button>
            <button title="Add Code" onClick={() => { setActiveModalType('code'); setEditingElement(null); }} className="w-10 h-10 flex items-center justify-center rounded text-orange-600 hover:bg-orange-50 transition-colors"><IconCode /></button>
          </div>
        )}

        {/* 2. Thin Edit Side Bar (Inline Edit Bar next to Icon Bar) */}
        {isEditOpen && (
          <div className="w-[180px] bg-[#fafafa] border-r border-gray-200 flex flex-col z-20 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)] overflow-y-auto transition-all duration-300">
            {selectedEl ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-200 sticky top-0 z-10">
                  <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {selectedEl.type}
                  </span>
                  <button onClick={() => setSelectedElementId(null)} className="text-gray-400 hover:text-black">✖</button>
                </div>

                <div className="p-3 flex-1 overflow-y-auto">
                  <SidebarDimensions el={selectedEl} onChange={handleInlineUpdate} />
                  <div className="w-full h-px bg-gray-200 my-4" />
                  {selectedEl.type === 'text' && <SidebarTextFields el={selectedEl} onChange={handleInlineUpdate} />}
                  {selectedEl.type === 'image' && <SidebarImageFields el={selectedEl} onChange={handleInlineUpdate} />}
                  {selectedEl.type === 'video' && <SidebarVideoFields el={selectedEl} onChange={handleInlineUpdate} />}
                  {selectedEl.type === 'code' && <SidebarCodeFields el={selectedEl} onChange={handleInlineUpdate} />}
                </div>

                <div className="p-3 bg-white border-t border-gray-200 mt-auto flex flex-col gap-2">
                  <button onClick={handleDuplicate} className="w-full py-1 text-[9px] font-bold text-white bg-black hover:bg-gray-800 rounded shadow-sm">
                    Duplicate
                  </button>
                  <button onClick={() => { deleteElement(presentation.id, activeSlideData.id, selectedEl.id); setSelectedElementId(null); }} className="w-full py-1 text-[9px] font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm">
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-4 text-center text-gray-400 bg-[#fafafa]">
                <div className="w-12 h-12 mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Select any element on the canvas to visually edit its properties here.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. Massive Canvas Area */}
        <div className="flex-1 bg-gray-100 relative flex flex-col overflow-hidden">
          {/* Floating Controls for slide nav */}
          {slideCount > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
              {!isFirstSlide && (
                <button
                  onClick={() => navigateSlide('prev')}
                  className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full transition-colors shadow-md bg-black text-white hover:bg-gray-800 cursor-pointer"
                  title="Previous Slide"
                >
                  ←
                </button>
              )}
              {!isLastSlide && (
                <button
                  onClick={() => navigateSlide('next')}
                  className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full transition-colors shadow-md bg-black text-white hover:bg-gray-800 cursor-pointer"
                  title="Next Slide"
                >
                  →
                </button>
              )}
            </div>
          )}

          {/* Background/Theme Button */}
          <button
            onClick={() => setIsBgModalOpen(true)}
            className="absolute top-3 right-3 z-20 p-2 bg-white/80 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-colors backdrop-blur-sm"
            title="Slide Background & Theme"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" /></svg>
          </button>

          {/* Scrolling Canvas */}
          <div className="w-full h-full overflow-hidden">
            <SlideCanvas
              slide={activeSlideData}
              slideNumber={currentSlide + 1}
              selectedElementId={selectedElementId}
              defaultBackground={presentation.defaultBackground}
              onSelectElement={(id) => {
                setSelectedElementId(id);
                if (id) setIsEditOpen(true);
              }}
              onDoubleClickElement={(el) => { setActiveModalType(el.type as ModalType); setEditingElement(el); }}
              onUpdateElement={(id, updates) => updateElement(presentation.id, activeSlideData.id, id, updates)}
              onDeleteElement={(id) => deleteElement(presentation.id, activeSlideData.id, id)}
            />
          </div>
        </div>

      </div>

      {isEditDetailsOpen && (
        <Modal title="Edit Presentation Details" onClose={() => setIsEditDetailsOpen(false)}>
          <form onSubmit={handleUpdateDetails} className="flex flex-col gap-4">
            <Input label="Title" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <Input label="Thumbnail URL" value={editThumbnail} onChange={(e) => setEditThumbnail(e.target.value)} />
            <Input label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsEditDetailsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      {isDeleteOpen && (
        <Modal title="Are you sure?" onClose={() => setIsDeleteOpen(false)}>
          <p className="text-sm text-gray-600 mb-6">Do you really want to delete this presentation? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsDeleteOpen(false)}>No</Button>
            <Button type="button" variant="danger" onClick={handleDeleteConfirmed}>Yes</Button>
          </div>
        </Modal>
      )}

      {activeModalType === 'text' && <TextModal element={editingElement?.type === 'text' ? editingElement as TextElement : undefined} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement} />}
      {activeModalType === 'image' && <ImageModal element={editingElement?.type === 'image' ? editingElement as ImageElement : undefined} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement} />}
      {activeModalType === 'video' && <VideoModal element={editingElement?.type === 'video' ? editingElement as VideoElement : undefined} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement} />}
      {activeModalType === 'code' && <CodeModal element={editingElement?.type === 'code' ? editingElement as CodeElement : undefined} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement} />}

      {isBgModalOpen && (() => {
        const slideBg = activeSlideData.background;
        const defBg = presentation.defaultBackground;

        const BgEditor = ({ label, bg, onChange, onReset }: { label: string; bg: BackgroundStyle | null; onChange: (b: BackgroundStyle) => void; onReset?: () => void }) => {
          const kind: BackgroundKind = bg?.kind || 'solid';
          const value = bg?.value || '#ffffff';
          return (
            <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
                {onReset && <button type="button" onClick={onReset} className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold">Reset to Default</button>}
              </div>
              <div className="flex gap-1">
                {(['solid', 'gradient', 'image'] as const).map(k => (
                  <button key={k} type="button" onClick={() => onChange({ kind: k, value: k === 'solid' ? '#ffffff' : k === 'gradient' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '' })} className={`flex-1 py-1.5 text-[10px] font-bold border rounded transition-colors ${kind === k ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>
              {kind === 'solid' && (
                <div className="flex gap-2 items-center">
                  <input type="color" value={value} onChange={e => onChange({ kind: 'solid', value: e.target.value })} className="w-10 h-8 p-0.5 rounded cursor-pointer border" />
                  <input type="text" value={value} onChange={e => onChange({ kind: 'solid', value: e.target.value })} className="flex-1 px-2 py-1 text-xs border rounded font-mono" />
                </div>
              )}
              {kind === 'gradient' && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                      'linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)',
                      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    ].map((g, i) => (
                      <button key={i} type="button" onClick={() => onChange({ kind: 'gradient', value: g })} className={`h-8 rounded border-2 transition-all ${value === g ? 'border-blue-500 ring-1 ring-blue-300' : 'border-transparent hover:border-gray-300'}`} style={{ background: g }} />
                    ))}
                  </div>
                  <input type="text" value={value} onChange={e => onChange({ kind: 'gradient', value: e.target.value })} placeholder="linear-gradient(...)" className="w-full px-2 py-1 text-[10px] border rounded font-mono" />
                </div>
              )}
              {kind === 'image' && (
                <div className="flex flex-col gap-2">
                  <input type="text" value={value} onChange={e => onChange({ kind: 'image', value: e.target.value })} placeholder="https://example.com/bg.jpg" className="w-full px-2 py-1.5 text-xs border rounded" />
                  <label className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    Upload Background Image
                    <input type="file" accept="image/*,.gif" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => onChange({ kind: 'image', value: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
              )}
              {/* Preview */}
              <div className="w-full h-12 rounded border border-gray-200 shadow-inner" style={
                kind === 'solid' ? { backgroundColor: value } :
                  kind === 'gradient' ? { background: value } :
                    { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              } />
            </div>
          );
        };

        return (
          <Modal title="Slide Background & Theme" onClose={() => setIsBgModalOpen(false)}>
            <div className="flex flex-col gap-5">
              <BgEditor
                label="This Slide"
                bg={slideBg}
                onChange={async (bg) => {
                  const newSlides = [...presentation.slides];
                  newSlides[currentSlide] = { ...newSlides[currentSlide], background: bg };
                  await updatePresentation(presentation.id, { slides: newSlides });
                }}
                onReset={slideBg ? async () => {
                  const newSlides = [...presentation.slides];
                  newSlides[currentSlide] = { ...newSlides[currentSlide], background: null };
                  await updatePresentation(presentation.id, { slides: newSlides });
                } : undefined}
              />
              <BgEditor
                label="Default (All Slides)"
                bg={defBg}
                onChange={async (bg) => {
                  await updatePresentation(presentation.id, { defaultBackground: bg });
                }}
              />
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setIsBgModalOpen(false)}>Done</Button>
              </div>
            </div>
          </Modal>
        );
      })()}

    </div>
  );
};
