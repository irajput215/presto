import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PresentationCard } from '../components/PresentationCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Dashboard: React.FC = () => {
  const { presentations, isLoading, createPresentation } = useStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPresentation(name, description, thumbnail);
    setIsModalOpen(false);
    
    // Clear out form
    setName('');
    setDescription('');
    setThumbnail('');
    
    // Automatically navigate to it if needed? Actually spec doesn't say auto-navigate on create, 
    // it says "appears on the dashboard". Let's just stay on dashboard.
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
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
            <Input 
              label="Thumbnail URL (optional)" 
              value={thumbnail} 
              onChange={(e) => setThumbnail(e.target.value)} 
              placeholder="https://..."
            />
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
