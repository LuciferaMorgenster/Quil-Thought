import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  History,
  Maximize2,
  Minimize2,
  FileText,
  Share2,
  Lightbulb,
  Check,
  Palette,
  Type,
  ChevronDown,
  Layers,
  FilePlus2,
  Download,
  Copy,
} from 'lucide-react';
import { Document, ThemeMode, FontFamily, FontSize, ReadingWidth } from '../types';

interface HeaderProps {
  currentDoc: Document;
  onUpdateTitle: (title: string) => void;
  onNewDraftModal: () => void;
  onOpenDocuments: () => void;
  onOpenHistory: () => void;
  onOpenUnblock: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  thoughtPartnerActive: boolean;
  onToggleThoughtPartner: () => void;
  isAnalyzing: boolean;
  suggestionsCount: number;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  fontFamily: FontFamily;
  onChangeFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  readingWidth: ReadingWidth;
  onChangeReadingWidth: (width: ReadingWidth) => void;
  onExport: (format: 'markdown' | 'text' | 'copy') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDoc,
  onUpdateTitle,
  onNewDraftModal,
  onOpenDocuments,
  onOpenHistory,
  onOpenUnblock,
  isZenMode,
  onToggleZenMode,
  thoughtPartnerActive,
  onToggleThoughtPartner,
  isAnalyzing,
  suggestionsCount,
  theme,
  onChangeTheme,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  readingWidth,
  onChangeReadingWidth,
  onExport,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentDoc.title);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    } else {
      setTempTitle(currentDoc.title);
    }
    setIsEditingTitle(false);
  };

  const handleExport = (type: 'markdown' | 'text' | 'copy') => {
    onExport(type);
    setShowExportMenu(false);
    if (type === 'copy') {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    }
  };

  // If in Zen mode, show minimal translucent pill that fades in on hover
  if (isZenMode) {
    return (
      <div className="fixed top-4 right-6 z-50 transition-opacity duration-300 opacity-20 hover:opacity-100 flex items-center gap-2">
        <button
          onClick={onToggleZenMode}
          className="px-3 py-1.5 rounded-full bg-stone-900/80 text-stone-100 backdrop-blur text-xs flex items-center gap-1.5 shadow-lg hover:bg-stone-900 transition-all cursor-pointer"
          title="Exit Zen Mode (Esc)"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen</span>
        </button>
      </div>
    );
  }

  const isDark = theme === 'obsidian';

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-stone-950/85 border-stone-800 text-stone-200'
          : theme === 'parchment'
          ? 'bg-[#FAF8F5]/90 border-[#E8E4DD] text-stone-900'
          : 'bg-white/90 border-slate-200 text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Left: App Brand & Document Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenDocuments}
            className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium ${
              isDark
                ? 'hover:bg-stone-800 text-stone-300'
                : 'hover:bg-stone-200/60 text-stone-700'
            }`}
            title="All Documents"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />

          {/* Title Editor */}
          <div className="min-w-0 max-w-xs sm:max-w-md">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTempTitle(currentDoc.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="w-full text-sm font-semibold tracking-tight px-2 py-1 rounded border border-amber-500 bg-transparent outline-none"
              />
            ) : (
              <button
                onClick={() => {
                  setTempTitle(currentDoc.title);
                  setIsEditingTitle(true);
                }}
                className="text-left font-semibold text-sm sm:text-base tracking-tight truncate max-w-full hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-text block"
                title="Click to rename"
              >
                {currentDoc.title || 'Untitled Document'}
              </button>
            )}
          </div>

          {/* Metrics Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full ${
              isDark
                ? 'bg-stone-900 text-stone-400'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            <span>{currentDoc.wordCount} words</span>
            <span>·</span>
            <span>{Math.max(1, Math.round(currentDoc.wordCount / 200))} min read</span>
          </div>
        </div>

        {/* Center: Thought Partner Status Pill */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onToggleThoughtPartner}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer border ${
              thoughtPartnerActive
                ? isDark
                  ? 'bg-amber-950/60 border-amber-700 text-amber-200 hover:bg-amber-900/60'
                  : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                : 'bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-700'
            }`}
            title="Toggle Proactive Thought Partner"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  thoughtPartnerActive
                    ? isAnalyzing
                      ? 'animate-spin text-amber-500'
                      : 'text-amber-600'
                    : 'text-stone-400'
                }`}
              />
              {thoughtPartnerActive && isAnalyzing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span>
              {thoughtPartnerActive
                ? isAnalyzing
                  ? 'Partner Thinking...'
                  : suggestionsCount > 0
                  ? `Thought Partner (${suggestionsCount} sparks)`
                  : 'Thought Partner Active'
                : 'Partner Paused'}
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Piece with Magic Spark */}
          <button
            onClick={onNewDraftModal}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs transition-colors cursor-pointer"
            title="Draft new piece with AI prompt & file attachments"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Magic Draft</span>
          </button>

          {/* Unblock Me */}
          <button
            onClick={onOpenUnblock}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'hover:bg-stone-800 text-stone-300'
                : 'hover:bg-stone-200/60 text-stone-700'
            }`}
            title="Unblock Me: 3 next paths forward (Ctrl+Space)"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline">Unblock</span>
          </button>

          {/* Version Checkpoints */}
          <button
            onClick={onOpenHistory}
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'hover:bg-stone-800 text-stone-300'
                : 'hover:bg-stone-200/60 text-stone-700'
            }`}
            title="Version Checkpoints"
          >
            <History className="w-4 h-4 text-stone-500" />
            {currentDoc.versions && currentDoc.versions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-800 font-mono">
                {currentDoc.versions.length}
              </span>
            )}
          </button>

          {/* Style & Typography Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-stone-800 text-stone-300'
                  : 'hover:bg-stone-200/60 text-stone-700'
              }`}
              title="Typography & Appearance"
            >
              <Palette className="w-4 h-4 text-stone-500" />
            </button>

            {showStyleMenu && (
              <div
                className={`absolute right-0 mt-2 w-64 p-3 rounded-xl shadow-xl border text-xs z-50 ${
                  isDark
                    ? 'bg-stone-900 border-stone-800 text-stone-200'
                    : 'bg-white border-stone-200 text-stone-800'
                }`}
              >
                <div className="font-semibold text-stone-500 text-[11px] mb-2 uppercase tracking-wider">
                  Theme
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { id: 'parchment', label: 'Parchment' },
                    { id: 'clean', label: 'Clean' },
                    { id: 'obsidian', label: 'Obsidian' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onChangeTheme(t.id as ThemeMode)}
                      className={`px-2 py-1.5 rounded-lg border text-center font-medium capitalize cursor-pointer transition-all ${
                        theme === t.id
                          ? 'border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="font-semibold text-stone-500 text-[11px] mb-2 uppercase tracking-wider">
                  Typeface
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { id: 'serif', label: 'Serif' },
                    { id: 'sans', label: 'Sans' },
                    { id: 'mono', label: 'Mono' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onChangeFontFamily(f.id as FontFamily)}
                      className={`px-2 py-1.5 rounded-lg border text-center font-medium capitalize cursor-pointer transition-all ${
                        fontFamily === f.id
                          ? 'border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="font-semibold text-stone-500 text-[11px] mb-2 uppercase tracking-wider">
                  Size & Canvas Width
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-500">Text Size:</span>
                  <div className="flex items-center gap-1">
                    {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onChangeFontSize(sz)}
                        className={`w-6 h-6 rounded uppercase font-mono text-[10px] cursor-pointer ${
                          fontSize === sz
                            ? 'bg-amber-600 text-white'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Width:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'narrow', label: 'Narrow' },
                      { id: 'normal', label: 'Normal' },
                      { id: 'wide', label: 'Wide' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => onChangeReadingWidth(w.id as ReadingWidth)}
                        className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                          readingWidth === w.id
                            ? 'bg-amber-600 text-white'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export / Share Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-stone-800 text-stone-300'
                  : 'hover:bg-stone-200/60 text-stone-700'
              }`}
              title="Export Document"
            >
              <Share2 className="w-4 h-4 text-stone-500" />
            </button>

            {showExportMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 p-1.5 rounded-xl shadow-xl border text-xs z-50 ${
                  isDark
                    ? 'bg-stone-900 border-stone-800 text-stone-200'
                    : 'bg-white border-stone-200 text-stone-800'
                }`}
              >
                <button
                  onClick={() => handleExport('copy')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Text</span>
                  </div>
                  {copiedNotice && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Download .md</span>
                </button>
                <button
                  onClick={() => handleExport('text')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span>Download .txt</span>
                </button>
              </div>
            )}
          </div>

          {/* Zen Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-stone-800 text-stone-300'
                : 'hover:bg-stone-200/60 text-stone-700'
            }`}
            title="Focus / Zen Mode (Esc)"
          >
            <Maximize2 className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
