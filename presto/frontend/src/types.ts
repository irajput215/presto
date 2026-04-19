// --- UI and Feedback ---
export type NoticeTone = 'error' | 'success' | 'info';

export type Notice = {
  id: string;
  message: string;
  tone: NoticeTone;
};

// --- Background Styling ---
export type BackgroundKind = 'solid' | 'gradient' | 'image';

export type BackgroundStyle = {
  kind: BackgroundKind;
  value: string;
};

// --- Slide Elements ---

/** Represents a text block on a slide */
export type TextElement = {
  id: string;
  type: 'text';
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  width: number;
  height: number;
  layer: number;
  text: string;
  fontSize: number; // In em
  color: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
};

/** Represents an image block on a slide */
export type ImageElement = {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  src: string; // URL or Base64
  alt: string;
  rotation?: number; // In degrees
};

/** Represents a video block on a slide */
export type VideoElement = {
  id: string;
  type: 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  src: string; // YouTube URL
  autoplay: boolean;
};

// Code element languages and themes
export type CodeLanguage = 'c' | 'python' | 'javascript' | 'latex';
export type CodeTheme = 'vs-dark' | 'monokai' | 'ally-dark' | 'ally-light' | 'solarized';

/** Represents a code snippet area on a slide */
export type CodeElement = {
  id: string;
  type: 'code';
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  code: string;
  fontSize: number;
  language: CodeLanguage;
  theme?: CodeTheme;
  showLineNumbers?: boolean;
  showFrame?: boolean; // MacOS-like window frame
};

// Union type for all elements that can exist on a slide
export type SlideElement = TextElement | ImageElement | VideoElement | CodeElement;

// --- Presentation Structure ---

/** A single slide containing elements and background */
export type Slide = {
  id: string;
  background: BackgroundStyle | null;
  elements: SlideElement[];
};

/** History entry for version control/undo */
export type PresentationHistoryEntry = {
  id: string;
  savedAt: number;
  slides: Slide[];
  defaultBackground: BackgroundStyle;
};

/** The full presentation data model */
export type Presentation = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  slides: Slide[];
  updatedAt: number;
  fontFamily: string;
  defaultBackground: BackgroundStyle;
  history?: PresentationHistoryEntry[];
};

// --- Authentication and Backend ---

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  presentations: Presentation[];
};

export type Session = {
  token: string;
  userId: string;
};

export type AppDatabase = {
  users: UserAccount[];
  session: Session | null;
};

// --- Drafts and Payloads ---

export type PresentationDraft = {
  name: string;
  description: string;
  thumbnail: string;
};

export type ElementDraft =
  | {
    type: 'text';
    width: number;
    height: number;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
  }
  | {
    type: 'image';
    width: number;
    height: number;
    x: number;
    y: number;
    src: string;
    alt: string;
    rotation?: number;
  }
  | {
    type: 'video';
    width: number;
    height: number;
    x: number;
    y: number;
    src: string;
    autoplay: boolean;
  }
  | {
    type: 'code';
    width: number;
    height: number;
    x: number;
    y: number;
    code: string;
    fontSize: number;
    language: CodeLanguage;
    theme?: CodeTheme;
    showLineNumbers?: boolean;
    showFrame?: boolean;
  };

export type StorePayload = {
  presentations: Presentation[];
};