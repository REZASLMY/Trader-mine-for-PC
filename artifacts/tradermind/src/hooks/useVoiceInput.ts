import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceLang = 'fa-IR' | 'en-US';

// ── utils ذخیره زبان در localStorage ──────────────────────────────────────
const LANG_KEY = 'tradermind_voice_lang';

export function getStoredVoiceLang(): VoiceLang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'fa-IR' || v === 'en-US') return v as VoiceLang;
  } catch {}
  return 'fa-IR';
}

export function setStoredVoiceLang(lang: VoiceLang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
}

interface UseVoiceInputOptions {
  lang?: VoiceLang;
  /** هنگام شروع ضبط صدا */
  onStart?: () => void;
  /** نتیجه — هم interim (حین صحبت) هم final */
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

function getSR(): (new () => SpeechRecognition) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput({
  lang = 'fa-IR',
  onStart,
  onResult,
  onError,
  onEnd,
}: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && !!getSR());
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // همیشه به‌روزترین callback
  const onStartRef = useRef(onStart);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onStartRef.current = onStart; }, [onStart]);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const start = useCallback((overrideLang?: VoiceLang) => {
    const SR = getSR();
    if (!SR) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = overrideLang ?? lang;
    rec.continuous = false;
    rec.interimResults = true;   // ← آنلاین: نتایج حین صحبت
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      onStartRef.current?.();
    };

    rec.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      const transcript = result[0].transcript.trim();
      onResultRef.current(transcript, result.isFinal);
    };

    rec.onerror = (e) => {
      setIsListening(false);
      recognitionRef.current = null;
      const err = (e as SpeechRecognitionErrorEvent).error;
      if (err !== 'aborted' && err !== 'no-speech') onErrorRef.current?.(err);
    };

    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      onEndRef.current?.();
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch {
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [lang]);

  const toggle = useCallback((overrideLang?: VoiceLang) => {
    if (isListening) stop();
    else start(overrideLang);
  }, [isListening, start, stop]);

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  return { isListening, isSupported, start, stop, toggle };
}
