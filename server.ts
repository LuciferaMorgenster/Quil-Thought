import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Server-side Gemini initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. Initial Draft Generation from Prompt and optional File Attachments
 */
app.post('/api/gemini/draft', async (req: Request, res: Response) => {
  try {
    const { prompt, tone, format, notes, attachments } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const systemInstruction = `You are a world-class literary collaborator, thought partner, and master essayist.
Your goal is to write a compelling, deeply resonant, human-feeling draft based on the user's brief and reference materials.
Guidelines:
- Avoid generic AI buzzwords ("delve", "testament", "tapestry", "leverage", "in conclusion").
- Write with cadence, intellectual curiosity, vivid metaphors, and sharp pacing.
- Format with clean Markdown headers, subtle emphasis, and natural paragraph breaks.
- Tone requested: ${tone || 'Thoughtful, clear, and engaging'}.
- Format requested: ${format || 'Essay / Article'}.
- Do NOT output conversational chatter or introductory remarks like "Here is your draft". Return ONLY the finished draft title and content.`;

    const parts: any[] = [];

    // Add attachments if provided (supports text, markdown, base64 images/docs)
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att.mimeType && att.data) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
        } else if (att.content) {
          parts.push({
            text: `[Attachment: ${att.name || 'Reference File'}]\n${att.content}\n---`,
          });
        }
      }
    }

    let userPromptText = `User Request:\n"${prompt}"\n`;
    if (notes) {
      userPromptText += `\nAdditional Writer Notes:\n${notes}\n`;
    }
    parts.push({ text: userPromptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
      },
    });

    const fullText = response.text || '';
    
    // Extract title if present in markdown (# Title)
    let title = 'Untitled Piece';
    let content = fullText;
    const titleMatch = fullText.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      // derive short title
      const firstLine = fullText.split('\n')[0].replace(/[*#]/g, '').trim();
      if (firstLine.length > 0 && firstLine.length < 60) {
        title = firstLine;
      } else {
        title = prompt.slice(0, 40) + '...';
      }
    }

    res.json({
      title,
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    });
  } catch (error: any) {
    console.error('Error generating draft:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate draft.' });
  }
});

/**
 * 2. In-situ Iteration & Smart Weave (solving the copy-paste chat pain point)
 */
