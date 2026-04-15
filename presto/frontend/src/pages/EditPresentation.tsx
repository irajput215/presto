import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useError } from '../context/ErrorContext';
import { SlideCanvas } from '../components/SlideCanvas';
import type { CodeElement, ImageElement, SlideElement, TextElement, VideoElement } from '../types';
import { detectLanguage, languageNames } from '../lib/syntaxHighlight';

type ModalType = 'text' | 'image' | 'video' | 'code' | null;

/* ── SVG Icon Components ─────────────────────────────── */
const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" /></svg>
);
const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
);
const IconVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
);
const IconCode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
);
const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
);

/* ── Inline Sidebar Edit Forms ───────────────────────── */
const SidebarDimensions = ({ el, onChange }: { el: SlideElement; onChange: (updates: Partial<SlideElement>) => void }) => {
  const field = (label: string, key: 'width' | 'height' | 'x' | 'y', min: number) => (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <input
        type="number" step="any" min={min} max="100"
        value={el[key]}
        onChange={(e) => onChange({ [key]: Number(e.target.value) })}
        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black focus:border-black outline-none"
      />
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2">
      {field('Width %', 'width', 1)}
      {field('Height %', 'height', 1)}
      {field('X %', 'x', 0)}
      {field('Y %', 'y', 0)}
    </div>
  );
};

const SidebarTextFields = ({ el, onChange }: { el: TextElement; onChange: (u: Partial<TextElement>) => void }) => (
  <div className="flex flex-col gap-3">
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Text</label>
      <textarea
        value={el.text} onChange={(e) => onChange({ text: e.target.value })}
        className="w-full min-h-[60px] p-2 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none resize-y"
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Font Size (em)</label>
        <input type="number" step="0.1" value={el.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Color</label>
        <input type="color" value={el.color} onChange={(e) => onChange({ color: e.target.value })}
          className="w-full h-8 p-0.5 rounded cursor-pointer border border-gray-200" />
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
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Image URL</label>
        <input type="text" value={el.src} onChange={(e) => onChange({ src: e.target.value })}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Upload</label>
        <input type="file" accept="image/*" onChange={handleFile} className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700" />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Alt Text</label>
        <input type="text" value={el.alt} onChange={(e) => onChange({ alt: e.target.value })}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
      </div>
    </div>
  );
};

const SidebarVideoFields = ({ el, onChange }: { el: VideoElement; onChange: (u: Partial<VideoElement>) => void }) => (
  <div className="flex flex-col gap-3">
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">YouTube Embed URL</label>
      <input type="text" value={el.src} onChange={(e) => onChange({ src: e.target.value })}
        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
    </div>
    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
      <input type="checkbox" checked={el.autoplay} onChange={(e) => onChange({ autoplay: e.target.checked })}
        className="w-3.5 h-3.5 rounded text-black focus:ring-black" />
      Auto-play
    </label>
  </div>
);

