import { useState, useRef, useCallback, useEffect } from "react";

export type VoiceLang = "fa-IR" | "en-US";

const LANG_KEY = "tradermind_voice_lang";

export function getStoredVoiceLang(): VoiceLang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === "fa-IR" || v === "en-US") return v;
  } catch {}
  return "fa-IR";
}

export function setStoredVoiceLang(lang: VoiceLang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
}

interface UseVoiceInputOptions {
  lang?: VoiceLang;
  onStart?: () => void;
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
  lang = "fa-IR",
  onStart,
  onResult,
  onError,
  onEnd,
}: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);

  const [isSupported] = useState(
    () => typeof window !== "undefined" && !!getSR(),
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const shouldRestartRef = useRef(false);

  const finalTranscriptRef = useRef("");

  const onStartRef = useRef(onStart);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const createRecognition = useCallback((voiceLang: VoiceLang) => {
    const SR = getSR();

    if (!SR) return null;

    const rec = new SR();

    rec.lang = voiceLang;

    // مهم
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      onStartRef.current?.();
    };

    rec.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      const text = (finalTranscriptRef.current + interim).trim();

      onResultRef.current(text, interim.length === 0);
    };

    rec.onerror = (event) => {
      const err = (event as SpeechRecognitionErrorEvent).error;

      if (err === "aborted") return;

      if (err === "no-speech") {
        return;
      }

      onErrorRef.current?.(err);
    };

    rec.onend = () => {
      recognitionRef.current = null;

      if (shouldRestartRef.current) {
        const newRec = createRecognition(voiceLang);

        if (newRec) {
          recognitionRef.current = newRec;

          try {
            newRec.start();
            return;
          } catch {}
        }
      }

      setIsListening(false);

      onEndRef.current?.();
    };

    return rec;
  }, []);

  const start = useCallback(
    (overrideLang?: VoiceLang) => {
      if (recognitionRef.current) return;

      shouldRestartRef.current = true;

      finalTranscriptRef.current = "";

      const rec = createRecognition(overrideLang ?? lang);

      if (!rec) return;

      recognitionRef.current = rec;

      try {
        rec.start();
      } catch (e) {
        recognitionRef.current = null;
        shouldRestartRef.current = false;
        setIsListening(false);
      }
    },
    [lang, createRecognition],
  );

  const stop = useCallback(() => {
    shouldRestartRef.current = false;

    recognitionRef.current?.stop();

    recognitionRef.current = null;

    setIsListening(false);
  }, []);

  const toggle = useCallback(
    (overrideLang?: VoiceLang) => {
      if (isListening) stop();
      else start(overrideLang);
    },
    [isListening, start, stop],
  );

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    isSupported,
    start,
    stop,
    toggle,
  };
}
