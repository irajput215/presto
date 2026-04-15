import type { CodeLanguage } from '../types';

type Segment = {
  kind: 'plain' | 'keyword' | 'string' | 'comment';
  value: string;
};

const languageKeywords: Record<CodeLanguage, string[]> = {
  c: ['int', 'char', 'void', 'return', 'if', 'else', 'for', 'while', 'include'],
  python: ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'class'],
  javascript: ['const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'function', 'import', 'export'],
};

export const detectLanguage = (code: string): CodeLanguage => {
  const trimmedCode = code.trim();
  if (trimmedCode.includes('#include') || trimmedCode.includes('printf(')) {
    return 'c';
  }
  if (
    trimmedCode.includes('def ') ||
    trimmedCode.includes('print(') ||
    trimmedCode.includes('import ')
  ) {
    return 'python';
  }
  return 'javascript';
};

const splitWords = (line: string): string[] =>
  line.split(/(\s+|[(){}[\];,.+\-/*=<>!&|:])/).filter((part) => part.length > 0);

const classifyToken = (token: string, language: CodeLanguage): Segment['kind'] => {
  if (token.startsWith('//') || token.startsWith('#')) {
    return 'comment';
  }
  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    return 'string';
  }
  if (languageKeywords[language].includes(token)) {
    return 'keyword';
  }
  return 'plain';
};

export const highlightCode = (code: string, language: CodeLanguage): Segment[][] =>
  code.split('\n').map((line) =>
    splitWords(line).map((token) => ({
      kind: classifyToken(token, language),
      value: token,
    })),
  );