const SidebarCodeFields = ({ el, onChange }: { el: CodeElement; onChange: (u: Partial<CodeElement>) => void }) => {
  const lang = el.code.trim() ? detectLanguage(el.code) : el.language || 'javascript';
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Language</label>
          <div className="px-2 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-700">{languageNames[lang]}</div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Font Size (em)</label>
          <input type="number" step="0.1" value={el.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Code</label>
        <textarea
          value={el.code}
          onChange={(e) => {
            const newCode = e.target.value;
            const detectedLang = newCode.trim() ? detectLanguage(newCode) : el.language;
            onChange({ code: newCode, language: detectedLang });
          }}
          spellCheck={false}
          className="w-full min-h-[80px] p-2 text-xs border border-gray-200 rounded bg-white focus:ring-1 focus:ring-black outline-none resize-y font-mono whitespace-pre"
        />
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────── */
export const EditPresentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { presentations, updatePresentation, deletePresentation, addElement, updateElement, deleteElement } = useStore();
  const { showError } = useError();

  const presentation = presentations.find((p) => p.id === id);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeModalType, setActiveModalType] = useState<ModalType>(null);
  const [editingElement, setEditingElement] = useState<SlideElement | null>(null);

  const [editName, setEditName] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editDescription, setEditDescription] = useState('');

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
      await updatePresentation(presentation.id, { name: editName, thumbnail: editThumbnail, description: editDescription });
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
    const newSlide = { id: Date.now().toString(), background: null, elements: [] };
    await updatePresentation(presentation.id, { slides: [...presentation.slides, newSlide] });
  };

  const handleDeleteSlide = async () => {
    if (slideCount === 1) {
      showError("Cannot delete the only slide! Please delete the presentation instead.");
      return;
    }
    const updatedSlides = presentation.slides.filter((_, index) => index !== currentSlide);
    await updatePresentation(presentation.id, { slides: updatedSlides });
    if (currentSlide === slideCount - 1) setCurrentSlide(currentSlide - 1);
  };

  const handleOpenElementModal = (type: ModalType, el: SlideElement | null = null) => {
    setEditingElement(el);
    setActiveModalType(type);
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
        await addElement(presentation.id, activeSlideData.id, el);
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
      await updateElement(presentation.id, activeSlideData.id, selectedEl.id, { ...selectedEl, ...updates } as SlideElement);
    } catch {
      showError("Failed to update element");
    }
  };

  const handleDuplicate = async () => {
    if (!selectedEl) return;
    const clone = { ...selectedEl, id: Date.now().toString(), x: Math.min(selectedEl.x + 5, 95), y: Math.min(selectedEl.y + 5, 95) };
    await addElement(presentation.id, activeSlideData.id, clone);
  };

  const toolButtons = [
    { type: 'text' as ModalType, icon: <IconText />,  label: 'Text' },
    { type: 'image' as ModalType, icon: <IconImage />, label: 'Image' },
    { type: 'video' as ModalType, icon: <IconVideo />, label: 'Video' },
    { type: 'code' as ModalType, icon: <IconCode />,  label: 'Code' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-neutral-100 overflow-hidden">
      {/* ── Header ─────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
            ← Back
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900 truncate max-w-xs">{presentation.name}</h1>
          <button onClick={handleOpenDetailsModal} className="text-[10px] text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors">Edit</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddSlide} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            + Slide
          </button>
          <button onClick={handleDeleteSlide} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            Delete Slide
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <button onClick={() => setIsDeleteOpen(true)} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
            Delete Presentation
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Toolbar ─────────────────────────── */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center pt-4 gap-1 shrink-0">
          {toolButtons.map(tb => (
            <button
              key={tb.label}
              title={`Add ${tb.label}`}
              onClick={() => handleOpenElementModal(tb.type)}
              className="flex flex-col items-center gap-0.5 w-12 py-2 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
            >
              {tb.icon}
              <span className="text-[9px] font-medium">{tb.label}</span>
            </button>
          ))}
        </div>

        {/* ── Canvas Area ──────────────────────────── */}
        <div className="flex-1 relative flex items-center justify-center bg-neutral-100 overflow-hidden">
          {/* Slide number pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full shadow border border-gray-200">
            {currentSlide + 1} / {slideCount}
          </div>

          {/* Previous arrow */}
          <button
            onClick={() => navigateSlide('prev')}
            disabled={isFirstSlide}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isFirstSlide ? 'opacity-0 pointer-events-none' : 'bg-black text-white shadow-lg hover:bg-gray-800 cursor-pointer'
            }`}
            aria-label="Previous slide"
          >
            <IconArrowLeft />
          </button>

          {/* Next arrow */}
          <button
            onClick={() => navigateSlide('next')}
            disabled={isLastSlide}
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isLastSlide ? 'opacity-0 pointer-events-none' : 'bg-black text-white shadow-lg hover:bg-gray-800 cursor-pointer'
            }`}
            aria-label="Next slide"
          >
            <IconArrowRight />
          </button>

          {/* Canvas itself – takes most of the space */}
          <div className="w-[calc(100%-80px)] max-h-[calc(100%-40px)] aspect-[16/9]">
            <SlideCanvas
              slide={activeSlideData}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onDoubleClickElement={(el) => handleOpenElementModal(el.type as ModalType, el)}
              onUpdateElement={(elId, updates) => updateElement(presentation.id, activeSlideData.id, elId, updates)}
              onDeleteElement={(elId) => deleteElement(presentation.id, activeSlideData.id, elId)}
            />
          </div>
        </div>

        {/* ── Right Sidebar (inline edit) ──────────── */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          {selectedEl ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{selectedEl.type}</span>
                <button onClick={() => setSelectedElementId(null)} className="text-gray-400 hover:text-black text-xs transition-colors">✕</button>
              </div>

              {/* Position & size */}
              <div className="px-4 py-3 border-b border-gray-100">
                <SidebarDimensions el={selectedEl} onChange={handleInlineUpdate} />
              </div>

              {/* Type-specific fields */}
              <div className="px-4 py-3 border-b border-gray-100 flex-1 overflow-y-auto">
                {selectedEl.type === 'text' && <SidebarTextFields el={selectedEl} onChange={handleInlineUpdate} />}
                {selectedEl.type === 'image' && <SidebarImageFields el={selectedEl} onChange={handleInlineUpdate} />}
                {selectedEl.type === 'video' && <SidebarVideoFields el={selectedEl} onChange={handleInlineUpdate} />}
                {selectedEl.type === 'code' && <SidebarCodeFields el={selectedEl} onChange={handleInlineUpdate} />}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 flex flex-col gap-2 border-t border-gray-100 mt-auto">
                <button onClick={handleDuplicate} className="w-full py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                  Duplicate
                </button>
                <button onClick={() => { deleteElement(presentation.id, activeSlideData.id, selectedEl.id); setSelectedElementId(null); }}
                  className="w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center text-gray-400">
              <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-xs font-medium text-gray-500">No element selected</p>
              <p className="text-[10px] mt-1 leading-relaxed max-w-[160px]">Click an element on the slide to edit its properties here.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals (kept for initial creation only) ── */}
      {isEditDetailsOpen && (
        <Modal title="Edit Presentation Details" onClose={() => setIsEditDetailsOpen(false)}>
          <form onSubmit={handleUpdateDetails} className="flex flex-col gap-4">
            <Input label="Title" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <Input label="Thumbnail URL" value={editThumbnail} onChange={(e) => setEditThumbnail(e.target.value)} />
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

      {activeModalType === 'text' && (
        <Modal title={editingElement ? "Edit Text" : "Add Text"} onClose={() => { setActiveModalType(null); setEditingElement(null); }}>
          <TextCreateForm element={editingElement?.type === 'text' ? editingElement as TextElement : undefined} onSave={handleSaveElement} onClose={() => { setActiveModalType(null); setEditingElement(null); }} />
        </Modal>
      )}
      {activeModalType === 'image' && (
        <Modal title={editingElement ? "Edit Image" : "Add Image"} onClose={() => { setActiveModalType(null); setEditingElement(null); }}>
          <ImageCreateForm element={editingElement?.type === 'image' ? editingElement as ImageElement : undefined} onSave={handleSaveElement} onClose={() => { setActiveModalType(null); setEditingElement(null); }} />
        </Modal>
      )}
      {activeModalType === 'video' && (
        <Modal title={editingElement ? "Edit Video" : "Add Video"} onClose={() => { setActiveModalType(null); setEditingElement(null); }}>
          <VideoCreateForm element={editingElement?.type === 'video' ? editingElement as VideoElement : undefined} onSave={handleSaveElement} onClose={() => { setActiveModalType(null); setEditingElement(null); }} />
        </Modal>
      )}
      {activeModalType === 'code' && (
        <Modal title={editingElement ? "Edit Code" : "Add Code"} onClose={() => { setActiveModalType(null); setEditingElement(null); }}>
          <CodeCreateForm element={editingElement?.type === 'code' ? editingElement as CodeElement : undefined} onSave={handleSaveElement} onClose={() => { setActiveModalType(null); setEditingElement(null); }} />
        </Modal>
      )}
    </div>
  );
};

/* ── Creation Forms (used inside Modals for new elements) ── */
const DimInputs = ({ w, h, x, y, setW, setH, setX, setY, isEdit }: { w: number; h: number; x: number; y: number; setW: (v: number) => void; setH: (v: number) => void; setX: (v: number) => void; setY: (v: number) => void; isEdit: boolean }) => (
  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
    <div><label className="block text-[10px] font-semibold text-gray-500 mb-1">Width %</label><input type="number" step="any" min="1" max="100" value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black" required /></div>
    <div><label className="block text-[10px] font-semibold text-gray-500 mb-1">Height %</label><input type="number" step="any" min="1" max="100" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black" required /></div>
    {isEdit && <>
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1">X %</label><input type="number" step="any" min="0" max="100" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black" required /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1">Y %</label><input type="number" step="any" min="0" max="100" value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black" required /></div>
    </>}
  </div>
);

const TextCreateForm = ({ element, onSave, onClose }: { element?: TextElement; onSave: (el: TextElement) => void; onClose: () => void }) => {
  const [text, setText] = useState(element?.text || '');
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  const [color, setColor] = useState(element?.color || '#000000');
  const [w, setW] = useState(element?.width || 30);
  const [h, setH] = useState(element?.height || 20);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ id: element?.id || Date.now().toString(), type: 'text', layer: element?.layer || 0, width: w, height: h, x, y, text, fontSize, color }); }} className="flex flex-col gap-3">
      <DimInputs w={w} h={h} x={x} y={y} setW={setW} setH={setH} setX={setX} setY={setY} isEdit={!!element} />
      <textarea value={text} onChange={(e) => setText(e.target.value)} required className="w-full min-h-[80px] p-2 text-sm border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black resize-y" placeholder="Enter text..." />
      <div className="flex gap-3">
        <Input label="Font Size (em)" type="number" step="0.1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} required />
        <div className="flex flex-col gap-1 w-full"><label className="text-xs font-medium text-gray-700">Color</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-9 p-0.5 rounded cursor-pointer" /></div>
      </div>
      <div className="flex gap-2 justify-end mt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
    </form>
  );
};

