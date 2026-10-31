export type ThemeMode = 'parchment' | 'clean' | 'obsidian';
export type FontFamily = 'serif' | 'sans' | 'mono';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ReadingWidth = 'narrow' | 'normal' | 'wide';

export interface DocumentVersion {
  id: string;
  timestamp: string;
  label: string;
  content: string;
  wordCount: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTimeMinutes: number;
  versions: DocumentVersion[];
}

export type SuggestionType = 'flow' | 'punch' | 'counterpoint' | 'vividness' | 'hook';

export interface ProactiveSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  targetExcerpt: string;
  insight: string;
  proposedReplacement: string;
  dismissed?: boolean;
}

export type IterationScope = 'selection' | 'paragraph' | 'smart_weave' | 'full_document';

export interface IterationResult {
  revisedTarget: string;
  diffSummary: string;
  revisedDocument?: string;
  suggestedAlternatives?: string[];
}

export interface FileAttachment {
  name: string;
  size: number;
  mimeType: string;
  content?: string; // Text content if plaintext
  data?: string; // Base64 if image/pdf
}

export interface ContinuePath {
  title: string;
  continuationText: string;
  whyItWorks: string;
}
