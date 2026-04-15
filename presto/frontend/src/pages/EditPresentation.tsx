import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useError } from '../context/ErrorContext';
import { SlideCanvas } from '../components/SlideCanvas';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { CodeElement, ImageElement, SlideElement, TextElement, VideoElement, CodeLanguage } from '../types';

/* ── SVG Icons ───────────────────────────────────────── */
const IconText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" /></svg>;
const IconImage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>;
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
const IconCode = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;

/* ── Inline Editor Forms ─────────────────────────────── */
const SidebarDimensions = ({ el, onChange }: { el: SlideElement; onChange: (u: Partial<SlideElement>) => void }) => {
  const field = (lbl: string, key: 'width'|'height'|'x'|'y', min: number) => (
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
      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Size (em)</label><input type="number" step="0.1" value={el.fontSize} onChange={e => onChange({ fontSize: Number(e.target.value) })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Color</label><input type="color" value={el.color} onChange={e => onChange({ color: e.target.value })} className="w-full h-6 p-0.5 rounded cursor-pointer border" /></div>
    </div>
  </div>
);

const SidebarImageFields = ({ el, onChange }: { el: ImageElement; onChange: (u: Partial<ImageElement>) => void }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => onChange({ src: reader.result as string }); reader.readAsDataURL(file); } };
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">URL</label><input type="text" value={el.src} onChange={e => onChange({ src: e.target.value })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" /></div>
      <div className="w-full overflow-hidden"><label className="block text-[10px] font-semibold text-gray-500 uppercase">Upload</label><input type="file" accept="image/*" onChange={handleFile} className="w-full text-[10px] file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[9px] file:bg-gray-100" /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Alt Text</label><input type="text" value={el.alt} onChange={e => onChange({ alt: e.target.value })} className="w-full px-1.5 py-1 text-xs border rounded outline-none" /></div>
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
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase">Size</label><input type="number" step="0.1" value={el.fontSize} onChange={e => onChange({ fontSize: Number(e.target.value) })} className="w-full px-1.5 py-1 text-[11px] border rounded" /></div>
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
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

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

  const handleAddElementFlow = async (type: string) => {
    let base: any = { id: Date.now().toString(), type, layer: 0, x: 0, y: 0 };
    if (type === 'text') { base = { ...base, width: 30, height: 20, text: 'New Text', fontSize: 1.5, color: '#000000' }; }
    else if (type === 'image') { base = { ...base, width: 30, height: 30, src: '', alt: 'Image' }; }
    else if (type === 'video') { base = { ...base, width: 40, height: 30, src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', autoplay: false }; }
    else if (type === 'code') { base = { ...base, width: 35, height: 25, code: 'print("Hello")', language: 'python', fontSize: 1 }; }

    try {
      await addElement(presentation.id, activeSlideData.id, base);
      setSelectedElementId(base.id);
    } catch {
      showError("Failed to add element");
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
    const clone = { ...selectedEl, id: Date.now().toString(), x: Math.min(selectedEl.x + 5, 95), y: Math.min(selectedEl.y + 5, 95) };
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
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 leading-tight truncate max-w-md">
              {presentation.name}
            </h1>
          </div>
          <button
            onClick={handleOpenDetailsModal}
            className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-wider bg-gray-100 px-2 py-1 rounded"
          >
            Edit Title/Thumbnail
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleAddSlide}>
            <span className="mr-1">+</span> Add Slide
          </Button>
          <Button variant="danger" onClick={handleDeleteSlide}>
            Delete Slide
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Presentation
          </Button>
        </div>
      </header>
      
      {/* ── LOWER SECTION ───────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. Thin Left Icon Bar (Add Element Bar only) */}
        <div className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-30 shrink-0 gap-3">
          <button title="Add Text" onClick={() => handleAddElementFlow('text')} className="w-10 h-10 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50 transition-colors"><IconText /></button>
          <button title="Add Image" onClick={() => handleAddElementFlow('image')} className="w-10 h-10 flex items-center justify-center rounded text-green-600 hover:bg-green-50 transition-colors"><IconImage /></button>
          <button title="Add Video" onClick={() => handleAddElementFlow('video')} className="w-10 h-10 flex items-center justify-center rounded text-purple-600 hover:bg-purple-50 transition-colors"><IconVideo /></button>
          <button title="Add Code" onClick={() => handleAddElementFlow('code')} className="w-10 h-10 flex items-center justify-center rounded text-orange-600 hover:bg-orange-50 transition-colors"><IconCode /></button>
        </div>

        {/* 2. Thin Edit Side Bar (Inline Edit Bar next to Icon Bar) */}
        <div className="w-[180px] bg-[#fafafa] border-r border-gray-200 flex flex-col z-20 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)] overflow-y-auto">
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

          {/* Scrolling Canvas */}
          <div className="w-full h-full overflow-hidden flex items-center justify-center p-2 bg-[#e8eaed]">
            <SlideCanvas
              slide={activeSlideData}
              slideNumber={currentSlide + 1}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onDoubleClickElement={() => {}}
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

    </div>
  );
};
