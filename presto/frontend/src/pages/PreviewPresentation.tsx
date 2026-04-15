import React from 'react';
import { useParams } from 'react-router-dom';

export const PreviewPresentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <h1 className="text-4xl">Previewing Presentation {id}</h1>
        <p className="mt-4 text-gray-400">Full screen slide view will go here.</p>
        <div className="absolute bottom-4 left-4 text-sm text-gray-500">Slide 1</div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="bg-gray-800 p-2 rounded hover:bg-gray-700">←</button>
          <button className="bg-gray-800 p-2 rounded hover:bg-gray-700">→</button>
        </div>
      </div>
    </div>
  );
};
