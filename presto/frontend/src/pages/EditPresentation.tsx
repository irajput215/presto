import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useError } from '../context/ErrorContext';
import { SlideCanvas } from '../components/SlideCanvas';
import { TextModal, ImageModal, VideoModal, CodeModal } from '../components/ElementModals';
import type { SlideElement } from '../types';

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

  const [editName, setEditName] = useState(presentation?.name || '');
  const [editThumbnail, setEditThumbnail] = useState(presentation?.thumbnail || '');
  const [editDescription, setEditDescription] = useState(presentation?.description || '');

  useEffect(() => {
    if (presentation) {
      setEditName(presentation.name);
      setEditThumbnail(presentation.thumbnail);
      setEditDescription(presentation.description);
    }
  }, [presentation]);

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
            onClick={() => setIsEditDetailsOpen(true)}
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
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-10 shrink-0">
          <button title="Add Text" className="p-2 hover:bg-gray-100 rounded text-gray-600 font-bold" onClick={() => handleOpenElementModal('text')}>T</button>
          <button title="Add Image" className="p-2 hover:bg-gray-100 rounded text-gray-600 font-bold" onClick={() => handleOpenElementModal('image')}>Img</button>
          <button title="Add Video" className="p-2 hover:bg-gray-100 rounded text-gray-600 font-bold" onClick={() => handleOpenElementModal('video')}>Vid</button>
          <button title="Add Code" className="p-2 hover:bg-gray-100 rounded text-gray-600 font-semibold font-mono" onClick={() => handleOpenElementModal('code')}>{'<>'}</button>
        </div>

        <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 bg-gray-100 relative">
          <div className="absolute top-4 flex gap-2">
            <Button variant="secondary" onClick={handleAddSlide}>+ Add Slide</Button>
            <Button variant="danger" onClick={handleDeleteSlide}>Delete Slide</Button>
          </div>

          <div className="w-full flex justify-center drop-shadow-md">
            <SlideCanvas 
              slide={activeSlideData}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onDoubleClickElement={(el) => handleOpenElementModal(el.type as ModalType, el)}
              onUpdateElement={(id, updates) => updateElement(presentation.id, activeSlideData.id, id, updates)}
              onDeleteElement={(id) => deleteElement(presentation.id, activeSlideData.id, id)}
            />
          </div>

          <div className="absolute bottom-4 left-4 bg-white text-gray-800 text-sm font-bold px-3 py-1.5 rounded shadow-sm border border-gray-200">
            Slide {currentSlide + 1}
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => navigateSlide('prev')}
              disabled={isFirstSlide}
              className={`p-2 rounded transition-colors shadow-sm ${
                isFirstSlide ? 'bg-gray-100 text-gray-300 cursor-not-allowed hidden' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 cursor-pointer'
              }`}
            >
              ← Prev
            </button>
            <button
              onClick={() => navigateSlide('next')}
              disabled={isLastSlide}
              className={`p-2 rounded transition-colors shadow-sm ${
                isLastSlide ? 'bg-gray-100 text-gray-300 cursor-not-allowed hidden' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 cursor-pointer'
              }`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Dynamic Right Sidebar Properties Panel */}
        {selectedElementId && (
          <div className="w-64 bg-white border-l border-gray-200 flex flex-col items-start py-6 px-5 gap-4 z-10 shrink-0 shadow-sm">
            <div className="w-full border-b border-gray-100 pb-3 mb-2 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Element Details</h3>
              <button onClick={() => setSelectedElementId(null)} className="text-gray-400 hover:text-black">✖</button>
            </div>
            
            {(() => {
              const el = activeSlideData.elements.find(e => e.id === selectedElementId);
              if (!el) return null;
              
              const handleDuplicate = async () => {
                const clone = { ...el, id: Date.now().toString(), x: Math.min(el.x + 5, 100), y: Math.min(el.y + 5, 100) };
                await addElement(presentation.id, activeSlideData.id, clone);
              };

              return (
                <div className="flex flex-col gap-3 w-full">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-700 font-mono flex flex-col gap-1">
                    <span className="font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-1">TYPE: {el.type.toUpperCase()}</span>
                    <span>W: {el.width.toFixed(1)}%</span>
                    <span>H: {el.height.toFixed(1)}%</span>
                    <span>X: {el.x.toFixed(1)}%</span>
                    <span>Y: {el.y.toFixed(1)}%</span>
                  </div>

                  <hr className="my-2 border-gray-100" />
                  
                  <Button variant="secondary" onClick={() => handleOpenElementModal(el.type as ModalType, el)} className="w-full justify-center text-xs py-2">
                    ✏️ Edit Object
                  </Button>
                  <Button variant="secondary" onClick={handleDuplicate} className="w-full justify-center text-xs py-2">
                    📋 Duplicate
                  </Button>
                  <Button variant="danger" onClick={() => { deleteElement(presentation.id, activeSlideData.id, el.id); setSelectedElementId(null); }} className="w-full justify-center text-xs py-2">
                    🗑️ Delete Element
                  </Button>
                </div>
              );
            })()}
          </div>
        )}

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

      {activeModalType === 'text' && <TextModal element={editingElement as any} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement as any} />}
      {activeModalType === 'image' && <ImageModal element={editingElement as any} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement as any} />}
      {activeModalType === 'video' && <VideoModal element={editingElement as any} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement as any} />}
      {activeModalType === 'code' && <CodeModal element={editingElement as any} onClose={() => { setActiveModalType(null); setEditingElement(null); }} onSave={handleSaveElement as any} />}
    </div>
  );
};
