import { useEffect, useRef, useState } from "react";
import type { ModelInfo } from "../types/types";

type Props = {
  models: ModelInfo[];
  selected: string;
  onSelect: (id: string) => void;
  error?: string | null;
};

export default function ModelSelector({ models, selected, onSelect, error }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // বাইরে ক্লিক বা Esc চাপলে বন্ধ
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (error) {
    return <span className="text-xs text-red-400">model লোড হয়নি</span>;
  }

  if (models.length === 0) {
    return <div className="h-9 w-36 animate-pulse rounded-lg bg-white/5" />;
  }

  const current = models.find((m) => m.id === selected);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-200 transition hover:bg-white/10"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="max-w-[10rem] truncate">{current?.name ?? "model বেছে নাও"}</span>
        <svg
          className={"h-4 w-4 text-slate-400 transition " + (open ? "rotate-180" : "")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="animate-fade-up absolute right-0 z-20 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl shadow-black/50"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Model
          </p>
          {models.map((m) => {
            const active = m.id === selected;
            return (
              <button
                key={m.id}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSelect(m.id);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition " +
                  (active ? "bg-indigo-500/15" : "hover:bg-white/5")
                }
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-slate-100">{m.name}</span>
                  <span className="block truncate text-xs text-slate-500">{m.id}</span>
                </span>
                {active && <span className="text-indigo-400">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}