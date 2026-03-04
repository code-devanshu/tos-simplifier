import { NextRequest } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';
import { analyzeDocument } from '@/lib/geminiClient';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, text, apiKey } = body as { url?: string; text?: string; apiKey?: string };

  if (!url && !text) {
    return new Response(
      JSON.stringify({ type: 'error', code: 'Either a URL or text is required.' }) + '\n',
      { status: 400, headers: { 'Content-Type': 'application/x-ndjson' } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
        } catch {
          // controller already closed (client disconnected)
        }
      };

      try {
        let content: string;

        if (url) {
          content = await scrapeUrl(url, (step) => {
            console.log('[route] Scraping progress — step:', step);
            send({ type: 'progress', step });
          });
          console.log('[route] Scraping done — chars:', content.length);
          send({ type: 'progress', step: 3 }); // "Gemini is analyzing" (URL mode step 3)
        } else {
          send({ type: 'progress', step: 0 }); // "Processing your document"
          content = text!.trim();
          console.log('[route] Text mode — chars:', content.length);
          send({ type: 'progress', step: 1 }); // "Gemini is analyzing" (text mode step 1)
        }

        if (!content) {
          send({ type: 'error', code: 'No content to analyze.' });
          return;
        }

        console.log('[route] Calling Gemini...');
        const result = await analyzeDocument(content, apiKey);
        console.log('[route] Gemini done — sections:', result.sections?.length);
        send({ type: 'result', data: result });
      } catch (error) {
        const code =
          error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        console.error('[route] Error:', code);
        send({ type: 'error', code });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
