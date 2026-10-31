import React, { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  Edit3,
  BookOpen,
  MessageSquarePlus,
  Compass,
} from 'lucide-react';
import {
  ThemeMode,
  FontFamily,
  FontSize,
  ReadingWidth,
  ProactiveSuggestion,
} from '../types';

interface EditorProps {
  content: string;
  onChangeContent: (content: string) => void;
  onOpenInlineBubble: (targetExcerpt: string, position: { top: number; left: number }) => void;
  proactiveSuggestions: ProactiveSuggestion[];
  onSelectSuggestion: (sugg: ProactiveSuggestion) => void;
  highlightedExcerpt?: string;
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: FontSize;
  readingWidth: ReadingWidth;
  isZenMode: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChangeContent,
  onOpenInlineBubble,
  proactiveSuggestions,
  onSelectSuggestion,
  highlightedExcerpt,
  theme,
  fontFamily,
  fontSize,
  readingWidth,
  isZenMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number; text: string } | null>(null);
  const [floatingPillPosition, setFloatingPillPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);

  // Auto-resize textarea to fit content seamlessly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(600, textareaRef.current.scrollHeight + 120)}px`;
    }
  }, [content]);

  // Handle selection detection to display floating AI wand
  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end).trim();

    if (selectedText.length > 2) {
      setSelectionRange({ start, end, text: selectedText });

      // Calculate approximate position of selection in textarea
      const rect = textarea.getBoundingClientRect();
      // Estimate vertical position from line count
      const textBefore = textarea.value.substring(0, start);
      const linesBefore = textBefore.split('\n').length;
      const lineHeight = fontSize === 'xl' ? 32 : fontSize === 'lg' ? 28 : fontSize === 'md' ? 26 : 22;
      const topOffset = Math.min(window.innerHeight - 150, Math.max(80, rect.top + linesBefore * lineHeight - textarea.scrollTop));

      setFloatingPillPosition({
        top: topOffset,
        left: Math.min(window.innerWidth - 220, Math.max(40, rect.left + rect.width / 2 - 90)),
      });
    } else {
      setSelectionRange(null);
      setFloatingPillPosition(null);
    }
  };

  // Keyboard shortcut listener (Cmd+K or Ctrl+K for inline AI)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      triggerAIOnSelection();
    }
  };

  const triggerAIOnSelection = () => {
    if (selectionRange && selectionRange.text.length > 0) {
      onOpenInlineBubble(
        selectionRange.text,
        floatingPillPosition || { top: window.innerHeight / 3, left: window.innerWidth / 2 - 250 }
      );
      setFloatingPillPosition(null);
    } else {
      // If nothing selected, grab the current line or paragraph under cursor
      const textarea = textareaRef.current;
      if (!textarea) return;
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;

      // Find paragraph bounds
      const prevBreak = text.lastIndexOf('\n\n', cursorPos - 1);
      const nextBreak = text.indexOf('\n\n', cursorPos);
      const start = prevBreak === -1 ? 0 : prevBreak + 2;
      const end = nextBreak === -1 ? text.length : nextBreak;
      const paragraph = text.substring(start, end).trim();

      if (paragraph.length > 0) {
        onOpenInlineBubble(paragraph, { top: window.innerHeight / 3, left: window.innerWidth / 2 - 250 });
      }
    }
  };

  // Trigger inline AI on a specific paragraph clicked from margin
  const handleParagraphIterate = (paraText: string, clientY: number) => {
    onOpenInlineBubble(paraText, {
      top: Math.max(80, clientY - 40),
      left: Math.max(20, (window.innerWidth - 540) / 2),
    });
  };

  // Markdown format insertion helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    onChangeContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 20);
  };

  const getWidthClass = () => {
    switch (readingWidth) {
      case 'narrow':
        return 'max-w-xl';
      case 'wide':
        return 'max-w-4xl';
      case 'normal':
      default:
        return 'max-w-2xl';
    }
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case 'sans':
        return 'font-clean';
      case 'mono':
        return 'font-code';
      case 'serif':
      default:
        return 'font-editorial';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-[15px] leading-[1.75]';
      case 'lg':
        return 'text-[19px] leading-[1.8]';
      case 'xl':
        return 'text-[22px] leading-[1.85]';
      case 'md':
      default:
        return 'text-[17px] leading-[1.8]';
    }
  };

  const isDark = theme === 'obsidian';

  // Break content into paragraphs for hover triggers
  const paragraphs = content.split('\n\n');

  return (
    <div
      ref={containerRef}
      className={`min-h-[calc(100vh-60px)] transition-colors duration-200 py-10 px-4 sm:px-8 relative ${
        isDark
          ? 'bg-stone-950 text-stone-100'
          : theme === 'parchment'
          ? 'bg-[#FAF8F5] text-stone-900'
          : 'bg-white text-stone-900'
      }`}
    >
      {/* Floating Selection Magic Pill */}
      {floatingPillPosition && selectionRange && (
        <div
          style={{
            top: floatingPillPosition.top,
            left: floatingPillPosition.left,
          }}
          className="fixed z-50 flex items-center gap-1.5 p-1 rounded-full bg-stone-900/90 text-stone-100 backdrop-blur-md shadow-xl border border-stone-700 animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={triggerAIOnSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iterate with AI</span>
            <kbd className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 font-mono">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Editor Container */}
      <div className={`mx-auto ${getWidthClass()} relative`}>
        {/* Floating subtle format bar at top of editor (hides in Zen mode) */}
        {!isZenMode && (
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-stone-200/50 dark:border-stone-800/80">
            <div className="flex items-center gap-1 text-stone-500">
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                title="Bold (Cmd+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                title="Italic (Cmd+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('## ')}
                className="p-1.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('> ')}
                className="p-1.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('- ')}
                className="p-1.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 font-mono">
                Select any text or click margin ✨ to iterate
              </span>
            </div>
          </div>
        )}

        {/* Writing Canvas */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            onSelect={handleSelect}
            onKeyUp={handleSelect}
            onMouseUp={handleSelect}
            onKeyDown={handleKeyDown}
            placeholder="Let your thoughts flow freely... Write here, or invoke the Magic Draft in the top bar."
            spellCheck={false}
            className={`w-full bg-transparent resize-none outline-none border-none tracking-normal ${getFontClass()} ${getFontSizeClass()} ${
              isDark ? 'text-stone-100 placeholder:text-stone-600' : 'text-stone-900 placeholder:text-stone-300'
            }`}
          />
        </div>

        {/* Interactive Paragraph Iteration Margin Triggers */}
        {/* Allows 1-click inline iteration on any paragraph even without selecting words */}
        <div className="mt-8 pt-8 border-t border-stone-200/40 dark:border-stone-800/60 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2 font-sans">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
              Structured Paragraph Inspector
            </span>
            <span>Hover any block to give inline feedback directly</span>
          </div>

          {paragraphs.map((para, index) => {
            const cleanPara = para.trim();
            if (!cleanPara) return null;

            // Check if this paragraph contains a proactive suggestion excerpt
            const matchedSuggestion = proactiveSuggestions.find(
              (s) => !s.dismissed && cleanPara.includes(s.targetExcerpt)
            );

            const isHighlighted = highlightedExcerpt && cleanPara.includes(highlightedExcerpt);

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveParagraphIndex(index)}
                onMouseLeave={() => setActiveParagraphIndex(null)}
                className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-200 border ${
                  isHighlighted
                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                    : matchedSuggestion
                    ? 'border-amber-400/40 bg-amber-500/5'
                    : isDark
                    ? 'border-transparent hover:border-stone-800 hover:bg-stone-900/40'
                    : 'border-transparent hover:border-stone-200 hover:bg-stone-50/80'
                }`}
              >
                {/* Paragraph Content */}
                <p className={`${getFontClass()} text-[15px] sm:text-[16px] leading-relaxed text-stone-800 dark:text-stone-200`}>
                  {cleanPara}
                </p>

                {/* Inline Proactive Note pill if matching suggestion */}
                {matchedSuggestion && (
                  <div
                    onClick={() => onSelectSuggestion(matchedSuggestion)}
                    className="mt-2.5 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-800 cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium">{matchedSuggestion.title}:</span>
                    <span className="italic truncate">{matchedSuggestion.insight}</span>
                  </div>
                )}

                {/* Hover Action Bar: Give inline feedback to AI */}
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-stone-900/90 dark:bg-stone-800 text-white px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs text-[11px]">
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleParagraphIterate(cleanPara, rect.top);
                    }}
                    className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Give feedback to AI on this paragraph"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Iterate Paragraph</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
