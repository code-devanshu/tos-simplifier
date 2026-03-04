'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Eye, EyeOff, X, Check, ExternalLink, KeyRound, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'gemini-api-key';

export function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [keyValue, setKeyValue] = useState('');
  const [saved, setSaved] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setSaved(localStorage.getItem(STORAGE_KEY) ?? '');
  }, []);

  useEffect(() => {
    if (open) {
      setKeyValue(saved);
      setShowKey(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, saved]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSave = () => {
    const trimmed = keyValue.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    setSaved(trimmed);
    setJustSaved(true);
    window.dispatchEvent(new Event('gemini-key-changed'));
    setTimeout(() => {
      setJustSaved(false);
      setOpen(false);
    }, 900);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSaved('');
    setKeyValue('');
    window.dispatchEvent(new Event('gemini-key-changed'));
  };

  const hasKey = saved.length > 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
          hasKey
            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        )}
        title={hasKey ? 'API key set — click to change' : 'Set your Gemini API key'}
      >
        <KeyRound className="w-4 h-4" />
        <span className="hidden sm:inline">{hasKey ? 'Key set' : 'API Key'}</span>
        {hasKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
      </button>

      {/* Portal — renders directly on body, escaping navbar's stacking context */}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Modal card */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-slate-100 font-semibold text-base">Gemini API Key</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Required to run analyses</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-6 space-y-5">
                {/* Info banner */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs leading-relaxed">
                  <Settings className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
                  <span>
                    Your key is stored only in your browser&apos;s localStorage and sent directly
                    to Gemini — it never touches any third-party server.
                  </span>
                </div>

                {/* Input */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs font-medium">API Key</label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type={showKey ? 'text' : 'password'}
                      value={keyValue}
                      onChange={(e) => setKeyValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      placeholder="AIza…"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status */}
                {hasKey && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>Key is saved — analyses will use this key.</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={!keyValue.trim() || justSaved}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-150',
                      justSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {justSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      'Save Key'
                    )}
                  </button>

                  {hasKey && (
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/60 text-sm transition-all duration-150"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Get key link */}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                >
                  Get a free Gemini API key at Google AI Studio
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
