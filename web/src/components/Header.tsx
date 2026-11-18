import type { ReactNode } from "react";

type Props = {
  onClear: () => void;
  hasMessages: boolean;
  children?: ReactNode; // এখানে ModelSelector বসবে
};

export default function Header({ onClear, hasMessages, children }: Props) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/70 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg shadow-lg shadow-indigo-500/20">
          🤖
        </div>
        <h1 className="hidden text-base font-semibold sm:block">আমার AI সহায়ক</h1>
      </div>

      <div className="flex items-center gap-2">
        {children}
        {hasMessages && (
          <button
            onClick={onClear}
            className="h-9 rounded-lg border border-white/10 px-3 text-sm text-slate-300 transition hover:bg-white/5"
          >
            নতুন চ্যাট
          </button>
        )}
      </div>
    </header>
  );
}