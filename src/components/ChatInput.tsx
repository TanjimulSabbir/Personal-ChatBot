import { useEffect, useRef, useState } from "react";

type Props = { onSend: (text: string) => void; disabled: boolean };

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // লেখা বাড়লে textarea-র উচ্চতাও বাড়ুক (সর্বোচ্চ ১৬০px)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [text]);

  function submit() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="border-t border-white/10 bg-slate-950/70 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/10 bg-slate-900 p-2 focus-within:border-indigo-400/50">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="মেসেজ লেখো..."
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 outline-none placeholder:text-slate-500"
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="পাঠাও"
        >
          ↑
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-600">
        Enter = পাঠাও · Shift + Enter = নতুন লাইন
      </p>
    </div>
  );
}