const ImageCreateForm = ({ element, onSave, onClose }: { element?: ImageElement; onSave: (el: ImageElement) => void; onClose: () => void }) => {
  const [src, setSrc] = useState(element?.src || '');
  const [alt, setAlt] = useState(element?.alt || '');
  const [w, setW] = useState(element?.width || 30);
  const [h, setH] = useState(element?.height || 30);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => setSrc(r.result as string); r.readAsDataURL(file); } };
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ id: element?.id || Date.now().toString(), type: 'image', layer: element?.layer || 0, width: w, height: h, x, y, src, alt }); }} className="flex flex-col gap-3">
      <DimInputs w={w} h={h} x={x} y={y} setW={setW} setH={setH} setX={setX} setY={setY} isEdit={!!element} />
      <Input label="Image URL" value={src} onChange={(e) => setSrc(e.target.value)} required />
      <div><label className="text-xs font-medium text-gray-700">Or upload</label><input type="file" accept="image/*" onChange={handleFile} className="text-xs mt-1" /></div>
      <Input label="Alt Text" value={alt} onChange={(e) => setAlt(e.target.value)} required />
      <div className="flex gap-2 justify-end mt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
    </form>
  );
};

const VideoCreateForm = ({ element, onSave, onClose }: { element?: VideoElement; onSave: (el: VideoElement) => void; onClose: () => void }) => {
  const [src, setSrc] = useState(element?.src || '');
  const [autoplay, setAutoplay] = useState(element?.autoplay || false);
  const [w, setW] = useState(element?.width || 40);
  const [h, setH] = useState(element?.height || 30);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);
  return (
    <form onSubmit={(e) => { e.preventDefault(); let finalSrc = src; if (finalSrc.includes('youtube.com/watch?v=')) finalSrc = finalSrc.replace('watch?v=', 'embed/'); onSave({ id: element?.id || Date.now().toString(), type: 'video', layer: element?.layer || 0, width: w, height: h, x, y, src: finalSrc, autoplay }); }} className="flex flex-col gap-3">
      <DimInputs w={w} h={h} x={x} y={y} setW={setW} setH={setH} setX={setX} setY={setY} isEdit={!!element} />
      <Input label="YouTube Embed URL" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://www.youtube.com/embed/..." required />
      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"><input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="w-3.5 h-3.5" /> Auto-play</label>
      <div className="flex gap-2 justify-end mt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
    </form>
  );
};

