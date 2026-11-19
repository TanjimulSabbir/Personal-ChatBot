export default function TypingIndicator() {
  return (
    <div className="animate-fade-up flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm">
        🤖
      </div>
      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3.5">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  );
}