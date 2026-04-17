// React utilities
import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Shared utilities and contexts
import { apiCall } from '../api/api';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';
import type { Presentation, StorePayload, Slide, SlideElement } from '../types';

/** Interface for the centralized global store context */
interface StoreContextType {
  presentations: Presentation[];
  isLoading: boolean;
  createPresentation: (name: string, description: string, thumbnail: string) => Promise<string>;
  updatePresentation: (id: string, updates: Partial<Presentation>) => Promise<void>;
  deletePresentation: (id: string) => Promise<void>;
  addElement: (presentationId: string, slideId: string, element: SlideElement) => Promise<void>;
  updateElement: (presentationId: string, slideId: string, elementId: string, updates: Partial<SlideElement>) => Promise<void>;
  deleteElement: (presentationId: string, slideId: string, elementId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/* ── HELPERS ────────────────────────────────────────── */

/** Generates a fresh blank slide template */
const createEmptySlide = (): Slide => ({
  id: uuidv4(),
  background: null,
  elements: [],
});

/** Throttle duration to prevent history bloating (1 minute) */
const HISTORY_INTERVAL_MS = 60 * 1000;

/** Deep clones slide array for snapshotting */
const cloneSlides = (slides: Slide[]): Slide[] =>
  JSON.parse(JSON.stringify(slides)) as Slide[];

/** Injects a new undo-point if enough time has passed since the last one */
const withRevisionSnapshot = (presentation: Presentation): Presentation => {
  const now = Date.now();
  const history = presentation.history || [];
  const latestSnapshot = history[0];

  if (latestSnapshot && now - latestSnapshot.savedAt < HISTORY_INTERVAL_MS) {
    return presentation;
  }

  return {
    ...presentation,
    history: [
      {
        id: uuidv4(),
        savedAt: now,
        slides: cloneSlides(presentation.slides),
        defaultBackground: { ...presentation.defaultBackground },
      },
      ...history,
    ],
  };
};

/* ── PROVIDER ────────────────────────────────────────── */

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Global State
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Context bridges
  const { token } = useAuth();
  const { showError } = useError();

  /** Initial load of the shared remote store object */
  const fetchStore = useCallback(async () => {
    if (!token) {
      setPresentations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiCall('/store', 'GET', null, token);
      const payload: StorePayload = data.store && Object.keys(data.store).length > 0 
        ? data.store 
        : { presentations: [] };
      
      setPresentations(payload.presentations || []);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch store');
    } finally {
      setIsLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  /** Persists current presentation array to the remote /store endpoint */
  const saveStore = async (newPresentations: Presentation[]) => {
    if (!token) return;
    try {
      const payload: StorePayload = { presentations: newPresentations };
      await apiCall('/store', 'PUT', { store: payload }, token);
      setPresentations(newPresentations);
    } catch (err: any) {
      showError(err.message || 'Failed to save store updates');
      throw err;
    }
  };

  /* ── ACTIONS ────────────────────────────────────────── */

  /** Inserts a new deck at the start of the list */
  const createPresentation = async (name: string, description: string, thumbnail: string) => {
    const newPresentation: Presentation = {
      id: uuidv4(),
      name,
      description,
      thumbnail,
      slides: [createEmptySlide()],
      updatedAt: Date.now(),
      fontFamily: 'Georgia, serif',
      defaultBackground: { kind: 'solid', value: '#ffffff' },
      history: [],
    };

    const newPresentations = [newPresentation, ...presentations];
    await saveStore(newPresentations);
    return newPresentation.id;
  };

  /** Updates attributes or slides of an existing deck */
  const updatePresentation = async (id: string, updates: Partial<Presentation>) => {
    const newPresentations = presentations.map((p) =>
      p.id === id ? { ...withRevisionSnapshot(p), ...updates, updatedAt: Date.now() } : p
    );
    await saveStore(newPresentations);
  };

  /** Removes a deck entirely from the remote persistent store */
  const deletePresentation = async (id: string) => {
    const newPresentations = presentations.filter((p) => p.id !== id);
    await saveStore(newPresentations);
  };

  /** Injected helper for adding a single element into a specific slide */
  const addElement = async (presentationId: string, slideId: string, element: SlideElement) => {
    const newPresentations = presentations.map(p => {
      if (p.id !== presentationId) return p;
      const presentationWithHistory = withRevisionSnapshot(p);
      return {
        ...presentationWithHistory,
        updatedAt: Date.now(),
        slides: presentationWithHistory.slides.map(s => {
          if (s.id !== slideId) return s;
          const nextLayer = s.elements.reduce((max, el) => Math.max(max, el.layer), 0) + 1;
          const newElement = { ...element, layer: nextLayer };
          return { ...s, elements: [...s.elements, newElement] };
        })
      };
    });
    await saveStore(newPresentations);
  };

  /** Modifies existing element properties by ID */
  const updateElement = async (presentationId: string, slideId: string, elementId: string, updates: Partial<SlideElement>) => {
    const newPresentations = presentations.map(p => {
      if (p.id !== presentationId) return p;
      const presentationWithHistory = withRevisionSnapshot(p);
      return {
        ...presentationWithHistory,
        updatedAt: Date.now(),
        slides: presentationWithHistory.slides.map(s => {
          if (s.id !== slideId) return s;
          return {
            ...s,
            elements: s.elements.map(el => el.id === elementId ? { ...el, ...updates } as SlideElement : el)
          };
        })
      };
    });
    await saveStore(newPresentations);
  };

  /** Removes a single element from a slide's array */
  const deleteElement = async (presentationId: string, slideId: string, elementId: string) => {
    const newPresentations = presentations.map(p => {
      if (p.id !== presentationId) return p;
      const presentationWithHistory = withRevisionSnapshot(p);
      return {
        ...presentationWithHistory,
        updatedAt: Date.now(),
        slides: presentationWithHistory.slides.map(s => {
          if (s.id !== slideId) return s;
          return { ...s, elements: s.elements.filter(el => el.id !== elementId) };
        })
      };
    });
    await saveStore(newPresentations);
  };

  return (
    <StoreContext.Provider
      value={{
        presentations,
        isLoading,
        createPresentation,
        updatePresentation,
        deletePresentation,
        addElement,
        updateElement,
        deleteElement
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// Convenience hook for accessing the presentation store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
