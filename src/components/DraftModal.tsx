import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  File,
  Lightbulb,
  Check,
  ArrowRight,
} from 'lucide-react';
import { FileAttachment, ThemeMode } from '../types';

interface DraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDraftCreated: (draft: { title: string; content: string }) => void;
  theme: ThemeMode;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Generalists in the AI Era',
    prompt: 'Write an inspiring essay on why intellectual generalists and polymaths will thrive in the age of AI, focusing on taste, synthesis, and creative judgment.',
    tone: 'Thoughtful & Essayistic',
    format: 'Longform Essay',
  },
  {
    title: 'The Power of Unsent Letters',
    prompt: 'A reflective personal essay about the psychology of writing letters you never intend to send, and how it clarifies internal conflict.',
    tone: 'Conversational Newsletter',
    format: 'Newsletter Post',
  },
  {
    title: 'Product Strategy: Simplicity Moats',
    prompt: 'A razor-sharp executive memo analyzing why software simplicity is easier to copy on the surface, but nearly impossible to sustain organizationally.',
    tone: 'Executive & Strategic',
    format: 'Strategic Memo',
  },
];

export const DraftModal: React.FC<DraftModalProps> = ({
  isOpen,
  onClose,
  onDraftCreated,
  theme,
}) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Thoughtful & Essayistic');
  const [format, setFormat] = useState('Longform Essay');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isDark = theme === 'obsidian';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        // Read as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(file);
        });
        const data = await base64Promise;
        newAttachments.push({
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data,
        });
      } else {
        // Read as text
        const reader = new FileReader();
        const textPromise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(file);
        });
        const content = await textPromise;
        newAttachments.push({
          name: file.name,
          size: file.size,
          mimeType: file.type || 'text/plain',
          content,
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateDraft = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone,
          format,
          notes,
          attachments,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate draft');
      }

      const result = await res.json();
      onDraftCreated({
        title: result.title || 'Untitled Draft',
        content: result.content || '',
      });
      onClose();
    } catch (err: any) {
      console.error('Draft generation error:', err);
      setError(err?.message || 'Something went wrong while crafting your draft.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-[#FCFAF7] border-stone-200 text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg tracking-tight">
                Craft New Piece with Magic Spark
              </h2>
              <p className="text-xs text-stone-500">
                Ground your draft in research, rough notes, files, and personal intent.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          {/* Inspiration starters */}
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Inspiration Prompts (Click to Fill)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_PROMPTS.map((sp) => (
                <button
                  key={sp.title}
                  onClick={() => {
                    setPrompt(sp.prompt);
                    setTone(sp.tone);
                    setFormat(sp.format);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isDark
                      ? 'bg-stone-950/60 border-stone-800 hover:border-amber-700/80'
                      : 'bg-white border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div className="font-medium text-xs text-amber-700 dark:text-amber-400 mb-0.5 truncate">
                    {sp.title}
                  </div>
                  <div className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {sp.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Prompt */}
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Core Prompt & Thesis <span className="text-amber-600">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to explore or argue? (e.g. Write an essay analyzing why slow reading has become a radical act in an algorithmic age...)"
              rows={3}
              className={`w-full p-3.5 rounded-xl border outline-none text-xs sm:text-sm leading-relaxed transition-all ${
                isDark
                  ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder:text-stone-500 focus:border-amber-500'
                  : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600'
              }`}
            />
          </div>

          {/* Tone & Format Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                Tone & Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none text-xs sm:text-sm cursor-pointer ${
                  isDark
                    ? 'bg-stone-950 border-stone-800 text-stone-200'
                    : 'bg-white border-stone-300 text-stone-800'
                }`}
              >
                <option value="Thoughtful & Essayistic">Thoughtful & Essayistic</option>
                <option value="Sharp & Provocative">Sharp & Provocative</option>
                <option value="Conversational Newsletter">Conversational Newsletter</option>
                <option value="Executive & Strategic">Executive & Strategic</option>
                <option value="Poetic & Sensory">Poetic & Sensory</option>
                <option value="Analytical & Academic">Analytical & Academic</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border outline-none text-xs sm:text-sm cursor-pointer ${
                  isDark
                    ? 'bg-stone-950 border-stone-800 text-stone-200'
                    : 'bg-white border-stone-300 text-stone-800'
                }`}
              >
                <option value="Longform Essay">Longform Essay</option>
                <option value="Newsletter Post">Newsletter Post</option>
                <option value="Strategic Memo">Strategic Memo</option>
                <option value="Speech / Talk">Speech / Keynote Talk</option>
                <option value="Deep-Dive Article">Deep-Dive Article</option>
              </select>
            </div>
          </div>

          {/* File Attachments (Reference materials) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                File Attachments (Grounding Materials)
              </label>
              <span className="text-[11px] text-stone-400">PDFs, notes, markdown, images</span>
            </div>

            {/* Drop zone / Upload trigger */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDark
                  ? 'border-stone-800 hover:border-amber-600 bg-stone-950/40'
                  : 'border-stone-300 hover:border-amber-500 bg-stone-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.pdf,.csv,.json,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1.5" />
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Click to attach reference files or drag & drop here
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                AI will cite and weave insights from your documents
              </p>
            </div>

            {/* Attached files chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${
                      isDark
                        ? 'bg-stone-950 border-stone-800 text-stone-300'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    {att.mimeType.startsWith('image/') ? (
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                    )}
                    <span className="max-w-[150px] truncate">{att.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAttachment(idx);
                      }}
                      className="text-stone-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scratch notes */}
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Personal Scratch Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any key arguments, anecdotes, quotes, or counterpoints you specifically want included..."
              rows={2}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs leading-relaxed transition-all ${
                isDark
                  ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder:text-stone-500'
                  : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
              }`}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateDraft}
            disabled={isLoading || !prompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Crafting Piece with Thought Partner...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Draft</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
