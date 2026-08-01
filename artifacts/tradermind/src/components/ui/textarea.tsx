import * as React from 'react';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceMicButton } from '@/components/ui/voice-mic-button';
import { getStoredVoiceLang } from '@/hooks/useVoiceInput';
import type { VoiceLang } from '@/hooks/useVoiceInput';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  disableVoice?: boolean;
}

function setTextareaValue(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disableVoice, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const [activeLang, setActiveLang] = React.useState<VoiceLang>(getStoredVoiceLang);

    // مقدار متن قبل از شروع ضبط — برای append mode
    const savedValueRef = React.useRef('');
    const hasResultRef = React.useRef(false);

    const mergedRef = React.useCallback(
      (el: HTMLTextAreaElement | null) => {
        (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      },
      [ref],
    );

    // هنگام شروع ضبط: ذخیره متن فعلی
    const handleVoiceStart = React.useCallback(() => {
      savedValueRef.current = innerRef.current?.value ?? '';
      hasResultRef.current = false;
    }, []);

    // تایپ آنلاین: متن جدید به متن قبلی اضافه می‌شود (append mode)
    const handleVoiceResult = React.useCallback((text: string, _isFinal: boolean) => {
      const el = innerRef.current;
      if (!el) return;
      hasResultRef.current = true;
      const base = savedValueRef.current;
      const combined = base.trim() ? base.trimEnd() + ' ' + text : text;
      setTextareaValue(el, combined);
      // کرسر به انتها
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = el.value.length;
        el.scrollTop = el.scrollHeight;
      });
    }, []);

    // اگر بدون نتیجه تمام شد: برگرداندن متن قبلی
    const handleVoiceEnd = React.useCallback(() => {
      if (!hasResultRef.current) {
        const el = innerRef.current;
        if (el) setTextareaValue(el, savedValueRef.current);
      }
    }, []);

    const { isListening, isSupported, toggle } = useVoiceInput({
      lang: activeLang,
      onStart: handleVoiceStart,
      onResult: handleVoiceResult,
      onEnd: handleVoiceEnd,
    });

    const handleToggle = React.useCallback((lang: VoiceLang) => {
      setActiveLang(lang);
      toggle(lang);
    }, [toggle]);

    const baseClass = cn(
      'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    );

    if (disableVoice) {
      return <textarea className={cn(baseClass, className)} ref={mergedRef} {...props} />;
    }

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            baseClass,
            // فضای پایین برای نوار ابزار صوتی
            'pb-9',
            isListening && 'ring-1 ring-red-500 border-red-500/60',
            className,
          )}
          ref={mergedRef}
          {...props}
        />

        {/* ── نوار پایین textarea ── */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1 rounded-b-md border-t border-input/40 bg-muted/20">
          {/* وضعیت سمت چپ */}
          <span className="text-[10px] text-muted-foreground/50 select-none">
            {isListening
              ? <span className="flex items-center gap-1 text-red-500 font-medium animate-pulse">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  در حال گوش دادن...
                </span>
              : <span className="opacity-0">_</span>
            }
          </span>

          {/* دکمه میکروفون سمت راست */}
          <VoiceMicButton
            isListening={isListening}
            isSupported={isSupported}
            onToggle={handleToggle}
            size="sm"
          />
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export { Textarea };
