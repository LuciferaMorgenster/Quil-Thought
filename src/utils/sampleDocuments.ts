import { Document } from '../types';

export const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: 'doc-slow-thinking',
    title: 'The Architecture of Slow Thinking',
    content: `# The Architecture of Slow Thinking

Most intellectual mistakes in modern work do not come from a lack of intelligence. They come from an addiction to velocity.

We pride ourselves on rapid Slack replies, snappy meeting takeaways, and turning around briefs within an afternoon. We celebrate the sprint, but profound insight operates on geological time.

When you draft an idea quickly, you are not capturing your best thoughts. You are capturing the nearest thoughts—the cultural clichés, the predictable analogies, and the surface-level consensus that floated to the top of your mind like driftwood.

To write something enduring, you have to let the initial sediment settle.

Consider how architects work. An architect does not pour concrete five minutes after receiving the client brief. They sketch loosely. They observe how sunlight hits the terrain at four in the afternoon. They revisit the draft after sleeping on it. The pause is not lost time; the pause is where judgment forms.

If we want our writing to cut through the noise, we must reclaim the slow edit. Not the agonizing delay of procrastination, but the deliberate, patient carving of thought until only the essential structure remains.`,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    wordCount: 172,
    readingTimeMinutes: 1,
    versions: [
      {
        id: 'v-1',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        label: 'Initial Draft from brief',
        content: `# The Architecture of Slow Thinking\n\nMost mistakes in modern work come from speed.\nWe pride ourselves on fast replies. But insight takes time.\nWhen you write fast, you get cliché thoughts.\n\nArchitects take time to design buildings before pouring concrete.\nWe should do the same with our essays.`,
        wordCount: 48,
      },
    ],
  },
  {
    id: 'doc-good-taste',
    title: 'Why Taste is the Last Defensible Moat',
    content: `# Why Taste is the Last Defensible Moat

When generation becomes virtually free, selection becomes priceless.

We have arrived at a moment where generating code, copy, and visual art requires zero marginal effort. Anyone with an internet connection can prompt a dozen variations in thirty seconds. But an abundance of options creates a desert of discrimination.

What separates a generic product from an iconic artifact is never the speed of generation. It is the ruthless, quiet curation of what to discard.

Taste is not a mysterious gift bestowed upon chosen aesthetes. It is an accumulated library of high-resolution opinions. It is knowing why a particular adjective feels dishonest, why a thirty-pixel margin feels cramped, and why a certain silence in a conversation speaks louder than an explanation.

As tools grow more powerful, the most valuable person in the room will not be the one who generates the most raw drafts, but the one whose internal compass knows precisely when something has earned the right to exist.`,
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    wordCount: 161,
    readingTimeMinutes: 1,
    versions: [],
  },
  {
    id: 'doc-founder-note',
    title: 'The Art of the Clean Rewrite',
    content: `# The Art of the Clean Rewrite

Writers often treat their early sentences like sacred relics. Having wrestled a sentence onto the blank page, we feel a strange emotional debt to keep it alive, even when it drags down the entire paragraph.

The greatest leap in my own writing happened when I learned to throw away good sentences in service of great momentum.

A sentence might be lyrical, witty, and clever in isolation, but if it acts as a speed bump in the central argument, it has to go. Great editing is not cosmetic surgery; it is structural engineering.

When you invite a thought partner to challenge your prose, do not ask them to polish your tarnished words. Ask them where your argument falters, where your rhythm stumbles, and where your courage failed you.`,
    createdAt: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    wordCount: 133,
    readingTimeMinutes: 1,
    versions: [],
  },
];
