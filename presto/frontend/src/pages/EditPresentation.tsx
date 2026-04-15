import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useError } from '../context/ErrorContext';
import { SlideCanvas } from '../components/SlideCanvas';
import { TextModal, ImageModal, VideoModal, CodeModal } from '../components/ElementModals';
import type { CodeElement, ImageElement, SlideElement, TextElement, VideoElement } from '../types';

type ModalType = 'text' | 'image' | 'video' | 'code' | null;

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
      elements: []
    };
    await updatePresentation(presentation.id, {
      slides: [...presentation.slides, newSlide]
    });
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-gray-50 overflow-hidden">
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
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete Presentation
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col sm:flex-row relative overflow-hidden">
        {/* Unified Left Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-20 shrink-0 shadow-sm overflow-y-auto">
          {/* Add Elements Section */}
          <div className="p-5 border-b border-gray-100 shrink-0">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Add Elements</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="justify-center text-xs py-2" onClick={() => handleOpenElementModal('text')}>Text</Button>
              <Button variant="secondary" className="justify-center text-xs py-2" onClick={() => handleOpenElementModal('image')}>Image</Button>
              <Button variant="secondary" className="justify-center text-xs py-2" onClick={() => handleOpenElementModal('video')}>Video</Button>
              <Button variant="secondary" className="justify-center text-xs py-2 font-mono" onClick={() => handleOpenElementModal('code')}>Code</Button>
            </div>
          </div>

          {/* Properties Section */}
          {selectedElementId ? (() => {
            const el = activeSlideData.elements.find(e => e.id === selectedElementId);
            if (!el) return null;

            const handleDuplicate = async () => {
              const clone = { ...el, id: Date.now().toString(), x: Math.min(el.x + 5, 100), y: Math.min(el.y + 5, 100) };
              await addElement(presentation.id, activeSlideData.id, clone);
            };

            return (
              <div className="p-5 flex-1 bg-blue-50/30 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Properties</h3>
                  <button onClick={() => setSelectedElementId(null)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm border border-gray-200">✖</button>
                </div>

                <div className="bg-white p-4 rounded-md border border-blue-100 shadow-sm text-xs text-gray-700 font-mono grid grid-cols-2 gap-2">
                  <div className="col-span-2 font-bold text-blue-900 border-b border-gray-100 pb-2 mb-1">TYPE: {el.type.toUpperCase()}</div>
                  <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-sans font-semibold">WIDTH</span> {el.width.toFixed(1)}%</div>
                  <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-sans font-semibold">HEIGHT</span> {el.height.toFixed(1)}%</div>
                  <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-sans font-semibold">X POS</span> {el.x.toFixed(1)}%</div>
                  <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-sans font-semibold">Y POS</span> {el.y.toFixed(1)}%</div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="secondary" onClick={() => handleOpenElementModal(el.type as ModalType, el)} className="w-full justify-center text-xs py-2 h-9 bg-white hover:bg-gray-50 border-gray-300">
                    Edit Details
                  </Button>
                  <Button variant="secondary" onClick={handleDuplicate} className="w-full justify-center text-xs py-2 h-9 bg-white hover:bg-gray-50 border-gray-300">
                    Duplicate
                  </Button>
                  <Button variant="danger" onClick={() => { deleteElement(presentation.id, activeSlideData.id, el.id); setSelectedElementId(null); }} className="w-full justify-center text-xs py-2 h-9">
                    Delete
                  </Button>
                </div>
              </div>
            );
          })() : (
            <div className="p-5 flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-sm font-medium text-gray-500">No Selection</p>
              <p className="text-[11px] mt-2 max-w-[180px] leading-relaxed">Click any element on the slide to visually edit its properties here.</p>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 relative flex flex-col overflow-hidden">
          {/* Top Controls Float */}
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <Button variant="secondary" onClick={handleAddSlide} className="shadow-md">
              <span className="mr-1">+</span> Add Slide
            </Button>
            <Button variant="danger" onClick={handleDeleteSlide} className="shadow-md">
              Delete Slide
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 z-20 bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-md shadow-md border border-gray-200">
            Slide {currentSlide + 1} of {slideCount}
          </div>

          {/* Fixed Prev/Next Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            <button
              onClick={() => navigateSlide('prev')}
              disabled={isFirstSlide}
              className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors shadow-md ${isFirstSlide ? 'bg-gray-100 text-gray-300 cursor-not-allowed hidden' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 cursor-pointer'}`}
            >
              ← Previous Slide
            </button>
            <button
              onClick={() => navigateSlide('next')}
              disabled={isLastSlide}
              className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors shadow-md ${isLastSlide ? 'bg-gray-100 text-gray-300 cursor-not-allowed hidden' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 cursor-pointer'}`}
            >
              Next Slide →
            </button>
          </div>

          {/* Scrolling Canvas Container underneath floats */}
          <div className="w-full h-full overflow-auto flex items-center justify-center p-8 pb-24 pt-20">
            <SlideCanvas
              slide={activeSlideData}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onDoubleClickElement={(el) => handleOpenElementModal(el.type as ModalType, el)}
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
    </div>
  );
};