app.post('/api/gemini/iterate', async (req: Request, res: Response) => {
  try {
    const {
      fullDocument,
      targetExcerpt,
      feedback,
      scope, // 'selection' | 'paragraph' | 'smart_weave' | 'full_document'
      actionType,
    } = req.body;

    if (!feedback && !actionType) {
      res.status(400).json({ error: 'Feedback or action is required.' });
      return;
    }

    const systemInstruction = `You are an elite prose editor and thought partner working directly inside a writer's document.
The user is providing inline feedback on a specific section.
CRITICAL MANDATE:
- The writer is replacing the tedious workflow of copying text out to a chat app.
- Provide the rewritten version that weaves their feedback directly into the piece.
- Tone should match the surrounding writing style seamlessly.
- If scope is 'smart_weave', ensure the transition before and after the excerpt flows like silk without disjointed phrasing.
- Return structured JSON with:
  - "revisedTarget": The newly rewritten version of the target text (or paragraph).
  - "diffSummary": A 1-2 sentence scannable summary of what you changed and why it elevates the piece.
  - "revisedDocument": If scope is 'smart_weave' or 'full_document', provide the entire document with the revision woven in. Otherwise, return null or empty string.
  - "suggestedAlternatives": 2 alternative short variations (e.g. one more punchy, one more evocative).`;

    const promptText = `
Document Context:
\"\"\"
${fullDocument || targetExcerpt}
\"\"\"

Target Section to Iterate:
\"\"\"
${targetExcerpt}
\"\"\"

User's Direct Feedback:
"${feedback || actionType}"

Requested Scope:
${scope || 'smart_weave'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revisedTarget: {
              type: Type.STRING,
              description: 'The rewritten text replacing the target excerpt or paragraph.',
            },
            diffSummary: {
              type: Type.STRING,
              description: 'Brief explanation of changes made.',
            },
            revisedDocument: {
              type: Type.STRING,
              description: 'The complete document with the changes woven in, if requested scope is smart_weave or full_document.',
            },
            suggestedAlternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Two alternative variations of the revised excerpt.',
            },
          },
          required: ['revisedTarget', 'diffSummary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error iterating on text:', error);
    res.status(500).json({ error: error?.message || 'Failed to iterate on text.' });
  }
});

/**
 * 3. Proactive Thought Partner Critique (Margin Sparks & Suggestions)
 */
app.post('/api/gemini/proactive-critique', async (req: Request, res: Response) => {
  try {
    const { documentContent, title } = req.body;

    if (!documentContent || documentContent.trim().length < 40) {
      res.json({ suggestions: [] });
      return;
    }

    const systemInstruction = `You are a perceptive, generous literary thought partner and editor reading the user's active draft.
Identify 2 to 4 high-leverage opportunities to sharpen the piece.
Focus on:
1. "flow": Abrupt transitions or places where pacing drags.
2. "punch": Flabby adjectives, passive construction, or a missed climax.
3. "counterpoint": A critical reader's unaddressed objection or nuanced angle.
4. "vividness": Abstract statements that need a sensory anchor or real-world vignette.
5. "hook": Opening or closing resonance.

For each insight:
- targetExcerpt: Exact substring from the document (must match word for word so it can be highlighted in the UI). Keep it between 5 and 35 words.
- title: Short 2-4 word punchy label (e.g. "Abrupt leap", "Strengthen cadence", "Anticipate objection", "Sharpen closing hook").
- insight: 1-2 sentence thoughtful observation as a peer writer.
- proposedReplacement: An elevated rewrite of targetExcerpt that solves the critique.
- type: one of "flow" | "punch" | "counterpoint" | "vividness" | "hook".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Draft Title: ${title || 'Untitled'}\n\nDocument Text:\n${documentContent}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  targetExcerpt: { type: Type.STRING },
                  insight: { type: Type.STRING },
                  proposedReplacement: { type: Type.STRING },
                },
                required: ['type', 'title', 'targetExcerpt', 'insight', 'proposedReplacement'],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"suggestions":[]}');
    
    // Add unique IDs if not provided
    const suggestions = (parsed.suggestions || []).map((s: any, idx: number) => ({
      id: s.id || `sugg-${Date.now()}-${idx}`,
      ...s,
    }));

    res.json({ suggestions });
  } catch (error: any) {
    console.error('Error getting proactive critique:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate critiques.' });
  }
});

/**
 * 4. "Continue Writing" / Unblocker for when writer is stuck
 */
app.post('/api/gemini/continue', async (req: Request, res: Response) => {
  try {
    const { documentContent, cursorContext } = req.body;

    const systemInstruction = `You are a creative thought partner helping a writer overcome writer's block.
Provide three distinct, high-quality directions the writer could take from this exact moment in their text.
Directions:
1. "Deeper Analysis": Unpack the underlying mechanism or philosophical question.
2. "Vivid Story / Vignette": Ground the thought in a concrete narrative moment or example.
3. "Provocative Turn": A counter-intuitive realization or bold stance.

Return JSON with an array of directions:
- title: Short direction name
- continuationText: A beautifully composed paragraph (50-100 words) ready to be dropped into the draft
- whyItWorks: One sentence explaining the literary momentum.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Full context so far:\n${documentContent}\n\nImmediate cursor text:\n${cursorContext || ''}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  continuationText: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING },
                },
                required: ['title', 'continuationText', 'whyItWorks'],
              },
            },
          },
          required: ['paths'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"paths":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error continuing draft:', error);
    res.status(500).json({ error: error?.message || 'Failed to provide continuation.' });
  }
});

// Vite Middleware integration for Full-Stack development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Quill & Thought] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
