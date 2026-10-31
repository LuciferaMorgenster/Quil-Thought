import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  X,
  ArrowRight,
  Compass,
  Feather,
  Zap,
} from 'lucide-react';
import { ContinuePath, ThemeMode } from '../types';

interface UnblockModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
  cursorContext: string;
  onInsertContinuation: (text: string) => void;
  theme: ThemeMode;
}

export const UnblockModal: React.FC<UnblockModalProps> = ({
  isOpen,
  onClose,
  documentContent,
  cursorContext,
  onInsertContinuation,
  theme,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paths, setPaths] = useState<ContinuePath[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && !hasFetched) {
      handleFetchPaths();
    }
  }, [isOpen]);

  const handleFetchPaths = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent,
          cursorContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch continuations');
      }

      const data = await res.json();
      setPaths(data.paths || []);
      setHasFetched(true);
    } catch (err: any) {
      setError(err?.message || 'Could not unblock at this moment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'obsidian';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDark
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-[#FCFAF7] border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base tracking-tight">
                Unblock Your Flow
              </h3>
              <p className="text-xs text-stone-500">
                Three divergent ways to move your narrative or argument forward.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                Thought Partner is imagining narrative directions...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-700 text-xs">
              {error}
              <button
                onClick={handleFetchPaths}
                className="block mt-2 underline font-medium cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {paths.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    isDark
                      ? 'bg-stone-950/60 border-stone-800 hover:border-amber-700'
                      : 'bg-white border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-stone-400 italic">
                      {p.whyItWorks}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-editorial leading-relaxed mb-3 text-stone-800 dark:text-stone-200">
                    "{p.continuationText}"
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        onInsertContinuation(p.continuationText);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Insert into Draft</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