const CodeCreateForm = ({ element, onSave, onClose }: { element?: CodeElement; onSave: (el: CodeElement) => void; onClose: () => void }) => {
  const [code, setCode] = useState(element?.code || '');
  const [fontSize, setFontSize] = useState(element?.fontSize || 1);
  const [w, setW] = useState(element?.width || 35);
  const [h, setH] = useState(element?.height || 25);
  const [x, setX] = useState(element?.x || 0);
  const [y, setY] = useState(element?.y || 0);
  const lang = code.trim() ? detectLanguage(code) : element?.language || 'javascript';
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ id: element?.id || Date.now().toString(), type: 'code', layer: element?.layer || 0, width: w, height: h, x, y, code, language: lang, fontSize }); }} className="flex flex-col gap-3">
      <DimInputs w={w} h={h} x={x} y={y} setW={setW} setH={setH} setX={setX} setY={setY} isEdit={!!element} />
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 w-full"><span className="text-xs font-medium text-gray-700">Language</span><div className="px-2 py-1.5 text-xs border border-gray-300 rounded bg-gray-50">{languageNames[lang]}</div></div>
        <Input label="Font Size (em)" type="number" step="0.1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} required />
      </div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} required spellCheck={false} className="w-full min-h-[100px] p-2 text-xs border border-gray-300 rounded outline-none focus:ring-1 focus:ring-black resize-y font-mono whitespace-pre bg-gray-50" placeholder="def hello():&#10;  print('Hello')" />
      <div className="flex gap-2 justify-end mt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
    </form>
  );
};
