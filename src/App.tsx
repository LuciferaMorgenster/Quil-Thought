import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SAMPLE_DOCUMENTS } from './utils/sampleDocuments';
import {
  Document,
  DocumentVersion,
  ThemeMode,
  FontFamily,
  FontSize,
  ReadingWidth,
  ProactiveSuggestion,
  IterationScope,
} from './types';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { InlineAIBubble } from './components/InlineAIBubble';
import { ProactiveMarginSparks } from './components/ProactiveMarginSparks';
import { DraftModal } from './components/DraftModal';
import { UnblockModal } from './components/UnblockModal';
import { VersionHistoryDrawer } from './components/VersionHistoryDrawer';
import { DocumentDrawer } from './components/DocumentDrawer';

const STORAGE_KEY = 'quill_thought_documents_v1';
const CURRENT_DOC_ID_KEY = 'quill_thought_active_doc_id';
const SETTINGS_KEY = 'quill_thought_settings';

export default function App() {
  // Load documents
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading documents from storage', e);
    }
    return SAMPLE_DOCUMENTS;
  });

  const [currentDocId, setCurrentDocId] = useState<string>(() => {
    const saved = localStorage.getItem(CURRENT_DOC_ID_KEY);
    return saved || SAMPLE_DOCUMENTS[0].id;
  });

  // Settings
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).theme || 'parchment';
      } catch {}
    }
    return 'parchment';
  });

  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [readingWidth, setReadingWidth] = useState<ReadingWidth>('normal');
  const [isZenMode, setIsZenMode] = useState(false);

  // Thought Partner state
  const [thoughtPartnerActive, setThoughtPartnerActive] = useState(true);
  const [isSparksOpen, setIsSparksOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [highlightedExcerpt, setHighlightedExcerpt] = useState<string | undefined>();

  // Modals & Drawers
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isUnblockOpen, setIsUnblockOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

  // Inline AI Bubble
  const [inlineBubbleState, setInlineBubbleState] = useState<{
    isOpen: boolean;
    targetExcerpt: string;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    targetExcerpt: '',
    position: { top: 120, left: 100 },
  });

  // Current active doc
  const currentDoc = documents.find((d) => d.id === currentDocId) || documents[0];

  // Save documents to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(CURRENT_DOC_ID_KEY, currentDocId);
  }, [currentDocId]);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ theme, fontFamily, fontSize, readingWidth })
    );
  }, [theme, fontFamily, fontSize, readingWidth]);

  // Update current doc content
  const handleUpdateContent = (newContent: string) => {
    const wordCount = newContent.split(/\s+/).filter(Boolean).length;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === currentDoc.id
          ? {
              ...d,
              content: newContent,
              wordCount,
              readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  // Update title
  const handleUpdateTitle = (newTitle: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === currentDoc.id
          ? {
              ...d,
              title: newTitle,
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  // Helper to save a version snapshot before any AI mutation
  const saveSnapshot = useCallback(
    (label: string) => {
      const newVersion: DocumentVersion = {
        id: `v-${Date.now()}`,
        timestamp: new Date().toISOString(),
        label,
        content: currentDoc.content,
        wordCount: currentDoc.wordCount,
      };

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === currentDoc.id
            ? {
                ...d,
                versions: [newVersion, ...(d.versions || [])].slice(0, 30),
              }
            : d
        )
      );
    },
    [currentDoc]
  );

  // Proactive Thought Partner Trigger (fetches smart editor insights)
  const fetchProactiveCritique = useCallback(async () => {
    if (!currentDoc.content || currentDoc.content.trim().length < 40) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/proactive-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentDoc.title,
          documentContent: currentDoc.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        if (data.suggestions && data.suggestions.length > 0) {
          // Open margin panel subtly on first discovery if not zen mode
          if (!isZenMode && window.innerWidth >= 1280) {
            setIsSparksOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Proactive critique error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentDoc.content, currentDoc.title, isZenMode]);

  // Initial proactive critique on load
  useEffect(() => {
    if (thoughtPartnerActive) {
      const timer = setTimeout(() => {
        fetchProactiveCritique();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentDoc.id, thoughtPartnerActive]);

  // Apply revision from inline bubble
  const handleApplyRevision = (
    revisedText: string,
    scope: IterationScope,
    fullDocRevised?: string
  ) => {
    // Save checkpoint first
    saveSnapshot(`Before AI Iteration (${scope})`);

    if (fullDocRevised && (scope === 'smart_weave' || scope === 'full_document')) {
      handleUpdateContent(fullDocRevised);
    } else {
      // Replace target excerpt inside current document
      const current = currentDoc.content;
      const target = inlineBubbleState.targetExcerpt;

      if (current.includes(target)) {
        const updated = current.replace(target, revisedText);
        handleUpdateContent(updated);
      } else {
        // Fallback: append or replace whole content
        handleUpdateContent(revisedText);
      }
    }

    // Momentary highlight
    setHighlightedExcerpt(revisedText);
    setTimeout(() => setHighlightedExcerpt(undefined), 3000);

    // Refresh proactive critique
    if (thoughtPartnerActive) {
      setTimeout(() => fetchProactiveCritique(), 1000);
    }
  };

  // Apply suggestion from proactive thought partner
  const handleApplySuggestion = (sugg: ProactiveSuggestion) => {
    saveSnapshot(`Weave suggestion: ${sugg.title}`);

    const current = currentDoc.content;
    if (current.includes(sugg.targetExcerpt)) {
      const updated = current.replace(sugg.targetExcerpt, sugg.proposedReplacement);
      handleUpdateContent(updated);

      // Dismiss from active list
      setSuggestions((prev) => prev.filter((s) => s.id !== sugg.id));

      setHighlightedExcerpt(sugg.proposedReplacement);
      setTimeout(() => setHighlightedExcerpt(undefined), 3000);
    }
  };

  const handleDismissSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  // Create draft from modal
  const handleDraftCreated = (draft: { title: string; content: string }) => {
    const wordCount = draft.content.split(/\s+/).filter(Boolean).length;
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: draft.title || 'Untitled Draft',
      content: draft.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount,
      readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
      versions: [
        {
          id: `v-${Date.now()}`,
          timestamp: new Date().toISOString(),
          label: 'Initial Magic Draft',
          content: draft.content,
          wordCount,
        },
      ],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
  };

  // Create new blank document
  const handleCreateNewDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Piece',
      content: '# Untitled Piece\n\n',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 2,
      readingTimeMinutes: 1,
      versions: [],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
  };

  const handleDuplicateDocument = (doc: Document) => {
    const copy: Document = {
      ...doc,
      id: `doc-${Date.now()}`,
      title: `${doc.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
    };
    setDocuments((prev) => [copy, ...prev]);
    setCurrentDocId(copy.id);
  };

  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) return;
    const remaining = documents.filter((d) => d.id !== id);
    setDocuments(remaining);
    if (currentDocId === id) {
      setCurrentDocId(remaining[0].id);
    }
  };

  const handleRevertToVersion = (version: DocumentVersion) => {
    saveSnapshot(`Before reverting to "${version.label}"`);
    handleUpdateContent(version.content);
  };

  // Insert continuation from Unblock modal
  const handleInsertContinuation = (text: string) => {
    saveSnapshot('Before unblock continuation');
    handleUpdateContent(`${currentDoc.content}\n\n${text}`);
  };

  // Export handlers
  const handleExport = (format: 'markdown' | 'text' | 'copy') => {
    if (format === 'copy') {
      navigator.clipboard.writeText(currentDoc.content);
      return;
    }

    const filename = `${(currentDoc.title || 'document').toLowerCase().replace(/\s+/g, '-')}.${
      format === 'markdown' ? 'md' : 'txt'
    }`;
    const blob = new Blob([currentDoc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Global keydown (Esc to exit zen mode)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inlineBubbleState.isOpen) {
          setInlineBubbleState((prev) => ({ ...prev, isOpen: false }));
        } else if (isZenMode) {
          setIsZenMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isZenMode, inlineBubbleState.isOpen]);

  const isDark = theme === 'obsidian';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col ${
        isDark
          ? 'bg-stone-950 text-stone-100'
          : theme === 'parchment'
          ? 'bg-[#FAF8F5] text-stone-900'
          : 'bg-white text-stone-900'
      }`}
    >
      {/* Top Navigation & Status Bar */}
      <Header
        currentDoc={currentDoc}
        onUpdateTitle={handleUpdateTitle}
        onNewDraftModal={() => setIsDraftModalOpen(true)}
        onOpenDocuments={() => setIsDocumentsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenUnblock={() => setIsUnblockOpen(true)}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
        thoughtPartnerActive={thoughtPartnerActive}
        onToggleThoughtPartner={() => {
          const next = !thoughtPartnerActive;
          setThoughtPartnerActive(next);
          if (next) {
            setIsSparksOpen(true);
            fetchProactiveCritique();
          } else {
            setIsSparksOpen(false);
          }
        }}
        isAnalyzing={isAnalyzing}
        suggestionsCount={suggestions.filter((s) => !s.dismissed).length}
        theme={theme}
        onChangeTheme={setTheme}
        fontFamily={fontFamily}
        onChangeFontFamily={setFontFamily}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        readingWidth={readingWidth}
        onChangeReadingWidth={setReadingWidth}
        onExport={handleExport}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Central Writing Area */}
        <div className={`flex-1 overflow-y-auto transition-all ${isSparksOpen ? 'xl:pr-96' : ''}`}>
          <Editor
            content={currentDoc.content}
            onChangeContent={handleUpdateContent}
            onOpenInlineBubble={(targetExcerpt, position) => {
              setInlineBubbleState({
                isOpen: true,
                targetExcerpt,
                position,
              });
            }}
            proactiveSuggestions={suggestions}
            onSelectSuggestion={(sugg) => {
              setHighlightedExcerpt(sugg.targetExcerpt);
              setIsSparksOpen(true);
            }}
            highlightedExcerpt={highlightedExcerpt}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            readingWidth={readingWidth}
            isZenMode={isZenMode}
          />
        </div>

        {/* Proactive Thought Partner Margin Sparks Panel */}
        {thoughtPartnerActive && (
          <ProactiveMarginSparks
            suggestions={suggestions}
            isOpen={isSparksOpen}
            onToggleOpen={() => setIsSparksOpen(!isSparksOpen)}
            onSelectSuggestion={(sugg) => {
              setHighlightedExcerpt(sugg.targetExcerpt);
            }}
            onApplySuggestion={handleApplySuggestion}
            onDismissSuggestion={handleDismissSuggestion}
            onTriggerCritique={fetchProactiveCritique}
            isAnalyzing={isAnalyzing}
            theme={theme}
          />
        )}
      </main>

      {/* Inline AI Bubble Modal (Direct In-Situ Feedback & Smart Weave) */}
      <InlineAIBubble
        isOpen={inlineBubbleState.isOpen}
        targetExcerpt={inlineBubbleState.targetExcerpt}
        surroundingContext={currentDoc.content}
        position={inlineBubbleState.position}
        onClose={() => setInlineBubbleState((prev) => ({ ...prev, isOpen: false }))}
        onApplyRevision={handleApplyRevision}
        theme={theme}
      />

      {/* Magic Draft Modal (from prompt and file attachments) */}
      <DraftModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        onDraftCreated={handleDraftCreated}
        theme={theme}
      />

      {/* Unblock Flow Modal */}
      <UnblockModal
        isOpen={isUnblockOpen}
        onClose={() => setIsUnblockOpen(false)}
        documentContent={currentDoc.content}
        cursorContext={currentDoc.content.slice(-400)}
        onInsertContinuation={handleInsertContinuation}
        theme={theme}
      />

      {/* Checkpoints & Version History Drawer */}
      <VersionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        document={currentDoc}
        onRevertToVersion={handleRevertToVersion}
        onSaveManualCheckpoint={(label) => saveSnapshot(label)}
        theme={theme}
      />

      {/* Documents Library Drawer */}
      <DocumentDrawer
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        documents={documents}
        currentDocId={currentDocId}
        onSelectDocument={setCurrentDocId}
        onCreateNewDocument={handleCreateNewDocument}
        onDuplicateDocument={handleDuplicateDocument}
        onDeleteDocument={handleDeleteDocument}
        theme={theme}
      />
    </div>
  );
}
