export type NoticeTone = 'error' | 'success' | 'info';

export type Notice = {
  id: string;
  message: string;
  tone: NoticeTone;
};

export type BackgroundKind = 'solid' | 'gradient' | 'image';

export type BackgroundStyle = {
  kind: BackgroundKind;
  value: string;
};

export type TextElement = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  text: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
};

export type ImageElement = {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  src: string;
  alt: string;
  rotation?: number;
};

export type VideoElement = {
  id: string;
  type: 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  src: string;
  autoplay: boolean;
};

export type CodeLanguage = 'c' | 'python' | 'javascript' | 'latex';
export type CodeTheme = 'vs-dark' | 'monokai' | 'ally-dark' | 'ally-light' | 'solarized';

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
  showFrame?: boolean;
};

export type SlideElement = TextElement | ImageElement | VideoElement | CodeElement;

export type Slide = {
  id: string;
  background: BackgroundStyle | null;
  elements: SlideElement[];
};

export type Presentation = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  slides: Slide[];
  updatedAt: number;
  fontFamily: string;
  defaultBackground: BackgroundStyle;
};

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
