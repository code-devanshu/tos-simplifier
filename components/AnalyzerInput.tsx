"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Link,
  FileText,
  Zap,
  AlertCircle,
  Loader2,
  KeyRound,
  ExternalLink,
  AlertTriangle,
  ShieldOff,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";
import { CinematicLoader } from "./CinematicLoader";

type Tab = "url" | "text";

type ErrorState =
  | { type: "rate_limit" }
  | { type: "bot_blocked" }
  | { type: "generic"; message: string }
  | null;

function RateLimitBanner() {
  return (
    <div className="mt-3 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-900/50 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-amber-300 font-semibold text-sm">
            Rate Limit Reached (429)
          </p>
          <p className="text-amber-400/80 text-xs mt-0.5 leading-relaxed">
            Your current API key has hit the free-tier quota. Google resets
            limits daily, but you can get back to analyzing right now by using a
            fresh key.
          </p>
        </div>
      </div>

      <div className="border-t border-amber-900/40 pt-3 space-y-2">
        <p className="text-amber-400 text-xs font-medium">How to fix this:</p>
        <ol className="space-y-1.5 text-amber-400/80 text-xs list-none">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            Sign in to Google AI Studio with a{" "}
            <strong className="text-amber-300">different Gmail account</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            Create a new free API key there.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            Paste it using the{" "}
            <strong className="text-amber-300">API Key</strong> button in the
            top bar.
          </li>
        </ol>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-900/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-medium transition-all duration-150"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Google AI Studio
        </a>
        <button
          onClick={() => {
            const btn =
              document.querySelector<HTMLButtonElement>('[title*="API key"]');
            btn?.click();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-800/40 text-amber-400/70 hover:text-amber-300 hover:border-amber-800/60 text-xs transition-all duration-150"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Update API Key
        </button>
      </div>
    </div>
  );
}

function BotBlockedBanner({ onSwitchToText }: { onSwitchToText: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-violet-800/60 bg-violet-950/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-900/50 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldOff className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="text-violet-300 font-semibold text-sm">
            Site Blocked Automated Access
          </p>
          <p className="text-violet-400/80 text-xs mt-0.5 leading-relaxed">
            This website uses bot protection (Cloudflare, login walls, or
            JavaScript challenges) that prevents automated fetching. This is
            common for major platforms.
          </p>
        </div>
      </div>

      <div className="border-t border-violet-900/40 pt-3 space-y-2">
        <p className="text-violet-400 text-xs font-medium">
          How to analyze it anyway:
        </p>
        <ol className="space-y-1.5 text-violet-400/80 text-xs list-none">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            Open the Terms of Service page in your browser.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-violet-900/60 border border-violet-800/60 text-violet-200 font-mono text-[10px]">
              Ctrl+A
            </kbd>{" "}
            then{" "}
            <kbd className="px-1 py-0.5 rounded bg-violet-900/60 border border-violet-800/60 text-violet-200 font-mono text-[10px]">
              Ctrl+C
            </kbd>{" "}
            to copy all text.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-violet-900/60 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            Switch to <strong className="text-violet-300">Paste Text</strong>{" "}
            mode below and paste it in.
          </li>
        </ol>
      </div>

      <button
        onClick={onSwitchToText}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-xs font-medium transition-all duration-150 w-full justify-center"
      >
        <ClipboardPaste className="w-3.5 h-3.5" />
        Switch to Paste Text Mode
      </button>
    </div>
  );
}

export function AnalyzerInput() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<ErrorState>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const check = () => setHasApiKey(!!localStorage.getItem("gemini-api-key"));
    check();
    window.addEventListener("gemini-key-changed", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("gemini-key-changed", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  const switchToText = () => {
    setTab("text");
    setError(null);
    setValue("");
  };

  const handleAnalyze = async () => {
    if (!value.trim()) {
      setError({
        type: "generic",
        message:
          tab === "url"
            ? "Please enter a URL."
            : "Please paste some text to analyze.",
      });
      return;
    }

    setError(null);
    setStep(0);
    setLoading(true);

    try {
      const apiKey = localStorage.getItem("gemini-api-key") ?? undefined;
      const base =
        tab === "url" ? { url: value.trim() } : { text: value.trim() };
      const body = { ...base, ...(apiKey ? { apiKey } : {}) };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.body) throw new Error("No response body received.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: AnalysisResult | null = null;
      let errorCode: string | null = null;

      // Read the NDJSON stream line by line
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep any incomplete trailing line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as
              | { type: "progress"; step: number }
              | { type: "result"; data: AnalysisResult }
              | { type: "error"; code: string };

            if (event.type === "progress") {
              setStep(event.step);
            } else if (event.type === "result") {
              result = event.data;
            } else if (event.type === "error") {
              errorCode = event.code;
            }
          } catch {
            // ignore malformed lines
          }
        }
      }

      if (errorCode) {
        if (errorCode === "RATE_LIMIT") {
          setError({ type: "rate_limit" });
        } else if (errorCode === "BOT_BLOCKED") {
          setError({ type: "bot_blocked" });
        } else {
          setError({ type: "generic", message: errorCode });
        }
        return;
      }

      if (!result) {
        setError({
          type: "generic",
          message: "No result received. Please try again.",
        });
        return;
      }

      // Save to localStorage history
      try {
        const source = tab === "url" ? value.trim() : "Pasted Text";
        const historyItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          source,
          result,
        };
        const existing = JSON.parse(
          localStorage.getItem("legal-analyzer-history") ?? "[]",
        );
        localStorage.setItem(
          "legal-analyzer-history",
          JSON.stringify([historyItem, ...existing].slice(0, 50)),
        );
      } catch {
        // localStorage might be blocked — ignore
      }

      sessionStorage.setItem("legal-analyzer-pending", JSON.stringify(result));
      if (tab === "url")
        sessionStorage.setItem("legal-analyzer-pending-source", value.trim());
      else sessionStorage.removeItem("legal-analyzer-pending-source");
      router.push("/results");
    } catch (err) {
      setError({
        type: "generic",
        message:
          err instanceof Error
            ? err.message
            : "Network error. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const placeholder =
    tab === "url"
      ? "https://example.com/terms-of-service"
      : "Paste the full Terms of Service or Privacy Policy text here…";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab toggle */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 mb-4">
        {(["url", "text"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
              tab === t
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            {t === "url" ? (
              <Link className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {t === "url" ? "Paste URL" : "Paste Text"}
          </button>
        ))}
      </div>

      {/* Input */}
      {tab === "url" ? (
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAnalyze()}
          placeholder={placeholder}
          disabled={loading}
          className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          rows={8}
          className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none disabled:opacity-60"
        />
      )}

      {/* Character count for text mode */}
      {tab === "text" && value.length > 0 && (
        <p
          className={cn(
            "text-xs mt-1.5 text-right",
            value.length > 40000 ? "text-amber-400" : "text-slate-500",
          )}
        >
          {value.length.toLocaleString()} chars
          {value.length > 120000 &&
            " — very long, only first 120,000 chars will be analyzed"}
          {value.length > 40000 &&
            value.length <= 120000 &&
            " — long document, will be split across multiple AI calls"}
        </p>
      )}

      {/* Error states */}
      {error?.type === "rate_limit" && <RateLimitBanner />}
      {error?.type === "bot_blocked" && (
        <BotBlockedBanner onSwitchToText={switchToText} />
      )}
      {error?.type === "generic" && (
        <div className="mt-3 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !value.trim() || !hasApiKey}
        className="mt-4 w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing with AI…
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Analyze Document
          </>
        )}
      </button>

      {/* No API key hint */}
      {!hasApiKey && (
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          Set your{" "}
          <button
            onClick={() => {
              const btn =
                document.querySelector<HTMLButtonElement>('[title*="API key"]');
              btn?.click();
            }}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Gemini API key
          </button>{" "}
          to enable analysis.
        </p>
      )}

      {/* Cinematic loader — driven by real server progress, not timers */}
      {loading && <CinematicLoader step={step} mode={tab} />}
    </div>
  );
}
