import React from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  FileText,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Document, ThemeMode } from '../types';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onCreateNewDocument: () => void;
  onDuplicateDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  theme: ThemeMode;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  currentDocId,
  onSelectDocument,
  onCreateNewDocument,
  onDuplicateDocument,
  onDeleteDocument,
  theme,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'obsidian';

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm h-full border-r shadow-2xl flex flex-col ${
          isDark
            ? 'bg-stone-950 border-stone-800 text-stone-100'
            : 'bg-[#FAF8F5] border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-sm tracking-tight">Your Library</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 font-mono">
              {documents.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onCreateNewDocument();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
              title="New Blank Document"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {documents.map((doc) => {
            const isSelected = doc.id === currentDocId;
            const updated = new Date(doc.updatedAt);

            return (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectDocument(doc.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-amber-600 bg-amber-500/10'
                    : isDark
                    ? 'bg-stone-900/40 border-stone-800/80 hover:border-stone-700'
                    : 'bg-white border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                    <h4 className="text-xs font-semibold truncate text-stone-800 dark:text-stone-200">
                      {doc.title || 'Untitled Piece'}
                    </h4>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {doc.content.replace(/^[#\s]+[^\n]+\n+/, '').trim() || 'Empty document...'}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400 font-mono">
                    <span>{doc.wordCount} words</span>
                    <span>·</span>
                    <span>{updated.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateDocument(doc);
                    }}
                    className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {documents.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="p-1 rounded text-stone-400 hover:text-rose-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/60 dark:border-stone-800">
          <button
            onClick={() => {
              onCreateNewDocument();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
