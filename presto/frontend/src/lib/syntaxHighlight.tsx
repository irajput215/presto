import type { CodeLanguage } from '../types';

type Segment = {
  kind: 'plain' | 'keyword' | 'string' | 'comment' | 'number';
  value: string;
};

const languageKeywords: Record<CodeLanguage, string[]> = {
  c: ['break', 'case', 'char', 'const', 'continue', 'double', 'else', 'float', 'for', 'if', 'include', 'int', 'long', 'return', 'sizeof', 'struct', 'switch', 'void', 'while'],
  python: ['and', 'as', 'class', 'def', 'elif', 'else', 'False', 'for', 'from', 'if', 'import', 'in', 'None', 'not', 'or', 'print', 'return', 'self', 'True', 'while'],
  javascript: ['await', 'class', 'const', 'else', 'export', 'for', 'from', 'function', 'if', 'import', 'let', 'new', 'return', 'true', 'false', 'var', 'while'],
  latex: ['begin', 'end', 'frac', 'sum', 'int', 'alpha', 'beta', 'theta', 'gamma', 'lambda', 'text', 'sqrt', 'cdot', 'in', 'infty', 'partial', 'nabla', 'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow'],
};

export const languageNames: Record<CodeLanguage, string> = {
  c: 'C',
  python: 'Python',
  javascript: 'JavaScript',
  latex: 'LaTeX',
};

export const detectLanguage = (code: string): CodeLanguage => {
  // Score simple language clues and choose the strongest match.
  const scores: Record<CodeLanguage, number> = {
    c: 0,
    python: 0,
    javascript: 0,
    latex: 0,
  };

  const trimmedCode = code.trim();
  if (!trimmedCode) return 'javascript';

  const countMatches = (patterns: RegExp[]) =>
    patterns.reduce((score, pattern) => score + (trimmedCode.match(pattern)?.length ?? 0), 0);

  scores.c += countMatches([
    /#include\s*</g,
    /\bint\s+main\s*\(/g,
    /\bprintf\s*\(/g,
    /\bscanf\s*\(/g,
    /\bmalloc\s*\(/g,
    /\b(struct|typedef|sizeof)\b/g,
  ]) * 4;
  scores.c += countMatches([/\b(int|char|float|double|void|long)\s+\w+\s*(?:[=;,(])/g, /;\s*$/gm]);

  scores.python += countMatches([
    /^\s*def\s+\w+\s*\(.*\)\s*:/gm,
    /^\s*class\s+\w+.*:/gm,
    /^\s*(from\s+\w+\s+)?import\s+\w+/gm,
    /\bprint\s*\(/g,
    /\bself\./g,
    /^\s*(elif|except|finally|with)\b/gm,
  ]) * 4;
  scores.python += countMatches([/:\s*$/gm, /^\s{2,}\w+/gm]);

  scores.javascript += countMatches([
    /\b(console\.log|document\.|window\.)/g,
    /\b(const|let|var)\s+\w+\s*=/g,
    /=>/g,
    /\bfunction\s+\w*\s*\(/g,
    /\b(import|export)\s+(?:\{|\w+)/g,
  ]) * 4;
  scores.javascript += countMatches([/\b(JSON|Promise|React)\b/g, /;\s*$/gm]);

  scores.latex += countMatches([
    /\\begin\{/g,
    /\\end\{/g,
    /\\frac\{/g,
    /\\sum_/g,
    /\\int_/g,
    /\\alpha\b/g,
    /\$[^$]+\$/g
  ]) * 4;

  const detected = (Object.entries(scores) as [CodeLanguage, number][])
    .sort(([, a], [, b]) => b - a)[0];

  return detected[1] === 0 ? 'javascript' : detected[0];
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
  if (/^\d+(\.\d+)?$/.test(token)) {
    return 'number';
  }
  if (languageKeywords[language].includes(token)) {
    return 'keyword';
  }
  return 'plain';
};

const highlightLine = (line: string, language: CodeLanguage): Segment[] => {
  // Keep comments and strings separate so their colors are stable.
  let commentStart = language === 'python' ? line.indexOf('#') : line.indexOf('//');
  if (language === 'latex') commentStart = line.indexOf('%');
  const codePart = commentStart >= 0 ? line.slice(0, commentStart) : line;
  const commentPart = commentStart >= 0 ? line.slice(commentStart) : '';

  const stringPattern = /(["'`])(?:\\.|(?!\1).)*\1/g;
  const segments: Segment[] = [];
  let lastIndex = 0;

  codePart.replace(stringPattern, (match, _quote, offset) => {
    splitWords(codePart.slice(lastIndex, offset)).forEach((token) => {
      segments.push({ kind: classifyToken(token, language), value: token });
    });
    segments.push({ kind: 'string', value: match });
    lastIndex = offset + match.length;
    return match;
  });

  splitWords(codePart.slice(lastIndex)).forEach((token) => {
    segments.push({ kind: classifyToken(token, language), value: token });
  });

  if (commentPart) {
    segments.push({ kind: 'comment', value: commentPart });
  }

  return segments;
};

export const highlightCode = (code: string, language: CodeLanguage): Segment[][] =>
  code.split('\n').map((line) => highlightLine(line, language));
