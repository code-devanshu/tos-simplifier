// Browser-like headers to reduce bot-detection rejections
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
};

// Status codes that reliably indicate bot/access blocking
const BOT_BLOCK_STATUSES = new Set([401, 403, 407, 406]);

// Page-content signals that indicate the site blocked the request
const BOT_BLOCK_PATTERNS = [
  /access denied/i,
  /bot detected/i,
  /cloudflare/i,
  /just a moment/i,       // Cloudflare challenge
  /checking your browser/i,
  /please enable javascript/i,
  /enable cookies/i,
  /captcha/i,
  /robot or human/i,
  /automated access/i,
  /unusual traffic/i,
  /403 forbidden/i,
];

// NOTE: visibleText must already be HTML-stripped before calling this.
// Never pass raw HTML — attribute values (e.g. CSP content="...recaptcha...")
// can contain pattern keywords and cause false positives.
function isBotBlocked(status: number, visibleText: string): boolean {
  if (BOT_BLOCK_STATUSES.has(status)) {
    console.log('[scraper:bot-check] Blocked by HTTP status:', status);
    return true;
  }
  const matched = BOT_BLOCK_PATTERNS.find((re) => re.test(visibleText));
  if (matched) {
    console.log('[scraper:bot-check] Blocked by pattern:', matched.toString());
    console.log('[scraper:bot-check] Visible text sample:\n', visibleText.slice(0, 400));
    return true;
  }
  return false;
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Attempt 1 — Jina AI Reader (renders JS, bypasses most anti-bot protection, free, no API key).
 */
async function tryJinaReader(url: string): Promise<string | null> {
  // Pass Jina's own timeout so it gives up at 15s and returns empty rather
  // than keeping our connection open for 30s on CAPTCHA-protected sites.
  const jinaUrl = `https://r.jina.ai/${url}?timeout=15`;
  console.log('[scraper:jina] Fetching →', jinaUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000); // hard abort if Jina ignores its own timeout
  try {
    const res = await fetch(jinaUrl, {
      headers: { Accept: 'text/plain', 'X-Return-Format': 'text' },
      signal: controller.signal,
    });
    console.log('[scraper:jina] Status:', res.status);
    if (!res.ok) {
      console.log('[scraper:jina] Failed — non-OK status, falling through');
      return null;
    }
    const text = (await res.text()).trim();
    // Jina signals failure via "Error:" prefix, CAPTCHA warnings, or near-empty body
    const isJinaError =
      text.startsWith('Error:') ||
      text.length < 200 ||
      /Warning:.*CAPTCHA/i.test(text.slice(0, 500)) ||
      /Markdown Content:\s*$/.test(text); // empty markdown body = no content fetched
    if (isJinaError) {
      console.log('[scraper:jina] Failed — error/captcha/empty.\nPreview:\n', text.slice(0, 300));
      return null;
    }
    // Jina prepends metadata headers (Title, URL Source, Warning, Markdown Content:).
    // Extract only the actual content after "Markdown Content:" to avoid sending
    // noise to Gemini and wasting tokens.
    const contentMarker = text.indexOf('Markdown Content:');
    const content = contentMarker !== -1
      ? text.slice(contentMarker + 'Markdown Content:'.length).trim()
      : text;

    if (content.length < 200) {
      console.log('[scraper:jina] Content after stripping headers too short:', content.length);
      return null;
    }

    console.log('[scraper:jina] Success — raw chars:', text.length, '→ content chars:', content.length);
    return content.slice(0, 50_000);
  } catch (err) {
    console.log('[scraper:jina] Threw:', err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Attempt 2 — article-extractor with browser headers.
 */
async function tryArticleExtractor(url: string): Promise<string | null> {
  console.log('[scraper:article-extractor] Trying →', url);
  try {
    const { extract } = await import('@extractus/article-extractor');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const article = await extract(url, {}, { headers: BROWSER_HEADERS } as any);
    if (!article?.content) {
      console.log('[scraper:article-extractor] No content returned');
      return null;
    }
    const text = htmlToText(article.content);
    if (text.length < 200) {
      console.log('[scraper:article-extractor] Content too short after stripping:', text.length);
      return null;
    }
    console.log('[scraper:article-extractor] Success — chars:', text.length);
    return text;
  } catch (err) {
    console.log('[scraper:article-extractor] Threw:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Attempt 3 — raw fetch with browser headers, manual HTML → text.
 */
async function tryRawFetch(url: string): Promise<string> {
  console.log('[scraper:raw-fetch] Trying →', url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const cause = err instanceof Error ? ((err as NodeJS.ErrnoException).cause as Error | undefined) : undefined;
    const causeMsg = cause?.message ?? '';
    const errMsg   = err instanceof Error ? err.message : '';
    console.log('[scraper:raw-fetch] Network error:', errMsg, '| cause:', causeMsg);
    throw new Error('BOT_BLOCKED');
  } finally {
    clearTimeout(timer);
  }

  const html = await res.text();
  // Strip HTML first, THEN check patterns — this prevents false positives from
  // raw HTML attribute values (e.g. CSP meta tag content="...recaptcha...").
  const text = htmlToText(html);
  console.log('[scraper:raw-fetch] Status:', res.status, '| visible text preview:\n', text.slice(0, 300));

  if (isBotBlocked(res.status, text)) {
    throw new Error('BOT_BLOCKED');
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — the server refused the request.`);
  }

  if (text.length < 200) {
    console.log('[scraper:raw-fetch] Content too short after stripping — likely JS-gated');
    throw new Error('BOT_BLOCKED');
  }

  console.log('[scraper:raw-fetch] Success — chars:', text.length);
  return text;
}

export async function scrapeUrl(
  url: string,
  onProgress: (step: number) => void,
): Promise<string> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('Invalid URL. Please enter a valid URL starting with http:// or https://');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  console.log('[scraper] Starting scrape for:', url);

  // Step 0 — connecting
  onProgress(0);

  // Attempts 1 & 2 — Jina AI Reader + article extractor in parallel.
  // We use whichever returns a valid result first; if both fail we fall through.
  onProgress(1);
  const earlyResult = await new Promise<string | null>((resolve) => {
    let remaining = 2;
    const done = (result: string | null) => {
      if (result) { resolve(result); return; }
      if (--remaining === 0) resolve(null);
    };
    tryJinaReader(url).then(done).catch(() => done(null));
    tryArticleExtractor(url).then(done).catch(() => done(null));
  });
  if (earlyResult) return earlyResult;

  // Attempt 3 — raw fetch (throws BOT_BLOCKED on failure)
  onProgress(2);
  return tryRawFetch(url);
}
