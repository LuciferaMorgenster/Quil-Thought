import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  Compass,
  Zap,
  ShieldAlert,
  Feather,
  Anchor,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { ProactiveSuggestion, SuggestionType, ThemeMode } from '../types';

interface ProactiveMarginSparksProps {
  suggestions: ProactiveSuggestion[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectSuggestion: (suggestion: ProactiveSuggestion) => void;
  onApplySuggestion: (suggestion: ProactiveSuggestion) => void;
  onDismissSuggestion: (id: string) => void;
  onTriggerCritique: () => void;
  isAnalyzing: boolean;
  theme: ThemeMode;
}

export const ProactiveMarginSparks: React.FC<ProactiveMarginSparksProps> = ({
  suggestions,
  isOpen,
  onToggleOpen,
  onSelectSuggestion,
  onApplySuggestion,
  onDismissSuggestion,
  onTriggerCritique,
  isAnalyzing,
  theme,
}) => {
  const isDark = theme === 'obsidian';

  const getTypeMeta = (type: SuggestionType) => {
    switch (type) {
      case 'flow':
        return {
          icon: Compass,
          label: 'Flow & Transition',
          color: 'text-sky-600 dark:text-sky-400',
          bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
          badge: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300',
        };
      case 'punch':
        return {
          icon: Zap,
          label: 'Pacing & Cadence',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
          badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300',
        };
      case 'counterpoint':
        return {
          icon: ShieldAlert,
          label: 'Nuance & Counterpoint',
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
          badge: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300',
        };
      case 'vividness':
        return {
          icon: Feather,
          label: 'Sensory Detail',
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
          badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300',
        };
      case 'hook':
      default:
        return {
          icon: Anchor,
          label: 'Resonant Hook',
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
          badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300',
        };
    }
  };

  const activeSuggestions = suggestions.filter((s) => !s.dismissed);

  return (
    <aside
      className={`fixed right-0 top-15 bottom-0 z-30 transition-all duration-300 ease-in-out border-l flex flex-col ${
        isOpen ? 'w-80 sm:w-96 translate-x-0' : 'w-0 translate-x-full pointer-events-none'
      } ${
        isDark
          ? 'bg-stone-950/95 border-stone-800 text-stone-200'
          : theme === 'parchment'
          ? 'bg-[#FAF8F5]/95 border-[#E8E4DD] text-stone-900'
          : 'bg-white/95 border-stone-200 text-stone-900'
      } backdrop-blur-md`}
    >
      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Thought Partner Sparks
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-bold">
            {activeSuggestions.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTriggerCritique}
            disabled={isAnalyzing}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Re-read draft & generate new thoughts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sparks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {isAnalyzing && (
          <div className="p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>Attentive Thought Partner reading your draft...</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Looking for cadence, clarity, and opportunities to elevate your prose.
            </p>
          </div>
        )}

        {activeSuggestions.length === 0 && !isAnalyzing ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Feather className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
              Your prose is singing cleanly!
            </p>
            <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
              As you keep writing, your thought partner will proactively notice transitions, weak verbs, or counter-arguments.
            </p>
            <button
              onClick={onTriggerCritique}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium transition-colors cursor-pointer"
            >
              Analyze Current Draft
            </button>
          </div>
        ) : (
          activeSuggestions.map((sugg) => {
            const meta = getTypeMeta(sugg.type);
            const Icon = meta.icon;

            return (
              <div
                key={sugg.id}
                onClick={() => onSelectSuggestion(sugg)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${meta.bg}`}
              >
                {/* Card Title & Type */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissSuggestion(sugg.id);
                    }}
                    className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-semibold mb-1 text-stone-900 dark:text-stone-100">
                  {sugg.title}
                </h4>

                {/* Insight explanation */}
                <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300 mb-2">
                  {sugg.insight}
                </p>

                {/* Original vs Proposed */}
                <div className="space-y-1.5 text-[11px] font-editorial bg-white/70 dark:bg-stone-900/70 p-2.5 rounded-lg border border-stone-200/50 dark:border-stone-800 mb-2.5">
                  <div className="line-through text-stone-400 text-[12px]">
                    "{sugg.targetExcerpt}"
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300 font-medium text-[13px] leading-snug">
                    "{sugg.proposedReplacement}"
                  </div>
                </div>

                {/* Weave in button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-400">Click card to find in text</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplySuggestion(sugg);
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Weave In</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>Suggestions auto-refresh when you pause writing</span>
      </div>
    </aside>
  );
};
