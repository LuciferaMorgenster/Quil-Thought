import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Zap,
  Scissors,
  Wand2,
  GitBranch,
  Layers,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { IterationScope, IterationResult, ThemeMode } from '../types';
import { computeWordDiff } from '../utils/diff';

interface InlineAIBubbleProps {
  isOpen: boolean;
  targetExcerpt: string;
  surroundingContext: string;
  position: { top: number; left: number };
  onClose: () => void;
  onApplyRevision: (revisedText: string, scope: IterationScope, fullDocRevised?: string) => void;
  theme: ThemeMode;
}

export const InlineAIBubble: React.FC<InlineAIBubbleProps> = ({
  isOpen,
  targetExcerpt,
  surroundingContext,
  position,
  onClose,
  onApplyRevision,
  theme,
}) => {
  const [feedback, setFeedback] = useState('');
  const [scope, setScope] = useState<IterationScope>('smart_weave');
  const [isLoading, setIsLoading] = useState(false);
  const [iterationResult, setIterationResult] = useState<IterationResult | null>(null);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFeedback('');
      setIterationResult(null);
      setError(null);
      setSelectedVariationIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, targetExcerpt]);

  // Quick preset actions
  const PRESETS = [
    { label: 'Make punchier', prompt: 'Make this punchier, tighter, and eliminate passive voice.' },
    { label: 'Smooth flow', prompt: 'Improve the musicality, rhythm, and cadence of these sentences.' },
    { label: 'Add analogy', prompt: 'Ground this abstract concept in a striking, memorable analogy or metaphor.' },
    { label: 'Cut fluff', prompt: 'Ruthlessly cut all filler words and tighten the prose by 30%.' },
    { label: 'Anticipate objection', prompt: 'Weave in a nuanced acknowledgment of a skeptical counter-argument.' },
  ];

  const handleIterate = async (customPrompt?: string) => {
    const promptToSend = customPrompt || feedback;
    if (!promptToSend.trim() && !targetExcerpt) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullDocument: surroundingContext,
          targetExcerpt,
          feedback: promptToSend,
          scope,
          actionType: 'custom',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to iterate on text');
      }

      const result: IterationResult = await res.json();
      setIterationResult(result);
      setSelectedVariationIdx(-1);
    } catch (err: any) {
      console.error('Iteration error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentRevisedText =
    selectedVariationIdx === -1
      ? iterationResult?.revisedTarget || ''
      : iterationResult?.suggestedAlternatives?.[selectedVariationIdx] || iterationResult?.revisedTarget || '';

  const handleApply = () => {
    if (!currentRevisedText) return;
    onApplyRevision(
      currentRevisedText,
      scope,
      scope === 'smart_weave' || scope === 'full_document' ? iterationResult?.revisedDocument : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  const isDark = theme === 'obsidian';

  // Compute diff parts for visual review
  const diffParts = iterationResult ? computeWordDiff(targetExcerpt, currentRevisedText) : [];

  return (
    <div
      ref={containerRef}
      style={{
        top: Math.max(70, position.top),
        left: Math.max(16, Math.min(position.left, window.innerWidth - 560)),
      }}
      className={`fixed z-50 w-[94vw] max-w-[540px] rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-200 animate-in fade-in zoom-in-95 ${
        isDark
          ? 'bg-stone-900/95 border-stone-700 text-stone-100 shadow-black/60'
          : 'bg-[#FCFAF7]/95 border-amber-900/15 text-stone-900 shadow-stone-800/15'
      }`}
    >
      {/* Header bar */}
      <div className="px-4 py-3 border-b flex items-center justify-between border-stone-200/50 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase text-amber-800 dark:text-amber-300">
            Inline Magic Iteration
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-[82vh] overflow-y-auto">
        {/* Target excerpt preview */}
        <div
          className={`px-3 py-2 rounded-xl text-xs border italic line-clamp-3 leading-relaxed ${
            isDark
              ? 'bg-stone-950/60 border-stone-800 text-stone-300'
              : 'bg-amber-50/60 border-amber-100 text-stone-700'
          }`}
        >
          <span className="font-sans font-bold not-italic mr-1.5 text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-wider">
            Target:
          </span>
          "{targetExcerpt}"
        </div>

        {/* Scope selector */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <span className="text-stone-500 font-medium">Scope:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'selection', label: 'Selection' },
              { id: 'paragraph', label: 'Paragraph' },
              { id: 'smart_weave', label: 'Smart Weave ✨' },
              { id: 'full_document', label: 'Article' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setScope(s.id as IterationScope)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  scope === s.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box: The user's direct natural feedback without copying into another chat app */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleIterate();
              }
            }}
            placeholder="Tell AI how to iterate (e.g. 'Make this less corporate & add an analogy')..."
            className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none pr-10 transition-all ${
              isDark
                ? 'bg-stone-950 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500'
                : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600'
            }`}
          />
          <button
            onClick={() => handleIterate()}
            disabled={isLoading || (!feedback.trim() && !targetExcerpt)}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Weave in feedback (Enter)"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick prompt preset chips */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setFeedback(p.prompt);
                handleIterate(p.prompt);
              }}
              disabled={isLoading}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-amber-700 hover:text-amber-300'
                  : 'border-stone-200 bg-white/70 text-stone-600 hover:border-amber-400 hover:text-amber-800'
              }`}
            >
              <Zap className="w-2.5 h-2.5 text-amber-500" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Result & Diff Preview */}
        {iterationResult && (
          <div
            className={`p-3.5 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
              isDark ? 'bg-stone-950/70 border-stone-800' : 'bg-white border-amber-900/10'
            }`}
          >
            {/* Thought summary from editor */}
            <div className="flex items-start gap-2 text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-stone-600 dark:text-stone-300 font-medium">
                {iterationResult.diffSummary}
              </p>
            </div>

            {/* Visual Diff View */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 flex items-center justify-between">
                <span>Visual Diff</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px]">
                  +green new / -red cut
                </span>
              </div>
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed font-editorial text-[14px] border ${
                  isDark
                    ? 'bg-stone-900/90 border-stone-800 text-stone-100'
                    : 'bg-[#FAF8F5] border-stone-200 text-stone-900'
                }`}
              >
                {diffParts.map((part, i) => {
                  if (part.type === 'insert') {
                    return (
                      <span
                        key={i}
                        className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-0.5 rounded font-medium"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  if (part.type === 'delete') {
                    return (
                      <span
                        key={i}
                        className="bg-rose-500/15 text-rose-700 dark:text-rose-400 line-through px-0.5 rounded opacity-75"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  return <span key={i}>{part.value}</span>;
                })}
              </div>
            </div>

            {/* Alternative variations if returned */}
            {iterationResult.suggestedAlternatives && iterationResult.suggestedAlternatives.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] pt-1">
                <span className="text-stone-400">Variations:</span>
                <button
                  onClick={() => setSelectedVariationIdx(-1)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                    selectedVariationIdx === -1
                      ? 'bg-amber-600 text-white'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
                  }`}
                >
                  Primary
                </button>
                {iterationResult.suggestedAlternatives.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariationIdx(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                      selectedVariationIdx === idx
                        ? 'bg-amber-600 text-white'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
                    }`}
                  >
                    Alt {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Actions: Accept or Try Another */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={() => handleIterate(feedback || 'Try a different bold stylistic angle')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Angle</span>
              </button>

              <button
                onClick={handleApply}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept & Weave In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
