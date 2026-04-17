import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { PresentationCard } from '../components/PresentationCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

type ThumbnailMode = 'auto' | 'url' | 'upload';

export const Dashboard: React.FC = () => {
  const { presentations, isLoading, createPresentation } = useStore();
  const { userName } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating a new deck.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailMode>('auto');

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store uploaded thumbnail as a data URL.
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    // Empty thumbnail means the card will use first-slide preview.
    e.preventDefault();
    if (!name.trim()) return;

    await createPresentation(name, description, thumbnailMode === 'auto' ? '' : thumbnail);
    setIsModalOpen(false);
    
    // Clear out form
    setName('');
    setDescription('');
    setThumbnail('');
    setThumbnailMode('auto');
    
    // Stay on dashboard so the new card is visible.
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600 mb-1">
            {userName ? `Welcome, ${userName}` : 'Welcome'}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Presentations</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all your slide decks</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          New presentation
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-gray-500 text-sm">
          Loading presentations...
        </div>
      ) : presentations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-gray-100 rounded shadow-sm text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No presentations yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first presentation to get started.</p>
          <Button onClick={() => setIsModalOpen(true)}>Create one now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {presentations.map((presentation) => (
            <PresentationCard 
              key={presentation.id} 
              presentation={presentation} 
              onClick={() => navigate(`/presentation/${presentation.id}`)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal title="Create new presentation" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input 
              label="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
            <Input 
              label="Description (optional)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Thumbnail</span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['auto', 'First slide'],
                  ['url', 'Image URL'],
                  ['upload', 'Upload'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setThumbnailMode(mode);
                      setThumbnail('');
                    }}
                    className={`rounded border px-2 py-2 text-xs font-semibold transition-colors ${
                      thumbnailMode === mode
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {thumbnailMode === 'auto' && (
                <p className="rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  The dashboard card will use a live mini-preview of the first slide.
                </p>
              )}

              {thumbnailMode === 'url' && (
                <Input
                  label="Thumbnail URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                />
              )}

              {thumbnailMode === 'upload' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Thumbnail image file</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt="Uploaded thumbnail preview"
                      className="h-24 w-full rounded border border-gray-200 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
