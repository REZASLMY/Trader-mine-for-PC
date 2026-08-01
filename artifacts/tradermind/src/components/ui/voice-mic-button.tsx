import * as React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredVoiceLang, setStoredVoiceLang } from '@/hooks/useVoiceInput';
import type { VoiceLang } from '@/hooks/useVoiceInput';

interface VoiceMicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onToggle: (lang: VoiceLang) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export function VoiceMicButton({
  isListening,
  isSupported,
  onToggle,
  className,
  size = 'sm',
}: VoiceMicButtonProps) {
  const [lang, setLang] = React.useState<VoiceLang>(getStoredVoiceLang);
  const iconSize = size === 'xs' ? 10 : size === 'sm' ? 13 : 15;
  const btnSize = size === 'xs' ? 'h-5 w-5' : size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';

  function handleMicClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isSupported) onToggle(lang);
  }

  function handleLangClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isSupported) return;
    const next: VoiceLang = lang === 'fa-IR' ? 'en-US' : 'fa-IR';
    setLang(next);
    setStoredVoiceLang(next);
    if (isListening) {
      onToggle(lang);
      setTimeout(() => onToggle(next), 80);
    }
  }

  return (
    <span
      className={cn('inline-flex items-center gap-0.5 shrink-0', className)}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* ── دکمه میکروفون ── */}
      <button
        type="button"
        aria-label={isListening ? 'توقف تایپ صوتی' : 'تایپ صوتی'}
        title={
          !isSupported
            ? 'مرورگر شما از تایپ صوتی پشتیبانی نمی‌کند'
            : isListening
              ? 'کلیک کنید تا متوقف شود'
              : 'کلیک کنید تا تایپ صوتی شروع شود'
        }
        onClick={handleMicClick}
        disabled={!isSupported}
        className={cn(
          btnSize,
          'rounded-full flex items-center justify-center transition-all duration-150 select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !isSupported && 'opacity-30 cursor-not-allowed',
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse'
            : isSupported
              ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer'
              : '',
        )}
      >
        {isListening
          ? <MicOff size={iconSize} strokeWidth={2.5} />
          : <Mic size={iconSize} strokeWidth={2.5} />
        }
      </button>

      {/* ── toggle زبان ── */}
      <button
        type="button"
        title={lang === 'fa-IR' ? 'تغییر به انگلیسی' : 'تغییر به فارسی'}
        onClick={handleLangClick}
        disabled={!isSupported}
        className={cn(
          'text-[9px] font-bold leading-none px-0.5 rounded select-none',
          'transition-colors focus:outline-none',
          !isSupported && 'opacity-30 cursor-not-allowed',
          isListening
            ? 'text-red-400'
            : 'text-muted-foreground/50 hover:text-muted-foreground',
        )}
      >
        {lang === 'fa-IR' ? 'FA' : 'EN'}
      </button>
    </span>
  );
}
