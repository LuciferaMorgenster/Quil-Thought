import React, { useState } from 'react';
import {
  History,
  X,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  Eye,
  FileText,
} from 'lucide-react';
import { Document, DocumentVersion, ThemeMode } from '../types';
import { computeWordDiff } from '../utils/diff';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onRevertToVersion: (version: DocumentVersion) => void;
  onSaveManualCheckpoint: (label: string) => void;
  theme: ThemeMode;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  document,
  onRevertToVersion,
  onSaveManualCheckpoint,
  theme,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [showAddCheckpoint, setShowAddCheckpoint] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'obsidian';
  const versions = document.versions || [];

  const handleCreateCheckpoint = () => {
    if (customLabel.trim()) {
      onSaveManualCheckpoint(customLabel.trim());
      setCustomLabel('');
      setShowAddCheckpoint(false);
    }
  };

  const diffParts = selectedVersion
    ? computeWordDiff(selectedVersion.content, document.content)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl h-full border-l shadow-2xl flex flex-col ${
          isDark
            ? 'bg-stone-950 border-stone-800 text-stone-100'
            : 'bg-[#FAF8F5] border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-sm tracking-tight">Version Checkpoints</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 font-mono">
              {versions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCheckpoint(!showAddCheckpoint)}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer transition-colors"
            >
              + Save Checkpoint
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Manual checkpoint form */}
        {showAddCheckpoint && (
          <div className="p-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="E.g., Before cutting section 3..."
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none ${
                isDark
                  ? 'bg-stone-900 border-stone-700 text-white'
                  : 'bg-white border-stone-300 text-stone-900'
              }`}
            />
            <button
              onClick={handleCreateCheckpoint}
              disabled={!customLabel.trim()}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-medium cursor-pointer"
            >
              Save
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {versions.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500">
              No previous checkpoints yet. A checkpoint is automatically recorded whenever you accept an AI iteration.
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                const date = new Date(ver.timestamp);

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(isSelected ? null : ver)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                        : isDark
                        ? 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-stone-800 dark:text-stone-200">
                        {ver.label}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {ver.wordCount} words
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span>{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRevertToVersion(ver);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-colors text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Revert</span>
                        </button>
                      </div>
                    </div>

                    {/* Diff Preview if selected */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                          Diff vs Current Document:
                        </div>
                        <div
                          className={`p-3 rounded-lg text-xs font-editorial max-h-48 overflow-y-auto leading-relaxed border ${
                            isDark
                              ? 'bg-stone-950 border-stone-800 text-stone-200'
                              : 'bg-stone-50 border-stone-200 text-stone-800'
                          }`}
                        >
                          {diffParts.map((part, idx) => {
                            if (part.type === 'insert') {
                              return (
                                <span key={idx} className="bg-emerald-500/20 text-emerald-700 px-0.5 rounded">
                                  {part.value}
                                </span>
                              );
                            }
                            if (part.type === 'delete') {
                              return (
                                <span key={idx} className="bg-rose-500/20 text-rose-700 line-through px-0.5 rounded">
                                  {part.value}
                                </span>
                              );
                            }
                            return <span key={idx}>{part.value}</span>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
