const SUGGESTIONS = [
  "AI agent কী, সহজ ভাষায় বুঝিয়ে বলো",
  "Next.js আর React-এর পার্থক্য কী?",
  "আমাকে একটা প্রজেক্টের আইডিয়া দাও",
  "TypeScript শেখার সহজ রোডম্যাপ দাও",
];

type Props = { onPick: (text: string) => void };

export default function EmptyState({ onPick }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-3xl shadow-xl shadow-indigo-500/20">
        🤖
      </div>
      <h2 className="text-2xl font-semibold">কী জানতে চাও?</h2>
      <p className="mt-2 text-slate-400">নিচে লিখে শুরু করো, অথবা একটা প্রশ্ন বেছে নাও।</p>

      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-indigo-400/40 hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}