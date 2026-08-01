import * as React from 'react';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceMicButton } from '@/components/ui/voice-mic-button';
import { getStoredVoiceLang } from '@/hooks/useVoiceInput';
import type { VoiceLang } from '@/hooks/useVoiceInput';

// این انواع input تایپ صوتی ندارند
const SKIP_VOICE_TYPES = new Set([
  'number', 'password', 'email', 'hidden', 'file',
  'date', 'time', 'datetime-local', 'month', 'week',
  'color', 'range', 'checkbox', 'radio',
  'submit', 'button', 'reset', 'image',
]);

export interface InputProps extends React.ComponentProps<'input'> {
  disableVoice?: boolean;
}

// تنظیم مقدار input از طریق native setter تا React (و react-hook-form) onChange فعال شود
function setInputValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disableVoice, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const [activeLang, setActiveLang] = React.useState<VoiceLang>(getStoredVoiceLang);

    const mergedRef = React.useCallback(
      (el: HTMLInputElement | null) => {
        (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      },
      [ref],
    );

    // تایپ صوتی آنلاین: هم interim هم final — متن جایگزین می‌شود (replace mode)
    const handleVoiceResult = React.useCallback((text: string, _isFinal: boolean) => {
      const el = innerRef.current;
      if (el) setInputValue(el, text);
    }, []);

    const { isListening, isSupported, toggle } = useVoiceInput({
      lang: activeLang,
      onResult: handleVoiceResult,
    });

    const handleToggle = React.useCallback((lang: VoiceLang) => {
      setActiveLang(lang);
      toggle(lang);
    }, [toggle]);

    const showVoice = !disableVoice && !SKIP_VOICE_TYPES.has(type ?? 'text');

    // بدون دکمه صوتی برای انواع خاص
    if (!showVoice) {
      return (
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          )}
          ref={mergedRef}
          {...props}
        />
      );
    }

    // همیشه wrapper + میکروفون نمایش داده می‌شود (حتی اگر isSupported=false)
    return (
      <div className="relative flex w-full items-center">
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            // فضای راست برای دکمه میکروفون
            'pr-11',
            // حاشیه رنگی هنگام گوش دادن
            isListening && 'ring-1 ring-red-500 border-red-500/60',
            className,
          )}
          ref={mergedRef}
          {...props}
        />
        <VoiceMicButton
          isListening={isListening}
          isSupported={isSupported}
          onToggle={handleToggle}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10"
          size="sm"
        />
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };
